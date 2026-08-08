export type User = {
  id:number; fullName:string; username:string; email:string;
  status:string; roles:string[]; createdAt:string
};
export type Category = { id:number; name:string; description:string; status:string };
export type Quiz = {
  id:number; title:string; description:string; categoryId:number; category:string;
  difficulty:'EASY'|'MEDIUM'|'HARD'; durationMinutes:number;
  passingPercentage:number; status:string; questionCount:number
};
export type Page<T> = {
  content:T[]; totalElements:number; totalPages:number; number:number; size:number
};
export type AttemptQuestion = {
  id:number; text:string; marks:number;
  options:{id:number;text:string;order:number}[];
  selectedOptionId:number|null
};
export type AttemptStart = {
  attemptId:number; quizId:number; quizTitle:string;
  startedAt:string; expiresAt:string; questions:AttemptQuestion[]
};
export type AttemptResult = {
  attemptId:number; quizTitle:string; userName:string;
  score:number; maximumScore:number; percentage:number;
  totalQuestions:number; correctAnswers:number; incorrectAnswers:number;
  unansweredQuestions:number; passingPercentage:number;
  status:'PASS'|'FAIL'|null; timeTakenSeconds:number
};
