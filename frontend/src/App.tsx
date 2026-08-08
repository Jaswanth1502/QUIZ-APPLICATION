import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { ProtectedRoute, AdminRoute } from './routes/Guards';
import HomePage from './pages/public/HomePage';
import QuizCataloguePage from './pages/public/QuizCataloguePage';
import QuizDetailsPage from './pages/public/QuizDetailsPage';
import { LoginPage, RegisterPage } from './pages/public/AuthPages';
import { NotFoundPage, UnauthorizedPage } from './pages/public/StatusPages';
import { DashboardPage } from './pages/user/DashboardPage';
import { TakeQuizPage } from './pages/user/TakeQuizPage';
import { ResultPage } from './pages/user/ResultPage';
import { ReviewPage } from './pages/user/ReviewPage';
import { HistoryPage } from './pages/user/HistoryPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminQuizzesPage } from './pages/admin/AdminQuizzesPage';
import { QuizEditorPage } from './pages/admin/QuizEditorPage';
import { AdminQuestionsPage } from './pages/admin/AdminQuestionsPage';
import { QuestionEditorPage } from './pages/admin/QuestionEditorPage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';

export default function App() {
  return <Routes>
    <Route element={<MainLayout/>}>
      <Route index element={<HomePage/>}/>
      <Route path="quizzes" element={<QuizCataloguePage/>}/>
      <Route path="quizzes/:id" element={<QuizDetailsPage/>}/>
      <Route path="login" element={<LoginPage/>}/>
      <Route path="register" element={<RegisterPage/>}/>
      <Route path="unauthorized" element={<UnauthorizedPage/>}/>

      <Route element={<ProtectedRoute/>}>
        <Route path="dashboard" element={<DashboardPage/>}/>
        <Route path="attempts/:attemptId" element={<TakeQuizPage/>}/>
        <Route path="attempts/:attemptId/result" element={<ResultPage/>}/>
        <Route path="attempts/:attemptId/review" element={<ReviewPage/>}/>
        <Route path="history" element={<HistoryPage/>}/>
        <Route path="profile" element={<ProfilePage/>}/>

        <Route element={<AdminRoute/>}>
          <Route path="admin" element={<AdminDashboardPage/>}/>
          <Route path="admin/users" element={<AdminUsersPage/>}/>
          <Route path="admin/categories" element={<AdminCategoriesPage/>}/>
          <Route path="admin/quizzes" element={<AdminQuizzesPage/>}/>
          <Route path="admin/quizzes/new" element={<QuizEditorPage/>}/>
          <Route path="admin/quizzes/:quizId/edit" element={<QuizEditorPage/>}/>
          <Route path="admin/questions" element={<AdminQuestionsPage/>}/>
          <Route path="admin/questions/new" element={<QuestionEditorPage/>}/>
          <Route path="admin/questions/:questionId/edit" element={<QuestionEditorPage/>}/>
          <Route path="admin/results" element={<AdminResultsPage/>}/>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage/>}/>
    </Route>
  </Routes>;
}
