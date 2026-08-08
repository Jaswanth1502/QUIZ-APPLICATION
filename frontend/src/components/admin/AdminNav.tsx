import { NavLink } from 'react-router-dom';

const items = [
  ['/admin', 'Overview'],
  ['/admin/users', 'Users'],
  ['/admin/categories', 'Categories'],
  ['/admin/quizzes', 'Quizzes'],
  ['/admin/questions', 'Question bank'],
  ['/admin/results', 'Results'],
] as const;

export default function AdminNav() {
  return (
    <nav
      className="card p-2.5 mb-8 flex flex-wrap gap-1.5"
      aria-label="Administrator navigation"
    >
      {items.map(([to, label]) => (
        <NavLink
          key={to}
          end={to === '/admin'}
          to={to}
          className={({ isActive }) =>
            `px-4 py-2 font-sans font-bold text-sm rounded-xl tracking-wide transition-all ${
              isActive
                ? 'text-[#181c1b] bg-[#ebefed] border-b-2 border-[#D4AF37]'
                : 'text-[#4d4635] hover:text-[#181c1b] hover:bg-[#f1f4f2]'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
