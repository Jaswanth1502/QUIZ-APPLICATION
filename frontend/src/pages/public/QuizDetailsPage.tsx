import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import type { Quiz } from '../../types';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../context/AuthContext';

export default function QuizDetailsPage() {
  const {id} = useParams();
  const [quiz, setQuiz] = useState<Quiz|null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const {user} = useAuth();

  useEffect(() => {
    void api.get(`/quizzes/${id}`).then(response => setQuiz(response.data));
  }, [id]);

  if (!quiz) return <Loading/>;

  const start = async () => {
    if (!user) { navigate('/login'); return; }
    setBusy(true);
    try {
      const {data} = await api.post(`/quizzes/${id}/attempts`);
      navigate(`/attempts/${data.attemptId}`);
    } finally {
      setBusy(false);
    }
  };

  return <section className="container-page py-12">
    <div className="card p-8 md:p-10">
      <div className="flex items-center gap-3">
        <span className="badge">{quiz.category}</span>
        <span className="text-xs font-bold text-[#5B7564] bg-[#ebefed] px-3 py-1 rounded-full border border-[#d0c5af]">{quiz.difficulty}</span>
      </div>
      <h1 className="mt-4 font-serif text-3xl md:text-4xl font-bold text-[#181c1b]">{quiz.title}</h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-[#4d4635] text-base">{quiz.description}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3 text-center">
        <div className="bg-[#f1f4f2] p-4 rounded-xl border border-[#d0c5af]"><b className="text-2xl font-bold text-[#181c1b] block">{quiz.questionCount}</b><span className="text-xs font-bold uppercase tracking-wider text-[#4d4635]">questions</span></div>
        <div className="bg-[#f1f4f2] p-4 rounded-xl border border-[#d0c5af]"><b className="text-2xl font-bold text-[#181c1b] block">{quiz.durationMinutes}</b><span className="text-xs font-bold uppercase tracking-wider text-[#4d4635]">minutes</span></div>
        <div className="bg-[#f1f4f2] p-4 rounded-xl border border-[#d0c5af]"><b className="text-2xl font-bold text-[#181c1b] block">{quiz.passingPercentage}%</b><span className="text-xs font-bold uppercase tracking-wider text-[#4d4635]">passing score</span></div>
      </div>
      <div className="mt-8 rounded-xl bg-[#ebefed] border border-[#d0c5af] p-4 text-sm text-[#181c1b] font-medium">
        The timer starts immediately. Answers are saved as you select them.
        Leaving the page does not pause the official server timer.
      </div>
      <button className="btn btn-primary mt-8" disabled={busy} onClick={() => void start()}>
        {busy ? 'Starting…' : 'Start quiz'}
      </button>
    </div>
  </section>;
}
