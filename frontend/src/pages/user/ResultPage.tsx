import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/client';
import { Loading } from '../../components/common/Loading';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import type { AttemptResult } from '../../types';

export function ResultPage() {
  const { attemptId = '' } = useParams();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get(`/attempts/${attemptId}/result`)
      .then(({ data }) => setResult(data))
      .catch(e => setError(e.response?.data?.message ?? 'Unable to load the result.'));
  }, [attemptId]);

  if (!result && !error) return <Loading label="Calculating result..." />;
  if (!result) return <section className="container-page py-10"><ErrorAlert message={error} /></section>;

  const pass = result.status === 'PASS';
  return <section className="container-page py-10">
    <div className="card max-w-3xl mx-auto overflow-hidden">
      <div className={`p-8 text-center ${pass ? 'bg-[#ebefed] border-b border-[#d0c5af]' : 'bg-[#ffdad6]/60 border-b border-[#8A2E2E]'}`}>
        <span className={`badge ${pass ? '!bg-[#d0e9d6] !text-[#364c3e] !border-[#5B7564]' : '!bg-[#ffdad6] !text-[#8A2E2E] !border-[#8A2E2E]'}`}>{result.status}</span>
        <h1 className="font-serif text-3xl font-bold text-[#181c1b] mt-4">{result.quizTitle}</h1>
        <p className="font-sans text-[#4d4635] mt-1 font-medium">{result.userName}</p>
        <p className="font-serif text-6xl font-bold text-[#181c1b] mt-5">{Number(result.percentage).toFixed(1)}%</p>
        <p className="font-sans text-sm font-semibold text-[#4d4635] mt-2">{result.score} / {result.maximumScore} marks</p>
      </div>
      <div className="p-7 md:p-9">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-[#f1f4f2] p-4 rounded-xl border border-[#d0c5af]"><strong className="text-2xl font-bold block text-[#181c1b]">{result.totalQuestions}</strong><span className="text-xs font-bold uppercase tracking-wider text-[#4d4635]">Questions</span></div>
          <div className="bg-[#d0e9d6]/60 p-4 rounded-xl border border-[#5B7564]"><strong className="text-2xl font-bold block text-[#364c3e]">{result.correctAnswers}</strong><span className="text-xs font-bold uppercase tracking-wider text-[#364c3e]">Correct</span></div>
          <div className="bg-[#ffdad6]/60 p-4 rounded-xl border border-[#8A2E2E]"><strong className="text-2xl font-bold block text-[#8A2E2E]">{result.incorrectAnswers}</strong><span className="text-xs font-bold uppercase tracking-wider text-[#8A2E2E]">Incorrect</span></div>
          <div className="bg-[#f1f4f2] p-4 rounded-xl border border-[#d0c5af]"><strong className="text-2xl font-bold block text-[#181c1b]">{result.unansweredQuestions}</strong><span className="text-xs font-bold uppercase tracking-wider text-[#4d4635]">Unanswered</span></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-7 p-4 bg-[#f1f4f2] rounded-xl border border-[#d0c5af] text-sm font-medium text-[#181c1b]">
          <p><strong className="font-bold">Passing score:</strong> {result.passingPercentage}%</p>
          <p><strong className="font-bold">Time taken:</strong> {Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link className="btn btn-primary" to={`/attempts/${attemptId}/review`}>Review answers</Link>
          <Link className="btn btn-secondary" to="/dashboard">Return to dashboard</Link>
        </div>
      </div>
    </div>
  </section>;
}
