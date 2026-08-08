import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { Loading } from '../../components/common/Loading';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import type { AttemptStart } from '../../types';

function secondsUntil(value: string) {
  return Math.max(0, Math.floor((new Date(value).getTime() - Date.now()) / 1000));
}
function clock(value: number) {
  const minutes = Math.floor(value / 60).toString().padStart(2, '0');
  const seconds = (value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function TakeQuizPage() {
  const { attemptId = '' } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptStart | null>(null);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const currentAttempt = useRef<AttemptStart | null>(null);

  useEffect(() => {
    api.get(`/attempts/${attemptId}`).then(({ data }) => {
      setAttempt(data);
      currentAttempt.current = data;
      setRemaining(secondsUntil(data.expiresAt));
    }).catch(e => setError(e.response?.data?.message ?? 'Unable to load this attempt.'));
  }, [attemptId]);

  useEffect(() => {
    currentAttempt.current = attempt;
  }, [attempt]);

  const submit = useCallback(async (automatic = false) => {
    const active = currentAttempt.current;
    if (!active || submitting.current) return;
    const answered = active.questions.filter(q => q.selectedOptionId != null).length;
    if (!automatic && !window.confirm(
      `Submit now? Answered: ${answered}. Unanswered: ${active.questions.length - answered}.`
    )) return;
    submitting.current = true;
    try {
      await api.post(`/attempts/${attemptId}/submit`);
      navigate(`/attempts/${attemptId}/result`, { replace: true });
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Submission failed.');
      submitting.current = false;
    }
  }, [attemptId, navigate]);

  useEffect(() => {
    if (!attempt) return;
    const timer = window.setInterval(() => {
      const next = secondsUntil(attempt.expiresAt);
      setRemaining(next);
      if (next <= 0) {
        window.clearInterval(timer);
        void submit(true);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [attempt, submit]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!submitting.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);

  const answered = useMemo(
    () => attempt?.questions.filter(q => q.selectedOptionId != null).length ?? 0,
    [attempt]
  );

  async function choose(questionId: number, optionId: number) {
    if (!attempt || saving || remaining <= 0) return;
    setSaving(true);
    setAttempt(previous => previous ? {
      ...previous,
      questions: previous.questions.map(q =>
        q.id === questionId ? { ...q, selectedOptionId: optionId } : q
      )
    } : previous);
    try {
      await api.put(`/attempts/${attemptId}/answers`, { questionId, selectedOptionId: optionId });
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'The answer could not be saved.');
      await api.get(`/attempts/${attemptId}`).then(({ data }) => setAttempt(data)).catch(() => undefined);
    } finally {
      setSaving(false);
    }
  }

  if (!attempt && !error) return <Loading label="Preparing your quiz..." />;
  if (!attempt) return <section className="container-page py-10"><ErrorAlert message={error} /></section>;

  const question = attempt.questions[index];
  const progress = attempt.questions.length ? (answered / attempt.questions.length) * 100 : 0;

  return <section className="container-page py-8">
    <ErrorAlert message={error} />
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#735c00]">Timed Assessment</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181c1b]">{attempt.quizTitle}</h1>
      </div>
      <div className={`card px-5 py-2.5 font-serif font-bold text-2xl rounded-2xl ${remaining < 60 ? 'text-[#8A2E2E] bg-[#ffdad6]' : 'text-[#735c00] bg-[#ffffff]'}`} aria-live="polite">
        {clock(remaining)}
      </div>
    </div>
    {/* Emerald Oasis Progress Bar */}
    <div className="h-2 rounded-full bg-[#d0e9d6] overflow-hidden mb-6 border border-[#5B7564]" aria-label={`${answered} of ${attempt.questions.length} answered`}>
      <div className="h-full bg-[#D4AF37] transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>
    <div className="grid lg:grid-cols-[1fr_280px] gap-6">
      <article className="card p-7 md:p-9">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#5B7564] mb-3">Question {index + 1} of {attempt.questions.length} · {question.marks} mark(s)</p>
        <h2 className="font-serif text-xl md:text-2xl font-bold text-[#181c1b] leading-snug">{question.text}</h2>
        <fieldset className="mt-7 space-y-3">
          <legend className="sr-only">Choose one answer</legend>
          {question.options.map(option => <label key={option.id}
            className={`flex gap-3.5 items-center min-h-[52px] border rounded-xl p-4 cursor-pointer transition-all ${question.selectedOptionId === option.id ? 'border-2 border-[#D4AF37] bg-[#f1f4f2] shadow-xs' : 'border-[#7f7663] bg-[#ffffff] hover:border-[#181c1b]'}`}>
            <input type="radio" name={`question-${question.id}`}
              checked={question.selectedOptionId === option.id}
              onChange={() => void choose(question.id, option.id)}
              disabled={saving || remaining <= 0}
              className="accent-[#735c00] h-4 w-4" />
            <span className="font-sans text-sm font-medium text-[#181c1b]">{option.text}</span>
          </label>)}
        </fieldset>
        <div className="flex justify-between gap-3 mt-8 pt-5 border-t border-[#e0e3e1]">
          <button className="btn btn-secondary" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}>Previous</button>
          {index < attempt.questions.length - 1
            ? <button className="btn btn-primary" onClick={() => setIndex(i => i + 1)}>Next</button>
            : <button className="btn btn-primary" onClick={() => void submit(false)}>Submit quiz</button>}
        </div>
      </article>
      <aside className="card p-6 h-fit">
        <h2 className="font-serif text-lg font-bold text-[#181c1b]">Question navigator</h2>
        <p className="font-sans text-xs text-[#4d4635] mt-1">{answered} answered · {attempt.questions.length - answered} unanswered</p>
        <div className="grid grid-cols-5 gap-2 mt-4">
          {attempt.questions.map((q, i) => <button key={q.id} onClick={() => setIndex(i)}
            aria-label={`Question ${i + 1}${q.selectedOptionId ? ', answered' : ', unanswered'}`}
            className={`aspect-square rounded-xl font-sans font-bold text-xs border transition-all ${i === index ? 'ring-2 ring-[#D4AF37]' : ''} ${q.selectedOptionId ? 'bg-[#d0e9d6] border-[#5B7564] text-[#364c3e]' : 'bg-[#ffffff] border-[#7f7663] text-[#181c1b]'}`}>
            {i + 1}
          </button>)}
        </div>
        <button className="btn btn-primary w-full mt-6" onClick={() => void submit(false)} disabled={submitting.current}>Submit quiz</button>
        <p className="font-sans text-xs text-[#5B7564] mt-3">{saving ? 'Saving answer…' : 'Answers are saved to the server as you select them.'}</p>
      </aside>
    </div>
  </section>;
}
