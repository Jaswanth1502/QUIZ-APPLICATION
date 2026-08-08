import { Link } from 'react-router-dom';
import type { Quiz } from '../../types';

export default function QuizCard({quiz}:{quiz:Quiz}) {
  return <article className="card card-hover flex h-full flex-col p-6 sm:p-7">
    <div className="flex items-start justify-between gap-3">
      <span className="badge">{quiz.category}</span>
      <span className="text-xs font-bold text-[#5B7564] bg-[#ebefed] px-3 py-1 rounded-full border border-[#d0c5af]">{quiz.difficulty}</span>
    </div>
    <h3 className="mt-4 text-xl font-bold text-[#181c1b] tracking-tight">{quiz.title}</h3>
    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4d4635]">{quiz.description}</p>
    <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs bg-[#f1f4f2] p-3 rounded-xl border border-[#d0c5af]">
      <div><b className="text-sm text-[#181c1b] font-extrabold">{quiz.questionCount}</b><br/><span className="text-[#4d4635] font-medium">Questions</span></div>
      <div><b className="text-sm text-[#181c1b] font-extrabold">{quiz.durationMinutes}</b><br/><span className="text-[#4d4635] font-medium">Minutes</span></div>
      <div><b className="text-sm text-[#181c1b] font-extrabold">{quiz.passingPercentage}%</b><br/><span className="text-[#4d4635] font-medium">Pass</span></div>
    </div>
    <Link className="btn btn-primary mt-6" to={`/quizzes/${quiz.id}`}>View details</Link>
  </article>;
}
