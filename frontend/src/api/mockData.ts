import type { Category, Quiz, User } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Java Programming', description: 'Core Java concepts, OOP, Streams, and JVM internals', status: 'ACTIVE' },
  { id: 2, name: 'React & Frontend', description: 'React 18 hooks, state management, and modern Web APIs', status: 'ACTIVE' },
  { id: 3, name: 'Spring Boot Backend', description: 'REST APIs, Spring Security, JPA, and Architecture', status: 'ACTIVE' },
  { id: 4, name: 'Database & SQL', description: 'Relational data modeling, indexing, and SQL queries', status: 'ACTIVE' }
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 1,
    title: 'Java Core & Object-Oriented Architecture',
    description: 'Test your understanding of Java fundamentals, memory management, inheritance, and exception handling.',
    categoryId: 1,
    category: 'Java Programming',
    difficulty: 'EASY',
    status: 'PUBLISHED',
    durationMinutes: 15,
    passingPercentage: 70,
    questionCount: 4
  },
  {
    id: 2,
    title: 'React 18 Hooks & Component Engineering',
    description: 'Master React state management, useEffect dependencies, custom hooks, and virtual DOM rendering.',
    categoryId: 2,
    category: 'React & Frontend',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    durationMinutes: 20,
    passingPercentage: 75,
    questionCount: 4
  },
  {
    id: 3,
    title: 'Spring Boot REST & Security Architecture',
    description: 'Evaluation of Spring Security JWT filters, Spring Data JPA, and RESTful controller endpoints.',
    categoryId: 3,
    category: 'Spring Boot Backend',
    difficulty: 'HARD',
    status: 'PUBLISHED',
    durationMinutes: 25,
    passingPercentage: 80,
    questionCount: 4
  },
  {
    id: 4,
    title: 'MySQL Relational Schema & Query Optimization',
    description: 'Database indexing strategies, JOIN optimizations, ACID transactions, and schema normalization rules.',
    categoryId: 4,
    category: 'Database & SQL',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    durationMinutes: 20,
    passingPercentage: 75,
    questionCount: 4
  }
];

export const MOCK_QUESTIONS: Record<number, any[]> = {
  1: [
    {
      id: 101,
      text: 'Which keyword is used to prevent method overriding in Java?',
      marks: 10,
      options: [
        { id: 1001, text: 'final', order: 1 },
        { id: 1002, text: 'static', order: 2 },
        { id: 1003, text: 'abstract', order: 3 },
        { id: 1004, text: 'synchronized', order: 4 }
      ],
      selectedOptionId: null,
      explanation: 'The final keyword in Java prevents a method from being overridden by subclasses.'
    },
    {
      id: 102,
      text: 'What is the default initial capacity of an ArrayList in Java?',
      marks: 10,
      options: [
        { id: 1005, text: '10', order: 1 },
        { id: 1006, text: '16', order: 2 },
        { id: 1007, text: '0', order: 3 },
        { id: 1008, text: '8', order: 4 }
      ],
      selectedOptionId: null,
      explanation: 'ArrayList initializes with a default internal array capacity of 10 elements when no initial capacity is specified.'
    },
    {
      id: 103,
      text: 'Which memory area in JVM stores class structure definitions and static variables?',
      marks: 10,
      options: [
        { id: 1009, text: 'Metaspace / Method Area', order: 1 },
        { id: 1010, text: 'Heap Memory', order: 2 },
        { id: 1011, text: 'Java Stack', order: 3 },
        { id: 1012, text: 'Program Counter Register', order: 4 }
      ],
      selectedOptionId: null,
      explanation: 'Metaspace (formerly PermGen) stores class metadata, method data, and static variables.'
    },
    {
      id: 104,
      text: 'Which interface in Java java.util package represents a FIFO queue collection?',
      marks: 10,
      options: [
        { id: 1013, text: 'Queue', order: 1 },
        { id: 1014, text: 'Set', order: 2 },
        { id: 1015, text: 'Map', order: 3 },
        { id: 1016, text: 'List', order: 4 }
      ],
      selectedOptionId: null,
      explanation: 'Queue interface specifies First-In-First-Out behavior.'
    }
  ],
  2: [
    {
      id: 201,
      text: 'What hook should be used to perform side effects in functional components?',
      marks: 10,
      options: [
        { id: 2001, text: 'useEffect', order: 1 },
        { id: 2002, text: 'useState', order: 2 },
        { id: 2003, text: 'useMemo', order: 3 },
        { id: 2004, text: 'useContext', order: 4 }
      ],
      selectedOptionId: null,
      explanation: 'useEffect is designed to execute asynchronous tasks, subscriptions, and side effects.'
    },
    {
      id: 202,
      text: 'What parameter guarantees that useEffect executes only once after the initial render?',
      marks: 10,
      options: [
        { id: 2005, text: 'An empty dependency array []', order: 1 },
        { id: 2006, text: 'No dependency array', order: 2 },
        { id: 2007, text: 'null', order: 3 },
        { id: 2008, text: 'undefined', order: 4 }
      ],
      selectedOptionId: null,
      explanation: 'Providing [] as the second argument ensures effect runs only once after component mounting.'
    },
    {
      id: 203,
      text: 'What mechanism in React 18 allows deferred rendering of non-urgent state updates?',
      marks: 10,
      options: [
        { id: 2009, text: 'useTransition', order: 1 },
        { id: 2010, text: 'useRef', order: 2 },
        { id: 2011, text: 'useReducer', order: 3 },
        { id: 2012, text: 'useCallback', order: 4 }
      ],
      selectedOptionId: null,
      explanation: 'useTransition marks state updates as non-blocking transitions to keep UI responsive.'
    },
    {
      id: 204,
      text: 'Which key prop requirement prevents unnecessary DOM re-renders during list mapping?',
      marks: 10,
      options: [
        { id: 2013, text: 'Unique identifier per item', order: 1 },
        { id: 2014, text: 'Random Math.random()', order: 2 },
        { id: 2015, text: 'Array index for mutable lists', order: 3 },
        { id: 2016, text: 'Constant string', order: 4 }
      ],
      selectedOptionId: null,
      explanation: 'A stable unique key allows React reconciliation algorithm to identify added or moved items efficiently.'
    }
  ]
};

export const MOCK_USERS: User[] = [
  { id: 1, username: 'admin', email: 'admin@quizforge.com', fullName: 'Administrator', roles: ['ROLE_ADMIN', 'ROLE_USER'], status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
  { id: 2, username: 'alice', email: 'alice@quizforge.com', fullName: 'Alice Johnson', roles: ['ROLE_USER'], status: 'ACTIVE', createdAt: '2026-01-10T00:00:00Z' },
  { id: 3, username: 'bob', email: 'bob@quizforge.com', fullName: 'Bob Smith', roles: ['ROLE_USER'], status: 'ACTIVE', createdAt: '2026-01-12T00:00:00Z' }
];

export const MOCK_ATTEMPTS: Record<string, any> = {
  '1': {
    attemptId: 1,
    quizId: 1,
    quizTitle: 'Java Core & Object-Oriented Architecture',
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    questions: MOCK_QUESTIONS[1]
  }
};
