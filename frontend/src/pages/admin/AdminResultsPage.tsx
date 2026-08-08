import { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminNav from '../../components/admin/AdminNav';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Loading } from '../../components/common/Loading';
import { Pagination } from '../../components/common/Pagination';
import type { AttemptResult, Page } from '../../types';

export function AdminResultsPage(){
  const [page,setPage]=useState(0);
  const [data,setData]=useState<Page<AttemptResult>|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{api.get('/admin/attempts',{params:{page,size:15,sort:'submittedAt,desc'}}).then(({data})=>setData(data)).catch(e=>setError(e.response?.data?.message??'Unable to load results.'));},[page]);
  return <section className="container-page py-8"><AdminNav/><h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">Quiz results and reports</h1><p className="font-sans text-[#4d4635] text-sm mt-2 mb-6">Review attempts across all users and quizzes.</p><ErrorAlert message={error}/>
    {!data&&!error?<Loading/>:data&&<div className="card p-7"><div className="table-wrap"><table className="table"><thead><tr><th>User</th><th>Quiz</th><th>Score</th><th>Correct</th><th>Result</th><th>Time</th></tr></thead><tbody>
      {data.content.map(a=><tr key={a.attemptId}><td className="font-sans text-[#181c1b] font-medium">{a.userName}</td><td className="font-sans font-bold text-[#181c1b]">{a.quizTitle}</td><td className="font-serif font-bold text-[#181c1b]">{Number(a.percentage).toFixed(1)}%</td><td className="font-sans text-[#181c1b]">{a.correctAnswers}/{a.totalQuestions}</td><td><span className={`badge ${a.status==='PASS'?'!bg-[#d0e9d6] !text-[#364c3e] !border-[#5B7564]':'!bg-[#ffdad6] !text-[#8A2E2E] !border-[#8A2E2E]'}`}>{a.status}</span></td><td className="font-sans text-[#4d4635] text-sm">{Math.floor(a.timeTakenSeconds/60)}m {a.timeTakenSeconds%60}s</td></tr>)}
    </tbody></table></div><Pagination page={data.number} totalPages={data.totalPages} onPage={setPage}/></div>}
  </section>;
}
