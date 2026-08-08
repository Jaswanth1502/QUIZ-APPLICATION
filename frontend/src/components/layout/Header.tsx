import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isAuthPage = isLoginPage || isRegisterPage;
  const isAdminLogin = isLoginPage && location.search.includes('role=admin');

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-all px-3.5 py-2 rounded-xl tracking-wide ${
      isActive
        ? 'text-[#181c1b] bg-[#ebefed] font-bold border-b-2 border-[#D4AF37]'
        : 'text-[#4d4635] hover:text-[#181c1b] hover:bg-[#f1f4f2]'
    }`;

  const links = (
    <>
      {!isAdminLogin && (!user || !user.roles.includes('ROLE_ADMIN')) && (
        <NavLink className={navClass} to="/">
          Home
        </NavLink>
      )}
      {!isAuthPage && (!user || !user.roles.includes('ROLE_ADMIN')) && (
        <NavLink className={navClass} to="/quizzes">
          Quizzes
        </NavLink>
      )}
      {user ? (
        <>
          <NavLink className={navClass} to={user.roles.includes('ROLE_ADMIN') ? '/admin' : '/dashboard'}>
            Dashboard
          </NavLink>
          {!user.roles.includes('ROLE_ADMIN') && (
            <NavLink className={navClass} to="/history">
              History
            </NavLink>
          )}
          <NavLink className={navClass} to="/profile">
            Profile
          </NavLink>
          <button
            className="flex items-center gap-1.5 text-xs font-bold text-[#8A2E2E] hover:bg-[#ffdad6] px-3.5 py-2 rounded-xl border border-[#8A2E2E] transition-all ml-1 uppercase tracking-wider cursor-pointer"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </>
      ) : (
        <>
          {isRegisterPage ? (
            <NavLink className={navClass} to="/login">
              Sign In
            </NavLink>
          ) : isLoginPage ? (
            !isAdminLogin && (
              <Link
                className="btn btn-primary text-xs uppercase tracking-wider ml-2"
                to="/register"
              >
                Get Started
              </Link>
            )
          ) : (
            <>
              <NavLink className={navClass} to="/login">
                Sign In
              </NavLink>
              <Link
                className="btn btn-primary text-xs uppercase tracking-wider ml-2"
                to="/register"
              >
                Get Started
              </Link>
            </>
          )}
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-[#ffffff] border-b border-[#d0c5af] text-[#181c1b] shadow-xs">
      <div className="container-page flex min-h-16 items-center justify-between py-2.5">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 bg-[#181c1b] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] rounded-xl shadow-xs group-hover:bg-[#735c00] group-hover:text-white transition-colors">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#181c1b]">
            Quiz<span className="text-[#735c00]">Forge</span>
          </span>
        </Link>
        <nav className="desktop-nav flex items-center gap-2 font-sans">{links}</nav>
        <button
          className="mobile-nav p-2 rounded-xl bg-[#f1f4f2] border border-[#d0c5af] text-[#181c1b] hover:bg-[#ebefed]"
          aria-label="Open navigation"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="mobile-nav container-page flex-col gap-3 border-t border-[#d0c5af] py-4 bg-[#ffffff]" onClick={() => setOpen(false)}>
          {links}
        </nav>
      )}
    </header>
  );
}
