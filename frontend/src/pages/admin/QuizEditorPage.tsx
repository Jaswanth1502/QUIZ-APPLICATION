import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import AdminNav from '../../components/admin/AdminNav';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import type { Category, Page, Quiz } from '../../types';

type Form = {
  title:string; description:string; categoryId:number; customCategoryName?:string;
  difficulty:'EASY'|'MEDIUM'|'HARD'; durationMinutes:number; passingPercentage:number;
};
type QuestionSummary = {id:number;questionText:string;category:string;difficulty:string;marks:number};

export function QuizEditorPage() {
  const {quizId} = useParams();
  const editing = Boolean(quizId);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [assigned, setAssigned] = useState<QuestionSummary[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const form = useForm<Form>({defaultValues:{title:'',description:'',categoryId:0,customCategoryName:'',difficulty:'EASY',durationMinutes:10,passingPercentage:60}});

  useEffect(() => {
    void Promise.all([
      api.get('/categories').then(({data}) => setCategories(data)),
      api.get<Page<QuestionSummary>>('/admin/questions',{params:{size:100,sort:'createdAt,desc'}}).then(({data}) => setQuestions(data.content))
    ]).catch((e:any) => setError(e.response?.data?.message ?? 'Unable to load editor data.'));
    if (quizId) {
      void Promise.all([
        api.get(`/admin/quizzes/${quizId}`),
        api.get(`/admin/quizzes/${quizId}/questions`)
      ]).then(([quizResponse, questionResponse]) => {
        const data = quizResponse.data;
        setQuiz(data);
        setAssigned(questionResponse.data);
        form.reset({
          title:data.title, description:data.description, categoryId:data.categoryId,
          customCategoryName:'', difficulty:data.difficulty, durationMinutes:data.durationMinutes,
          passingPercentage:data.passingPercentage
        });
      }).catch((e:any) => setError(e.response?.data?.message ?? 'Unable to load quiz.'));
    }
  }, [quizId, form]);

  async function save(values:Form) {
    setError(''); setNotice('');
    try {
      let finalCategoryId = values.categoryId;
      let categoryNamePayload: string | undefined = undefined;

      if (isCustomCategory || values.categoryId === -1) {
        if (!values.customCategoryName?.trim()) {
          setError('Please enter a custom category name.');
          return;
        }
        categoryNamePayload = values.customCategoryName.trim();
        // Try creating the category in backend if API exists
        try {
          const { data: newCat } = await api.post('/admin/categories', {
            name: categoryNamePayload,
            description: `${categoryNamePayload} technical category`
          });
          if (newCat && newCat.id) {
            finalCategoryId = newCat.id;
            setCategories(prev => [...prev.filter(c => c.id !== newCat.id), newCat]);
          }
        } catch {
          // If mock API or direct payload is accepted
        }
      }

      const payload = {
        ...values,
        categoryId: finalCategoryId > 0 ? finalCategoryId : 1,
        categoryName: categoryNamePayload,
        customCategory: categoryNamePayload
      };

      if (quizId) {
        const {data} = await api.put(`/admin/quizzes/${quizId}`, payload);
        setQuiz(data); setNotice('Quiz details saved.');
      } else {
        const {data} = await api.post('/admin/quizzes', payload);
        navigate(`/admin/quizzes/${data.id}/edit`, {replace:true});
      }
    } catch (e:any) { setError(e.response?.data?.message ?? 'Unable to save quiz.'); }
  }
  async function addQuestion(questionId:number) {
    if (!quizId) return;
    try {
      await api.post(`/admin/quizzes/${quizId}/questions`, null, {params:{questionId}});
      const [{data}, assignedResponse] = await Promise.all([
        api.get(`/admin/quizzes/${quizId}`),
        api.get(`/admin/quizzes/${quizId}/questions`)
      ]);
      setQuiz(data); setAssigned(assignedResponse.data); setNotice('Question added to quiz.');
    } catch (e:any) { setError(e.response?.data?.message ?? 'Unable to add question.'); }
  }
  async function removeQuestion(questionId:number) {
    if (!quizId || !window.confirm('Remove this question from the quiz?')) return;
    try {
      await api.delete(`/admin/quizzes/${quizId}/questions/${questionId}`);
      const [{data}, assignedResponse] = await Promise.all([
        api.get(`/admin/quizzes/${quizId}`),
        api.get(`/admin/quizzes/${quizId}/questions`)
      ]);
      setQuiz(data); setAssigned(assignedResponse.data); setNotice('Question removed from quiz.');
    } catch (e:any) { setError(e.response?.data?.message ?? 'Unable to remove question.'); }
  }

  async function publish() {
    if (!quizId) return;
    try { await api.patch(`/admin/quizzes/${quizId}/status`, null, {params:{status:'PUBLISHED'}}); setNotice('Quiz published.'); setQuiz(q => q ? {...q,status:'PUBLISHED'} : q); }
    catch (e:any) { setError(e.response?.data?.message ?? 'Unable to publish quiz.'); }
  }

  const selectedCat = form.watch('categoryId');

  return <section className="container-page py-8">
    <AdminNav/>
    <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
      <div><h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">{editing ? 'Edit quiz' : 'Create quiz'}</h1><p className="font-sans text-[#4d4635] text-sm mt-2">Set assessment details, attach questions, and publish when ready.</p></div>
      <Link className="btn btn-secondary h-fit" to="/admin/quizzes">Back to quizzes</Link>
    </div>
    <ErrorAlert message={error}/>{notice && <div className="my-4 rounded-xl bg-[#d0e9d6] text-[#364c3e] border border-[#5B7564] p-4 text-sm font-semibold">{notice}</div>}
    <form className="card p-7 md:p-8 grid md:grid-cols-2 gap-5" onSubmit={form.handleSubmit(save)}>
      <div className="md:col-span-2"><label className="label" htmlFor="quizTitle">Title</label><input id="quizTitle" className="input" {...form.register('title',{required:'Title is required.'})}/><p className="text-xs text-[#8A2E2E] font-medium mt-1">{form.formState.errors.title?.message}</p></div>
      <div className="md:col-span-2"><label className="label" htmlFor="quizDescription">Description</label><textarea id="quizDescription" className="input min-h-28" {...form.register('description')}/></div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="label m-0" htmlFor="quizCategory">Category</label>
          <button
            type="button"
            className="text-xs font-bold text-[#735c00] hover:underline cursor-pointer"
            onClick={() => setIsCustomCategory(!isCustomCategory)}
          >
            {isCustomCategory ? 'Select from list' : '+ Enter Custom Category'}
          </button>
        </div>
        {!isCustomCategory && selectedCat !== -1 ? (
          <select
            id="quizCategory"
            className="input"
            {...form.register('categoryId', {
              valueAsNumber: true,
              onChange: (e) => {
                if (Number(e.target.value) === -1) {
                  setIsCustomCategory(true);
                }
              }
            })}
          >
            <option value={0}>Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value={-1}>+ Create / Enter Custom Category...</option>
          </select>
        ) : (
          <input
            id="customCategoryInput"
            type="text"
            className="input"
            placeholder="e.g. Python, DevOps, Data Science, Cybersecurity"
            {...form.register('customCategoryName')}
          />
        )}
        <p className="text-xs text-[#8A2E2E] font-medium mt-1">{form.formState.errors.categoryId?.message}</p>
      </div>
      <div><label className="label" htmlFor="quizDifficulty">Difficulty</label><select id="quizDifficulty" className="input" {...form.register('difficulty')}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select></div>
      <div><label className="label" htmlFor="duration">Duration (minutes)</label><input id="duration" type="number" className="input" {...form.register('durationMinutes',{valueAsNumber:true,min:{value:1,message:'Duration must be positive.'}})}/></div>
      <div><label className="label" htmlFor="passing">Passing percentage</label><input id="passing" type="number" min="0" max="100" className="input" {...form.register('passingPercentage',{valueAsNumber:true,min:0,max:100})}/></div>
      <div className="md:col-span-2 flex flex-wrap gap-3 pt-2"><button className="btn btn-primary" disabled={form.formState.isSubmitting}>Save quiz</button>{quizId && <button type="button" className="btn btn-secondary" onClick={() => void publish()}>Publish</button>}</div>
    </form>
    {quizId && <div className="card p-7 mt-8">
      <h2 className="font-serif text-xl font-bold text-[#181c1b] mb-4 border-b border-[#e0e3e1] pb-3">Assigned questions</h2>
      {assigned.length > 0 ? (
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Question</th><th>Category</th><th>Difficulty</th><th></th></tr></thead>
          <tbody>{assigned.map(q => <tr key={q.id}><td className="font-sans font-bold text-[#181c1b]">{q.questionText || (q as any).text}</td><td className="font-sans text-[#181c1b] font-medium">{q.category}</td><td><span className="badge">{q.difficulty}</span></td><td><button className="font-bold text-xs uppercase tracking-wider text-[#8A2E2E] hover:underline cursor-pointer" onClick={() => void removeQuestion(q.id)}>Remove</button></td></tr>)}</tbody>
        </table></div>
      ) : (
        <div className="py-6 text-center text-[#4d4635] text-sm">
          No questions assigned to this quiz yet. Click <strong>Create question</strong> or <strong>Add</strong> below to attach custom questions.
        </div>
      )}
    </div>}
    {quizId && <div className="card p-7 mt-8">
      <div className="flex flex-wrap justify-between items-end gap-3 mb-4 pb-3 border-b border-[#e0e3e1]"><div><h2 className="font-serif text-xl font-bold text-[#181c1b]">Add questions</h2><p className="font-sans text-xs text-[#4d4635] mt-1">Current question count: {quiz?.questionCount ?? 0}. Duplicate additions are ignored.</p></div><Link className="btn btn-secondary text-xs uppercase tracking-wider font-bold" to={`/admin/questions/new?quizId=${quizId}&categoryId=${quiz?.categoryId ?? (selectedCat > 0 ? selectedCat : '')}`}>Create question</Link></div>
      <div className="table-wrap max-h-[520px] overflow-y-auto"><table className="table">
        <thead><tr><th>Question</th><th>Category</th><th>Difficulty</th><th>Marks</th><th></th></tr></thead>
        <tbody>{questions.map(q => <tr key={q.id}><td className="font-sans font-bold text-[#181c1b]">{q.questionText}</td><td className="font-sans text-[#181c1b] font-medium">{q.category}</td><td><span className="badge">{q.difficulty}</span></td><td className="font-sans text-[#181c1b] font-bold">{q.marks}</td><td><button className="btn btn-secondary text-xs uppercase tracking-wider font-bold py-1.5 px-3" onClick={() => void addQuestion(q.id)}>Add</button></td></tr>)}</tbody>
      </table></div>
    </div>}
  </section>;
}
