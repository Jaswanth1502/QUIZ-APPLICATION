import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import AdminNav from '../../components/admin/AdminNav';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import type { Category } from '../../types';

type Form = {
  questionText:string; categoryId:number; customCategoryName?:string; difficulty:'EASY'|'MEDIUM'|'HARD';
  marks:number; explanation:string; correctIndex:number;
  options:{optionText:string}[];
};

export function QuestionEditorPage() {
  const {questionId} = useParams();
  const [searchParams] = useSearchParams();
  const targetQuizId = searchParams.get('quizId');
  const targetCatId = searchParams.get('categoryId');
  const navigate = useNavigate();

  const [categories,setCategories] = useState<Category[]>([]);
  const [error,setError] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const form = useForm<Form>({defaultValues:{
    questionText:'',
    categoryId: targetCatId ? Number(targetCatId) : 0,
    customCategoryName:'',
    difficulty:'EASY',
    marks:1,
    explanation:'',
    correctIndex:0,
    options:[{optionText:''},{optionText:''},{optionText:''},{optionText:''}]
  }});
  const {fields,append,remove} = useFieldArray({control:form.control,name:'options'});

  useEffect(()=>{
    void api.get('/categories').then(({data})=> {
      setCategories(data);
      if (targetCatId && !questionId) {
        const found = (data as Category[]).find(c =>
          c.id === Number(targetCatId) ||
          String(c.id) === String(targetCatId) ||
          c.name.trim().toLowerCase() === String(targetCatId).trim().toLowerCase()
        );
        if (found) {
          form.setValue('categoryId', Number(found.id));
          setIsCustomCategory(false);
        } else {
          setIsCustomCategory(true);
          form.setValue('customCategoryName', String(targetCatId));
          form.setValue('categoryId', -1);
        }
      }
    }).catch(()=>setError('Unable to load categories.'));

    if(questionId) void api.get(`/admin/questions/${questionId}`).then(({data})=>{
      const correctIndex = Math.max(0,data.options.findIndex((o:{correct:boolean})=>o.correct));
      form.reset({
        questionText:data.questionText,
        categoryId:data.categoryId,
        customCategoryName:'',
        difficulty:data.difficulty,
        marks:data.marks,
        explanation:data.explanation,
        correctIndex,
        options:data.options.map((o:{optionText:string})=>({optionText:o.optionText}))
      });
    }).catch((e:any)=>setError(e.response?.data?.message??'Unable to load question.'));
  },[questionId, targetCatId, form]);

  async function save(values:Form){
    setError('');
    let finalCategoryId = values.categoryId;
    let categoryNamePayload: string | undefined = undefined;

    if (isCustomCategory || values.categoryId === -1) {
      if (!values.customCategoryName?.trim()) {
        setError('Please enter a custom category name.');
        return;
      }
      categoryNamePayload = values.customCategoryName.trim();
      try {
        const { data: newCat } = await api.post('/admin/categories', {
          name: categoryNamePayload,
          description: `${categoryNamePayload} question category`
        });
        if (newCat && newCat.id) {
          finalCategoryId = newCat.id;
        }
      } catch {
        // Fallback
      }
    }

    const payload={
      questionText:values.questionText,
      categoryId: finalCategoryId > 0 ? finalCategoryId : 1,
      categoryName: categoryNamePayload,
      customCategory: categoryNamePayload,
      difficulty:values.difficulty,
      marks:values.marks,explanation:values.explanation,
      options:values.options.map((o,i)=>({optionText:o.optionText,correct:i===Number(values.correctIndex),displayOrder:i+1}))
    };
    try{
      if(questionId) {
        await api.put(`/admin/questions/${questionId}`,payload);
      } else {
        const { data: createdQ } = await api.post('/admin/questions', payload);
        if (targetQuizId && createdQ?.id) {
          try {
            await api.post(`/admin/quizzes/${targetQuizId}/questions`, null, { params: { questionId: createdQ.id } });
          } catch {
            // Ignore if auto-linked
          }
          navigate(`/admin/quizzes/${targetQuizId}/edit`);
          return;
        }
      }
      if (targetQuizId) {
        navigate(`/admin/quizzes/${targetQuizId}/edit`);
      } else {
        navigate('/admin/questions');
      }
    }catch(e:any){setError(e.response?.data?.message??'Unable to save question.');}
  }

  const selectedCatId = form.watch('categoryId');
  const inheritedCategory = categories.find(c => c.id === selectedCatId || c.id === Number(targetCatId));

  return <section className="container-page py-8">
    <AdminNav/>
    <div className="flex justify-between items-end gap-4 mb-6">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">{questionId?'Edit question':'Add question'}</h1>
        <p className="font-sans text-[#4d4635] text-sm mt-2">
          {targetQuizId ? 'Adding new question directly to active quiz.' : 'Provide options and select exactly one correct answer.'}
        </p>
      </div>
      <Link className="btn btn-secondary h-fit" to={targetQuizId ? `/admin/quizzes/${targetQuizId}/edit` : '/admin/questions'}>
        Back
      </Link>
    </div>

    {targetQuizId && inheritedCategory && (
      <div className="my-4 rounded-xl bg-[#e6f4ea] text-[#137333] border border-[#a8dab5] p-3.5 text-xs font-bold flex items-center justify-between">
        <span>Category auto-inherited from quiz: <strong className="underline decoration-2">{inheritedCategory.name}</strong></span>
        <span className="bg-[#137333] text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">Quiz Context Active</span>
      </div>
    )}

    <form className="card p-7 md:p-9 space-y-6" onSubmit={form.handleSubmit(save)}>
      <ErrorAlert message={error}/>
      <div><label className="label" htmlFor="questionText">Question text</label><textarea id="questionText" className="input min-h-28" {...form.register('questionText',{required:'Question text is required.'})}/><p className="text-xs text-[#8A2E2E] font-medium mt-1">{form.formState.errors.questionText?.message}</p></div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="label m-0" htmlFor="questionCategory">Category</label>
            <button
              type="button"
              className="text-xs font-bold text-[#735c00] hover:underline cursor-pointer"
              onClick={() => setIsCustomCategory(!isCustomCategory)}
            >
              {isCustomCategory ? 'Select from list' : '+ Custom'}
            </button>
          </div>
          {!isCustomCategory && selectedCatId !== -1 ? (
            <select
              id="questionCategory"
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
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              <option value={-1}>+ Create / Enter Custom Category...</option>
            </select>
          ) : (
            <input
              type="text"
              className="input"
              placeholder="e.g. Python, DevOps"
              {...form.register('customCategoryName')}
            />
          )}
        </div>
        <div><label className="label" htmlFor="questionDifficulty">Difficulty</label><select id="questionDifficulty" className="input" {...form.register('difficulty')}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select></div>
        <div><label className="label" htmlFor="marks">Marks</label><input id="marks" type="number" min=".1" step=".1" className="input" {...form.register('marks',{valueAsNumber:true,min:.1})}/></div>
      </div>
      <div><label className="label" htmlFor="explanation">Explanation</label><textarea id="explanation" className="input min-h-24" {...form.register('explanation')}/></div>
      <fieldset><legend className="font-serif text-lg font-bold text-[#181c1b] mb-3 pb-2 border-b border-[#e0e3e1]">Answer options</legend><div className="space-y-3">
        {fields.map((field,index)=><div className="flex gap-3.5 items-center" key={field.id}>
          <input type="radio" value={index} {...form.register('correctIndex',{valueAsNumber:true})} aria-label={`Mark option ${index+1} correct`} className="accent-[#735c00] h-4 w-4 shrink-0"/>
          <input className="input" aria-label={`Option ${index+1}`} placeholder={`Option ${index+1}`} {...form.register(`options.${index}.optionText`,{required:'Option text is required.'})}/>
          {fields.length>4&&<button type="button" className="btn btn-secondary text-xs" onClick={()=>remove(index)}>Remove</button>}
        </div>)}
      </div><button type="button" className="btn btn-secondary text-xs uppercase tracking-wider font-bold mt-4" onClick={()=>append({optionText:''})}>Add another option</button></fieldset>
      <div className="pt-2"><button className="btn btn-primary" disabled={form.formState.isSubmitting}>Save question</button></div>
    </form>
  </section>;
}
