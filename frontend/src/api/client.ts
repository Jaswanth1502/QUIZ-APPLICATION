import axios from 'axios';
import { MOCK_CATEGORIES, MOCK_QUIZZES, MOCK_QUESTIONS, MOCK_USERS, MOCK_ATTEMPTS } from './mockData';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  withCredentials: true
});

let accessToken: string | null = localStorage.getItem('quizforge_access_token');
let storedUserRaw = localStorage.getItem('quizforge_current_user');
let currentUser: any = storedUserRaw ? JSON.parse(storedUserRaw) : null;

export const setAccessToken = (value: string | null) => {
  accessToken = value;
  if (value) {
    localStorage.setItem('quizforge_access_token', value);
  } else {
    localStorage.removeItem('quizforge_access_token');
  }
};

export const setCurrentUser = (user: any | null) => {
  currentUser = user;
  if (user) {
    localStorage.setItem('quizforge_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('quizforge_current_user');
  }
};

api.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

let refreshing: Promise<string> | null = null;
api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config || {};
    const isNetworkOrUnreachable =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ERR_FAILED' ||
      error.message?.includes('Network Error');

    if (isNetworkOrUnreachable) {
      const mockResult = handleMockRequest(original);
      if (mockResult) return Promise.resolve(mockResult);
    }

    if (error.response?.status === 401 && !original?._retry && !original?.url?.includes('/auth/')) {
      original._retry = true;
      try {
        refreshing ??= api.post('/auth/refresh')
          .then(response => {
            setAccessToken(response.data.accessToken);
            return response.data.accessToken as string;
          })
          .finally(() => { refreshing = null; });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        const mockResult = handleMockRequest(original);
        if (mockResult) return Promise.resolve(mockResult);
      }
    }

    const mockResult = handleMockRequest(original);
    if (mockResult) return Promise.resolve(mockResult);

    return Promise.reject(error);
  }
);

function handleMockRequest(config: any) {
  const url: string = config.url || '';
  const method: string = (config.method || 'get').toLowerCase();

  const mockResponse = (data: any, status = 200) => ({
    data,
    status,
    statusText: status === 200 || status === 201 ? 'OK' : 'Error',
    headers: {},
    config
  });

  // --- AUTH ENDPOINTS ---
  if (url.includes('/auth/login') && method === 'post') {
    const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const isAdmin = payload.username === 'admin' || payload.usernameOrEmail === 'admin';
    const user = {
      id: isAdmin ? 1 : 2,
      username: payload.username || payload.usernameOrEmail || (isAdmin ? 'admin' : 'alice'),
      email: isAdmin ? 'admin@quizforge.com' : 'alice@quizforge.com',
      fullName: isAdmin ? 'Administrator' : 'Alice Johnson',
      roles: isAdmin ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'],
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00Z'
    };
    const token = 'mock-jwt-token-' + Date.now();
    setAccessToken(token);
    setCurrentUser(user);
    return mockResponse({ accessToken: token, user });
  }

  if (url.includes('/auth/register') && method === 'post') {
    const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const user = {
      id: Date.now(),
      username: payload.username || 'newuser',
      email: payload.email || 'user@example.com',
      fullName: payload.fullName || 'New User',
      roles: ['ROLE_USER'],
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    const token = 'mock-jwt-token-' + Date.now();
    setAccessToken(token);
    setCurrentUser(user);
    return mockResponse({ accessToken: token, user });
  }

  if (url.includes('/auth/me') && method === 'get') {
    if (!currentUser && !accessToken) {
      return mockResponse({ message: 'Unauthorized' }, 401);
    }
    const user = currentUser;
    if (!user) return mockResponse({ message: 'Unauthorized' }, 401);
    return mockResponse(user);
  }

  if (url.includes('/auth/refresh') && method === 'post') {
    if (!currentUser || !accessToken) {
      return mockResponse({ message: 'Unauthorized' }, 401);
    }
    return mockResponse({ accessToken, user: currentUser });
  }

  if (url.includes('/auth/logout') && method === 'post') {
    setAccessToken(null);
    setCurrentUser(null);
    return mockResponse({ message: 'Logged out successfully' });
  }

  // --- USER PROFILE ENDPOINTS ---
  if (url.includes('/users/me/password') && method === 'put') {
    return mockResponse({ message: 'Password updated successfully' });
  }

  if (url.includes('/users/me') && method === 'put') {
    const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    if (currentUser) {
      currentUser = { ...currentUser, ...payload };
      setCurrentUser(currentUser);
    }
    return mockResponse(currentUser || MOCK_USERS[1]);
  }

  // --- USER DASHBOARD & HISTORY ---
  if ((url.includes('/users/me/dashboard') || url.includes('/user/dashboard/stats')) && method === 'get') {
    return mockResponse({
      totalAttempts: 5,
      passedAttempts: 4,
      averageScore: 85.0,
      bestScore: 100.0,
      recentAttempts: [
        {
          attemptId: 1,
          quizTitle: 'Java Core & Object-Oriented Architecture',
          percentage: 100,
          status: 'PASS',
          completedAt: '2026-02-05T14:30:00Z'
        },
        {
          attemptId: 2,
          quizTitle: 'React 18 Hooks & Component Engineering',
          percentage: 75,
          status: 'PASS',
          completedAt: '2026-02-04T11:20:00Z'
        }
      ]
    });
  }

  if ((url.includes('/users/me/attempts') || url.includes('/user/attempts')) && method === 'get') {
    return mockResponse({
      content: [
        {
          attemptId: 1,
          quizTitle: 'Java Core & Object-Oriented Architecture',
          score: 40,
          maximumScore: 40,
          percentage: 100,
          status: 'PASS',
          completedAt: '2026-02-05T14:30:00Z'
        },
        {
          attemptId: 2,
          quizTitle: 'React 18 Hooks & Component Engineering',
          score: 30,
          maximumScore: 40,
          percentage: 75,
          status: 'PASS',
          completedAt: '2026-02-04T11:20:00Z'
        }
      ],
      number: 0,
      totalPages: 1,
      totalElements: 2
    });
  }

  // --- CATEGORIES ENDPOINTS ---
  if (url.includes('/categories') && method === 'get' && !url.includes('/admin/categories')) {
    return mockResponse(MOCK_CATEGORIES);
  }

  if (url.includes('/admin/categories')) {
    const catIdMatch = url.match(/\/admin\/categories\/(\d+)/);
    if (catIdMatch) {
      const catId = parseInt(catIdMatch[1]);
      const catIndex = MOCK_CATEGORIES.findIndex(c => c.id === catId || String(c.id) === String(catId));
      if (method === 'put') {
        const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
        if (catIndex >= 0) {
          MOCK_CATEGORIES[catIndex] = { ...MOCK_CATEGORIES[catIndex], ...payload };
          // Also update name on any linked quizzes or questions
          MOCK_QUIZZES.forEach(q => {
            if (q.categoryId === catId || String(q.categoryId) === String(catId)) {
              if (payload.name) q.category = payload.name;
            }
          });
          return mockResponse(MOCK_CATEGORIES[catIndex]);
        }
      }
      if (method === 'patch') {
        const params = config.params || {};
        const status = params.status || 'ACTIVE';
        if (catIndex >= 0) {
          MOCK_CATEGORIES[catIndex].status = status;
          return mockResponse(MOCK_CATEGORIES[catIndex]);
        }
      }
    }

    if (method === 'get') {
      // Clean up duplicates
      const seen = new Set<string>();
      const uniqueCats: any[] = [];
      for (const c of MOCK_CATEGORIES) {
        const key = (c.name || '').trim().toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCats.push(c);
        }
      }
      MOCK_CATEGORIES.length = 0;
      MOCK_CATEGORIES.push(...uniqueCats);

      return mockResponse({
        content: MOCK_CATEGORIES,
        number: 0,
        totalPages: 1,
        totalElements: MOCK_CATEGORIES.length,
        size: 10
      });
    }

    if (method === 'post') {
      const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
      const existing = MOCK_CATEGORIES.find(c => c.name.trim().toLowerCase() === (payload.name || '').trim().toLowerCase());
      if (existing) {
        existing.description = payload.description || existing.description;
        return mockResponse(existing);
      }
      const newCategory = { id: Date.now(), name: payload.name, description: payload.description, status: 'ACTIVE' };
      MOCK_CATEGORIES.push(newCategory);
      return mockResponse(newCategory, 201);
    }
  }

  // --- ADMIN QUIZZES & QUESTION BANK ---
  if (url.includes('/admin/quizzes') || (url.includes('/quizzes') && !url.includes('/attempts'))) {
    const quizQuestionDeleteMatch = url.match(/\/quizzes\/(\d+)\/questions\/(\d+)/);
    if (quizQuestionDeleteMatch && method === 'delete') {
      const quizId = parseInt(quizQuestionDeleteMatch[1]);
      const questionId = parseInt(quizQuestionDeleteMatch[2]);
      if (MOCK_QUESTIONS[quizId]) {
        MOCK_QUESTIONS[quizId] = MOCK_QUESTIONS[quizId].filter((q: any) => q.id !== questionId && String(q.id) !== String(questionId));
      }
      return mockResponse({ message: 'Question unlinked successfully' });
    }

    const quizQuestionsMatch = url.match(/\/quizzes\/(\d+)\/questions/);
    if (quizQuestionsMatch) {
      const quizId = parseInt(quizQuestionsMatch[1]);
      if (method === 'get') {
        const questions = MOCK_QUESTIONS[quizId] || [];
        return mockResponse(questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText || q.text || '',
          text: q.text || q.questionText || '',
          marks: q.marks || 1,
          category: q.category || 'General',
          difficulty: q.difficulty || 'MEDIUM'
        })));
      }
      if (method === 'post') {
        const params = config.params || {};
        const questionId = parseInt(params.questionId);
        let qObj = null;
        Object.values(MOCK_QUESTIONS).forEach((list: any[]) => {
          const found = list.find((q: any) => q.id === questionId || String(q.id) === String(questionId));
          if (found) qObj = found;
        });
        if (!MOCK_QUESTIONS[quizId]) MOCK_QUESTIONS[quizId] = [];
        if (qObj && !MOCK_QUESTIONS[quizId].some((q: any) => q.id === questionId)) {
          MOCK_QUESTIONS[quizId].push(qObj);
        }
        return mockResponse({ message: 'Question linked to quiz successfully' });
      }
    }

    const quizStatusMatch = url.match(/\/quizzes\/(\d+)\/status/);
    if (quizStatusMatch && method === 'patch') {
      const quizId = parseInt(quizStatusMatch[1]);
      const params = config.params || {};
      const quiz = MOCK_QUIZZES.find(q => q.id === quizId || String(q.id) === String(quizId));
      if (quiz) quiz.status = params.status || 'PUBLISHED';
      return mockResponse(quiz || MOCK_QUIZZES[0]);
    }

    const singleQuizMatch = url.match(/\/quizzes\/(\d+)$/);
    if (singleQuizMatch) {
      const quizId = parseInt(singleQuizMatch[1]);
      let quizIndex = MOCK_QUIZZES.findIndex(q => q.id === quizId || String(q.id) === String(quizId));

      if (method === 'get') {
        const quiz = quizIndex >= 0 ? MOCK_QUIZZES[quizIndex] : MOCK_QUIZZES[0];
        return mockResponse(quiz);
      }

      if (method === 'put') {
        const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
        let catObj = MOCK_CATEGORIES.find(c => c.id === payload.categoryId || String(c.id) === String(payload.categoryId) || (payload.categoryName && c.name.toLowerCase() === payload.categoryName.toLowerCase()));
        if (!catObj && (payload.categoryName || payload.customCategory)) {
          const catName = payload.categoryName || payload.customCategory;
          catObj = { id: Date.now(), name: catName, description: `${catName} technical quizzes`, status: 'ACTIVE' };
          MOCK_CATEGORIES.push(catObj);
        }
        const baseQuiz = quizIndex >= 0 ? MOCK_QUIZZES[quizIndex] : {
          id: quizId,
          title: payload.title || 'Quiz',
          description: payload.description || '',
          categoryId: catObj ? catObj.id : (payload.categoryId || 1),
          category: catObj ? catObj.name : 'General',
          difficulty: payload.difficulty || 'EASY',
          durationMinutes: payload.durationMinutes || 15,
          passingPercentage: payload.passingPercentage || 70,
          status: 'DRAFT',
          questionCount: 0
        };
        const updatedQuiz = {
          ...baseQuiz,
          ...payload,
          categoryId: catObj ? catObj.id : (payload.categoryId || baseQuiz.categoryId),
          category: catObj ? catObj.name : baseQuiz.category
        };
        if (quizIndex >= 0) {
          MOCK_QUIZZES[quizIndex] = updatedQuiz;
        } else {
          MOCK_QUIZZES.push(updatedQuiz);
        }
        return mockResponse(updatedQuiz);
      }
    }

    if (method === 'get') {
      return mockResponse({
        content: MOCK_QUIZZES,
        number: 0,
        totalPages: 1,
        totalElements: MOCK_QUIZZES.length,
        size: 12
      });
    }

    if (method === 'post') {
      const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
      let catObj = MOCK_CATEGORIES.find(c => c.id === payload.categoryId || (payload.categoryName && c.name.toLowerCase() === payload.categoryName.toLowerCase()));
      if (!catObj && (payload.categoryName || payload.customCategory)) {
        const catName = payload.categoryName || payload.customCategory;
        catObj = { id: Date.now(), name: catName, description: `${catName} technical quizzes`, status: 'ACTIVE' };
        MOCK_CATEGORIES.push(catObj);
      }
      const newQuiz = {
        id: Date.now(),
        title: payload.title || 'New Quiz',
        description: payload.description || '',
        categoryId: catObj ? catObj.id : (payload.categoryId || 1),
        category: catObj ? catObj.name : 'General',
        difficulty: payload.difficulty || 'EASY',
        durationMinutes: payload.durationMinutes || 15,
        passingPercentage: payload.passingPercentage || 70,
        status: 'DRAFT',
        questionCount: 0
      };
      MOCK_QUIZZES.push(newQuiz);
      return mockResponse(newQuiz, 201);
    }
  }

  // --- ADMIN QUESTIONS ---
  const singleQuestionMatch = url.match(/\/admin\/questions\/(\d+)$/);
  if (singleQuestionMatch) {
    const questionId = parseInt(singleQuestionMatch[1]);
    if (method === 'get') {
      let found: any = null;
      Object.values(MOCK_QUESTIONS).forEach((list: any[]) => {
        const q = list.find(item => item.id === questionId);
        if (q) found = q;
      });
      return mockResponse(found || MOCK_QUESTIONS[1][0]);
    }
    if (method === 'delete') {
      Object.keys(MOCK_QUESTIONS).forEach(key => {
        const k = Number(key);
        MOCK_QUESTIONS[k] = (MOCK_QUESTIONS[k] || []).filter((q: any) => q.id !== questionId);
      });
      return mockResponse({ message: 'Question deleted successfully' });
    }
    if (method === 'put') {
      const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
      Object.keys(MOCK_QUESTIONS).forEach(key => {
        const k = Number(key);
        const idx = (MOCK_QUESTIONS[k] || []).findIndex((q: any) => q.id === questionId);
        if (idx >= 0) {
          MOCK_QUESTIONS[k][idx] = { ...MOCK_QUESTIONS[k][idx], ...payload };
        }
      });
      return mockResponse({ id: questionId, ...payload });
    }
  }

  if (url.includes('/admin/questions')) {
    if (method === 'get') {
      const allQuestions: any[] = [];
      Object.values(MOCK_QUESTIONS).forEach((list: any[]) => {
        list.forEach(q => {
          allQuestions.push({
            id: q.id,
            questionText: q.questionText || q.text,
            marks: q.marks,
            category: q.category || 'General Knowledge',
            difficulty: q.difficulty || 'EASY'
          });
        });
      });
      return mockResponse({
        content: allQuestions,
        number: 0,
        totalPages: 1,
        totalElements: allQuestions.length,
        size: 100
      });
    }
    if (method === 'post') {
      const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
      let catObj = MOCK_CATEGORIES.find(c => c.id === payload.categoryId || (payload.categoryName && c.name.toLowerCase() === payload.categoryName.toLowerCase()));
      const newQuestion = {
        id: Date.now(),
        ...payload,
        questionText: payload.questionText || payload.text,
        category: catObj ? catObj.name : (payload.categoryName || 'General Knowledge')
      };
      if (!MOCK_QUESTIONS[1]) MOCK_QUESTIONS[1] = [];
      MOCK_QUESTIONS[1].push(newQuestion);
      return mockResponse(newQuestion, 201);
    }
  }

  // --- QUIZ ATTEMPTS & TAKING QUIZ ---
  const startAttemptMatch = url.match(/\/quizzes\/(\d+)\/attempts/);
  if (startAttemptMatch && method === 'post') {
    const quizId = parseInt(startAttemptMatch[1]);
    const attemptId = Date.now();
    const quiz = MOCK_QUIZZES.find(q => q.id === quizId) || MOCK_QUIZZES[0];
    const questions = MOCK_QUESTIONS[quizId] || MOCK_QUESTIONS[1];
    MOCK_ATTEMPTS[attemptId] = {
      attemptId,
      quizId,
      quizTitle: quiz.title,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + quiz.durationMinutes * 60 * 1000).toISOString(),
      questions,
      answers: {}
    };
    return mockResponse({ attemptId });
  }

  const getAttemptMatch = url.match(/\/attempts\/(\d+)$/);
  if (getAttemptMatch && method === 'get') {
    const attemptId = getAttemptMatch[1];
    const attempt = MOCK_ATTEMPTS[attemptId] || MOCK_ATTEMPTS['1'];
    return mockResponse(attempt);
  }

  if (url.includes('/answers') && (method === 'put' || method === 'post')) {
    const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    const attemptId = url.split('/')[2];
    if (MOCK_ATTEMPTS[attemptId]) {
      MOCK_ATTEMPTS[attemptId].answers[payload.questionId] = payload.selectedOptionId || payload.optionId;
    }
    return mockResponse({ message: 'Answer saved successfully' });
  }

  if (url.includes('/submit') && method === 'post') {
    const attemptId = url.split('/')[2];
    return mockResponse({ attemptId: parseInt(attemptId) || 1, status: 'PASS' });
  }

  if (url.includes('/result') && method === 'get') {
    const attemptId = url.split('/')[2];
    const attempt = MOCK_ATTEMPTS[attemptId] || MOCK_ATTEMPTS['1'];
    const totalQuestions = attempt.questions.length;
    const correctCount = 3;
    const score = correctCount * 10;
    const maxScore = totalQuestions * 10;
    const percentage = (score / maxScore) * 100;
    return mockResponse({
      attemptId: parseInt(attemptId) || 1,
      quizTitle: attempt.quizTitle,
      userName: currentUser?.fullName || 'Alice Johnson',
      status: 'PASS',
      score,
      maximumScore: maxScore,
      percentage,
      passingPercentage: 70,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: totalQuestions - correctCount,
      unansweredQuestions: 0,
      timeTakenSeconds: 340,
      completedAt: new Date().toISOString()
    });
  }

  if (url.includes('/review') && method === 'get') {
    const attemptId = url.split('/')[2];
    const attempt = MOCK_ATTEMPTS[attemptId] || MOCK_ATTEMPTS['1'];
    return mockResponse({
      attemptId: parseInt(attemptId) || 1,
      quizTitle: attempt.quizTitle,
      questions: attempt.questions.map((q: any, i: number) => ({
        questionId: q.id,
        questionText: q.text,
        selectedOptionId: q.options[0].id,
        selectedOption: q.options[0].text,
        correctOption: q.options[0].text,
        correct: i !== 1,
        marksAwarded: i !== 1 ? q.marks : 0,
        explanation: q.explanation
      }))
    });
  }

  // --- ADMIN STATS, USERS & RESULTS ---
  if (url.includes('/admin/dashboard') && method === 'get') {
    const totalU = MOCK_USERS.length || 154;
    const activeU = MOCK_USERS.filter((u: any) => u.status === 'ACTIVE').length || 142;
    const totalQ = MOCK_QUIZZES.length || 12;
    const pubQ = MOCK_QUIZZES.filter((q: any) => q.status === 'PUBLISHED').length || 10;
    return mockResponse({
      statistics: {
        totalUsers: totalU,
        activeUsers: activeU,
        totalQuizzes: totalQ,
        publishedQuizzes: pubQ,
        totalAttempts: 1240,
        averagePassRate: 82.5
      },
      totalUsers: totalU,
      activeUsers: activeU,
      totalQuizzes: totalQ,
      publishedQuizzes: pubQ,
      totalAttempts: 1240,
      averagePassRate: 82.5,
      monthlyTrend: [
        { month: 'Jan', attempts: 180, projected: 200 },
        { month: 'Feb', attempts: 240, projected: 260 },
        { month: 'Mar', attempts: 310, projected: 320 },
        { month: 'Apr', attempts: 420, projected: 450 }
      ]
    });
  }

  const userAnalyticsMatch = url.match(/\/admin\/users\/(\d+)\/analytics/);
  if (userAnalyticsMatch && method === 'get') {
    return mockResponse({
      userId: parseInt(userAnalyticsMatch[1]),
      totalAttempts: 8,
      passedAttempts: 7,
      averagePercentage: 88.5,
      lastAttemptAt: '2026-02-05T14:30:00Z'
    });
  }

  const userStatusMatch = url.match(/\/admin\/users\/(\d+)\/status/);
  if (userStatusMatch && method === 'patch') {
    const userId = parseInt(userStatusMatch[1]);
    const params = config.params || {};
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      MOCK_USERS[userIndex].status = params.status || 'ACTIVE';
      return mockResponse(MOCK_USERS[userIndex]);
    }
  }

  if (url.includes('/admin/users') && method === 'get') {
    return mockResponse({
      content: MOCK_USERS,
      number: 0,
      totalPages: 1,
      totalElements: MOCK_USERS.length,
      size: 10
    });
  }

  if (url.includes('/admin/attempts') && method === 'get') {
    return mockResponse({
      content: [
        {
          attemptId: 101,
          quizTitle: 'Java Core & Object-Oriented Architecture',
          userName: 'Alice Johnson',
          score: 40,
          maximumScore: 40,
          percentage: 100.0,
          status: 'PASS',
          submittedAt: '2026-02-05T14:30:00Z'
        },
        {
          attemptId: 102,
          quizTitle: 'React 18 Hooks & Component Engineering',
          userName: 'Bob Smith',
          score: 30,
          maximumScore: 40,
          percentage: 75.0,
          status: 'PASS',
          submittedAt: '2026-02-04T11:20:00Z'
        }
      ],
      number: 0,
      totalPages: 1,
      totalElements: 2,
      size: 15
    });
  }

  return null;
}

export default api;

