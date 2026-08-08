import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import AdminNav from '../../components/admin/AdminNav';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Loading } from '../../components/common/Loading';
import { Pagination } from '../../components/common/Pagination';
import type { Page } from '../../types';

type Question = {id:number;questionText:string;category:string;difficulty:string;marks:number;options:unknown[]};

export function AdminQuestionsPage() {
  const [page,setPage] = useState(0);
  const [data,setData] = useState<Page<Question>|null>(null);
  const [error,setError] = useState('');
  const load = () => api.get('/admin/questions',{params:{page,size:12,sort:'createdAt,desc'}}).then(({data}) => setData(data))
    .catch(e => setError(e.response?.data?.message ?? 'Unable to load questions.'));
  useEffect(() => {void load();},[page]);
  async function remove(id:number) {
    if (!window.confirm('Delete this question?')) return;
    try { await api.delete(`/admin/questions/${id}`); await load(); }
    catch(e:any){setError(e.response?.data?.message ?? 'Unable to delete question.');}
  }
  return <section className="container-page py-8">
    <AdminNav/>
    <div className="flex flex-wrap justify-between items-end gap-4 mb-6"><div><h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">Question bank</h1><p className="font-sans text-[#4d4635] text-sm mt-2">Create reusable multiple-choice questions.</p></div><Link className="btn btn-primary" to="/admin/questions/new">Add question</Link></div>
    <ErrorAlert message={error}/>
    {!data&&!error?<Loading/>:data&&<div className="card p-7">
      <div className="table-wrap"><table className="table"><thead><tr><th>Question</th><th>Category</th><th>Difficulty</th><th>Marks</th><th>Actions</th></tr></thead><tbody>
        {data.content.map(q=><tr key={q.id}><td className="font-sans font-bold text-[#181c1b] max-w-xl">{q.questionText}</td><td className="font-sans text-[#181c1b] font-medium">{q.category}</td><td><span className="badge">{q.difficulty}</span></td><td className="font-sans text-[#181c1b] font-bold">{q.marks}</td><td className="space-x-3"><Link className="font-bold text-xs uppercase tracking-wider text-[#735c00] hover:underline" to={`/admin/questions/${q.id}/edit`}>Edit</Link><button className="font-bold text-xs uppercase tracking-wider text-[#8A2E2E] hover:underline cursor-pointer" onClick={()=>void remove(q.id)}>Delete</button></td></tr>)}
      </tbody></table></div><Pagination page={data.number} totalPages={data.totalPages} onPage={setPage}/>
    </div>}
  </section>;
}
