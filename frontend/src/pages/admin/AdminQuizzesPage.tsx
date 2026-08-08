import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import AdminNav from '../../components/admin/AdminNav';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Loading } from '../../components/common/Loading';
import { Pagination } from '../../components/common/Pagination';
import type { Page, Quiz } from '../../types';

export function AdminQuizzesPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<Quiz> | null>(null);
  const [error, setError] = useState('');
  const load = () => api.get('/admin/quizzes',{params:{page,size:12,sort:'createdAt,desc'}})
    .then(({data}) => setData(data)).catch(e => setError(e.response?.data?.message ?? 'Unable to load quizzes.'));
  useEffect(() => { void load(); }, [page]);

  async function changeStatus(quiz:Quiz, status:string) {
    try { await api.patch(`/admin/quizzes/${quiz.id}/status`, null, {params:{status}}); await load(); }
    catch (e:any) { setError(e.response?.data?.message ?? 'Unable to update quiz status.'); }
  }

  return <section className="container-page py-8">
    <AdminNav/>
    <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
      <div><h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">Quiz management</h1><p className="font-sans text-[#4d4635] text-sm mt-2">Create, edit, publish, and deactivate assessments.</p></div>
      <Link className="btn btn-primary" to="/admin/quizzes/new">Create quiz</Link>
    </div>
    <ErrorAlert message={error}/>
    {!data && !error ? <Loading/> : data && <div className="card p-7">
      <div className="table-wrap"><table className="table">
        <thead><tr><th>Quiz</th><th>Category</th><th>Difficulty</th><th>Questions</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{data.content.map(quiz => <tr key={quiz.id}>
          <td><strong className="font-sans font-bold text-[#181c1b]">{quiz.title}</strong><div className="text-xs text-[#4d4635] font-normal">{quiz.durationMinutes} minutes · Pass {quiz.passingPercentage}%</div></td>
          <td className="font-sans text-[#181c1b] font-medium">{quiz.category}</td><td><span className="badge">{quiz.difficulty}</span></td><td className="font-sans text-[#181c1b] font-bold">{quiz.questionCount}</td><td><span className="badge">{quiz.status}</span></td>
          <td><div className="flex flex-wrap gap-3">
            <Link className="font-bold text-xs uppercase tracking-wider text-[#735c00] hover:underline" to={`/admin/quizzes/${quiz.id}/edit`}>Edit</Link>
            {quiz.status !== 'PUBLISHED' && <button className="font-bold text-xs uppercase tracking-wider text-[#364c3e] hover:underline cursor-pointer" onClick={() => void changeStatus(quiz,'PUBLISHED')}>Publish</button>}
            {quiz.status === 'PUBLISHED' && <button className="font-bold text-xs uppercase tracking-wider text-[#8A2E2E] hover:underline cursor-pointer" onClick={() => void changeStatus(quiz,'INACTIVE')}>Deactivate</button>}
          </div></td>
        </tr>)}</tbody>
      </table></div>
      <Pagination page={data.number} totalPages={data.totalPages} onPage={setPage}/>
    </div>}
  </section>;
}
