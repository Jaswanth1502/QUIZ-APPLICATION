import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Loading } from '../../components/common/Loading';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Pagination } from '../../components/common/Pagination';
import type { AttemptResult, Page } from '../../types';

export function HistoryPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<AttemptResult> | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    setError('');
    api.get('/users/me/attempts', { params: { page, size: 10, sort: 'submittedAt,desc' } })
      .then(({ data }) => setData(data))
      .catch(e => setError(e.response?.data?.message ?? 'Unable to load quiz history.'));
  }, [page]);
  return <section className="container-page py-10">
    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">Quiz history</h1>
    <p className="font-sans text-[#4d4635] text-sm mt-2 mb-8">Review your previous attempts and scores.</p>
    <ErrorAlert message={error} />
    {!data && !error ? <Loading /> : data && <div className="card p-7">
      {data.content.length ? <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Quiz</th><th>Score</th><th>Correct</th><th>Result</th><th>Actions</th></tr></thead>
          <tbody>{data.content.map(a => <tr key={a.attemptId}>
            <td className="font-sans font-bold text-[#181c1b]">{a.quizTitle}</td>
            <td className="font-serif font-bold text-[#181c1b]">{Number(a.percentage).toFixed(1)}%</td>
            <td className="font-sans text-[#181c1b]">{a.correctAnswers}/{a.totalQuestions}</td>
            <td><span className={`badge ${a.status === 'PASS' ? '!bg-[#d0e9d6] !text-[#364c3e] !border-[#5B7564]' : '!bg-[#ffdad6] !text-[#8A2E2E] !border-[#8A2E2E]'}`}>{a.status}</span></td>
            <td className="space-x-3"><Link className="font-sans font-bold text-xs uppercase tracking-wider text-[#735c00] hover:underline" to={`/attempts/${a.attemptId}/result`}>Result</Link><Link className="font-sans font-bold text-xs uppercase tracking-wider text-[#735c00] hover:underline" to={`/attempts/${a.attemptId}/review`}>Review</Link></td>
          </tr>)}</tbody>
        </table>
      </div> : <p className="font-sans text-[#4d4635] p-4">No quiz attempts yet.</p>}
      <Pagination page={data.number} totalPages={data.totalPages} onPage={setPage} />
    </div>}
  </section>;
}
