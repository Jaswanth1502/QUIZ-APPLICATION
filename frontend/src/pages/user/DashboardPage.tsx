import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Loading } from '../../components/common/Loading';
import { StatCard } from '../../components/common/StatCard';
import { ErrorAlert } from '../../components/common/ErrorAlert';

type RecentAttempt = {id:number;quiz:string;percentage:number;status:string};
type Dashboard = {
  statistics: Record<string, number>;
  recent: RecentAttempt[];
};

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/users/me/dashboard')
      .then(({ data }) => setData(data))
      .catch((e) => setError(e.response?.data?.message ?? 'Unable to load dashboard.'));
  }, []);

  if (!data && !error) return <Loading label="Loading your dashboard..." />;

  const stats = data?.statistics || (data as any) || {};
  const recentList: RecentAttempt[] = data?.recent || (data as any)?.recentAttempts?.map((r: any) => ({
    id: r.id || r.attemptId,
    quiz: r.quiz || r.quizTitle,
    percentage: r.percentage,
    status: r.status
  })) || [];

  const completedQuizzes = stats.completedQuizzes ?? stats.totalAttempts ?? 0;
  const bestScore = stats.bestScore ?? 0;
  const averageScore = stats.averageScore ?? 0;

  return <section className="container-page py-10">
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <span className="badge">Academic Learning Hub</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b] mt-3">Dashboard</h1>
        <p className="font-sans text-[#4d4635] text-sm mt-2">Track progress and benchmark your performance.</p>
      </div>
      <Link to="/quizzes" className="btn btn-primary">Browse quizzes</Link>
    </div>
    <ErrorAlert message={error} />
    {data && <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Completed quizzes" value={completedQuizzes} />
        <StatCard label="Best score" value={`${bestScore}%`} />
        <StatCard label="Average score" value={`${averageScore}%`} />
        <StatCard label="Recent activity" value={recentList.length} />
      </div>
      <div className="card p-7 mt-8">
        <div className="flex items-center justify-between mb-5 border-b border-[#e0e3e1] pb-4">
          <h2 className="font-serif text-xl font-bold text-[#181c1b]">Recent attempts</h2>
          <Link className="font-sans font-bold text-xs uppercase tracking-wider text-[#735c00] hover:underline" to="/history">View all</Link>
        </div>
        {recentList.length ? <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Quiz</th><th>Score</th><th>Result</th><th></th></tr></thead>
            <tbody>{recentList.map(a => <tr key={a.id}>
              <td className="font-sans font-bold text-[#181c1b]">{a.quiz}</td>
              <td className="font-serif font-bold text-[#181c1b]">{Number(a.percentage).toFixed(1)}%</td>
              <td><span className={`badge ${a.status === 'PASS' ? '!bg-[#d0e9d6] !text-[#364c3e] !border-[#5B7564]' : a.status === 'FAIL' ? '!bg-[#ffdad6] !text-[#8A2E2E] !border-[#8A2E2E]' : ''}`}>{a.status}</span></td>
              <td>{a.status !== 'IN_PROGRESS' && <Link className="font-sans font-bold text-xs uppercase tracking-wider text-[#735c00] hover:underline" to={`/attempts/${a.id}/result`}>View</Link>}</td>
            </tr>)}</tbody>
          </table>
        </div> : <p className="font-sans text-[#4d4635] text-sm">No attempts yet. Start with a published quiz.</p>}
      </div>
    </>}
  </section>;
}
