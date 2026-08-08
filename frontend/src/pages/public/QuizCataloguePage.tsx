import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import type { Category, Page, Quiz } from '../../types';
import QuizCard from '../../components/quiz/QuizCard';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function QuizCataloguePage() {
  const [params] = useSearchParams();
  const [data, setData] = useState<Page<Quiz>|null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(params.get('category') ?? '');
  const [difficulty, setDifficulty] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    void api.get('/categories').then(response => setCategories(response.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void api.get('/quizzes', {params:{
        search: search || undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        page, size:9
      }}).then(response => setData(response.data));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, difficulty, page]);

  return <section className="container-page py-10">
    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">Quiz catalogue</h1>
    <p className="font-sans text-[#4d4635] text-sm mt-2 mb-6">Explore timed technical quizzes and test your skills.</p>
    <div className="card grid gap-4 p-6 md:grid-cols-3">
      <input className="input" placeholder="Search quizzes..." value={search}
        onChange={event => {setSearch(event.target.value);setPage(0);}}/>
      <select className="input" value={category}
        onChange={event => {setCategory(event.target.value);setPage(0);}}>
        <option value="">All categories</option>
        {categories.map(value => <option value={value.id} key={value.id}>{value.name}</option>)}
      </select>
      <select className="input" value={difficulty}
        onChange={event => {setDifficulty(event.target.value);setPage(0);}}>
        <option value="">All difficulties</option>
        <option>EASY</option><option>MEDIUM</option><option>HARD</option>
      </select>
    </div>

    {!data ? <Loading/> : data.content.length === 0 ?
      <div className="mt-8"><EmptyState message="No quizzes match those filters."/></div> :
      <>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.content.map(quiz => <QuizCard key={quiz.id} quiz={quiz}/>)}
        </div>
        <Pagination page={data.number} total={data.totalPages} onChange={setPage}/>
      </>}
  </section>;
}
