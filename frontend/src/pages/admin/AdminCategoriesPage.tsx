import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/client';
import AdminNav from '../../components/admin/AdminNav';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Pagination } from '../../components/common/Pagination';
import type { Category, Page } from '../../types';

type Form = {name:string;description:string};

export function AdminCategoriesPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<Category> | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const form = useForm<Form>({defaultValues:{name:'',description:''}});
  const load = () => api.get('/admin/categories',{params:{page,size:10,sort:'name,asc'}}).then(({data}) => setData(data))
    .catch(e => setError(e.response?.data?.message ?? 'Unable to load categories.'));
  useEffect(() => { void load(); }, [page]);

  async function save(values:Form) {
    setError('');
    try {
      if (editing && editing.id) {
        await api.put(`/admin/categories/${editing.id}`, values);
      } else {
        await api.post('/admin/categories', values);
      }
      setEditing(null);
      form.reset({ name: '', description: '' });
      await load();
    } catch (e:any) { setError(e.response?.data?.message ?? 'Unable to save category.'); }
  }
  async function status(category:Category) {
    const next = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try { await api.patch(`/admin/categories/${category.id}/status`, null, {params:{status:next}}); await load(); }
    catch (e:any) { setError(e.response?.data?.message ?? 'Unable to update category.'); }
  }

  return <section className="container-page py-8">
    <AdminNav/>
    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">Category management</h1>
    <p className="font-sans text-[#4d4635] text-sm mt-2 mb-6">Organize quizzes into structured technical categories.</p>
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      <form className="card p-7 space-y-4 h-fit" onSubmit={form.handleSubmit(save)}>
        <h2 className="font-serif text-xl font-bold text-[#181c1b] border-b border-[#e0e3e1] pb-3">{editing ? 'Edit category' : 'New category'}</h2>
        <ErrorAlert message={error}/>
        <div><label className="label" htmlFor="categoryName">Name</label><input id="categoryName" className="input" {...form.register('name',{required:'Name is required.'})}/><p className="text-xs text-[#8A2E2E] font-medium mt-1">{form.formState.errors.name?.message}</p></div>
        <div><label className="label" htmlFor="categoryDescription">Description</label><textarea id="categoryDescription" className="input min-h-28" {...form.register('description')}/></div>
        <div className="flex gap-3 pt-2"><button className="btn btn-primary" disabled={form.formState.isSubmitting}>Save</button>{editing && <button type="button" className="btn btn-secondary" onClick={() => {setEditing(null);form.reset();}}>Cancel</button>}</div>
      </form>
      <div className="card p-7">
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Name</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{data?.content.map(category => <tr key={category.id}><td className="font-sans font-bold text-[#181c1b]">{category.name}</td><td className="font-sans text-[#4d4635] text-sm">{category.description}</td><td><span className="badge">{category.status}</span></td><td className="space-x-3">
            <button className="font-bold text-xs uppercase tracking-wider text-[#735c00] hover:underline cursor-pointer" onClick={() => {setEditing(category);form.reset({name:category.name,description:category.description});}}>Edit</button>
            <button className="font-bold text-xs uppercase tracking-wider text-[#4d4635] hover:underline cursor-pointer" onClick={() => void status(category)}>{category.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
          </td></tr>)}</tbody>
        </table></div>
        {data && <Pagination page={data.number} totalPages={data.totalPages} onPage={setPage}/>}
      </div>
    </div>
  </section>;
}
