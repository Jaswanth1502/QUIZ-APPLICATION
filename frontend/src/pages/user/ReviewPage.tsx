import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/client';
import { Loading } from '../../components/common/Loading';
import { ErrorAlert } from '../../components/common/ErrorAlert';

type Review = {
  attemptId:number; quizTitle:string;
  questions:{
    questionId:number; questionText:string; selectedOptionId:number|null;
    selectedOption:string|null; correctOption:string; correct:boolean;
    marksAwarded:number; explanation:string;
  }[];
};

export function ReviewPage() {
  const { attemptId = '' } = useParams();
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(`/attempts/${attemptId}/review`).then(({ data }) => setReview(data))
      .catch(e => setError(e.response?.data?.message ?? 'Unable to load answer review.'));
  }, [attemptId]);
  if (!review && !error) return <Loading label="Loading answer review..." />;
  if (!review) return <section className="container-page py-10"><ErrorAlert message={error} /></section>;

  return <section className="container-page py-10">
    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
      <div><span className="badge">Answer review</span><h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b] mt-3">{review.quizTitle}</h1></div>
      <Link className="btn btn-secondary h-fit" to={`/attempts/${attemptId}/result`}>Back to result</Link>
    </div>
    <div className="space-y-6">
      {review.questions.map((q, i) => <article key={q.questionId} className={`card p-7 md:p-8 border-l-4 ${q.correct ? '!border-l-[#5B7564]' : '!border-l-[#8A2E2E]'}`}>
        <div className="flex justify-between items-start gap-4">
          <h2 className="font-serif font-bold text-lg text-[#181c1b]">{i + 1}. {q.questionText}</h2>
          <span className={`badge shrink-0 ${q.correct ? '!bg-[#d0e9d6] !text-[#364c3e] !border-[#5B7564]' : '!bg-[#ffdad6] !text-[#8A2E2E] !border-[#8A2E2E]'}`}>{q.correct ? 'Correct' : 'Incorrect'}</span>
        </div>
        <dl className="grid md:grid-cols-2 gap-4 mt-5">
          <div className="bg-[#f1f4f2] rounded-xl border border-[#d0c5af] p-4"><dt className="font-sans font-bold text-xs uppercase tracking-wider text-[#4d4635]">Your answer</dt><dd className="mt-1 font-medium text-[#181c1b]">{q.selectedOption ?? 'Not answered'}</dd></div>
          <div className="bg-[#d0e9d6]/60 rounded-xl border border-[#5B7564] p-4"><dt className="font-sans font-bold text-xs uppercase tracking-wider text-[#364c3e]">Correct answer</dt><dd className="mt-1 font-medium text-[#364c3e]">{q.correctOption}</dd></div>
        </dl>
        {q.explanation && <div className="mt-5 p-4 bg-[#f1f4f2] rounded-xl border border-[#d0c5af] text-sm font-sans text-[#4d4635]"><strong className="font-bold text-[#181c1b]">Explanation:</strong> {q.explanation}</div>}
      </article>)}
    </div>
  </section>;
}
