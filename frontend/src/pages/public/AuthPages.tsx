import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ErrorAlert from '../../components/common/ErrorAlert';

export function LoginPage() {
  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<{ usernameOrEmail: string; password: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(
    location.search.includes('role=admin') || location.pathname.includes('admin')
  );

  const registeredSuccess = (location.state as { registeredSuccess?: boolean } | null)?.registeredSuccess;
  const prefilledUsername = (location.state as { prefilledUsername?: string } | null)?.prefilledUsername;

  useEffect(() => {
    if (prefilledUsername) {
      setValue('usernameOrEmail', prefilledUsername);
    }
  }, [prefilledUsername, setValue]);

  const fillAdminCredentials = () => {
    setValue('usernameOrEmail', 'admin');
    setValue('password', 'Admin@12345');
  };

  const fillUserCredentials = () => {
    setValue('usernameOrEmail', 'alice');
    setValue('password', 'User@12345');
  };

  const submit = handleSubmit(async values => {
    try {
      await login(values);
      const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      if (fromPath) {
        navigate(fromPath);
      } else if (isAdminMode) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (reason: any) {
      setError(reason.response?.data?.message ?? 'Login failed.');
    }
  });

  return (
    <AuthShell
      title={isAdminMode ? 'Admin Portal' : 'Welcome Back'}
      subtitle={
        isAdminMode
          ? 'Enter administrator credentials to access management workspace'
          : 'Sign in to your QuizForge account to continue learning'
      }
      icon={
        isAdminMode ? (
          <ShieldCheck className="h-5 w-5 text-[#735c00]" />
        ) : (
          <LogIn className="h-5 w-5 text-[#735c00]" />
        )
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={submit} className="grid gap-5 text-left">
        {registeredSuccess && !error && (
          <div className="flex items-start gap-2.5 bg-[#d0e9d6] border border-[#5B7564] text-[#364c3e] rounded-xl p-3.5 text-xs font-bold shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-[#364c3e] shrink-0 mt-0.5" />
            <span>Account created successfully! Please enter your password to sign in.</span>
          </div>
        )}

        <ErrorAlert message={error} />

        {isAdminMode ? (
          <div className="flex items-center justify-between bg-[#f1f4f2] border border-[#d0c5af] rounded-xl p-3 text-xs">
            <span className="font-semibold text-[#181c1b]">Demo Admin Credentials</span>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="font-bold text-[#735c00] hover:text-[#181c1b] bg-[#ffffff] px-2.5 py-1 rounded-lg border border-[#d0c5af] uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
            >
              Auto-fill (admin)
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-[#f1f4f2] border border-[#d0c5af] rounded-xl p-3 text-xs">
            <span className="font-semibold text-[#181c1b]">Demo User Credentials</span>
            <button
              type="button"
              onClick={fillUserCredentials}
              className="font-bold text-[#735c00] hover:text-[#181c1b] bg-[#ffffff] px-2.5 py-1 rounded-lg border border-[#d0c5af] uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
            >
              Auto-fill (alice)
            </button>
          </div>
        )}

        <label className="block">
          <span className="label">
            Username or email
          </span>
          <input
            className="input"
            placeholder={isAdminMode ? 'admin' : 'Enter username or email'}
            {...register('usernameOrEmail', { required: 'Required' })}
          />
          {errors.usernameOrEmail && (
            <small className="text-[#8A2E2E] font-medium text-xs mt-1 block">{errors.usernameOrEmail?.message}</small>
          )}
        </label>

        <label className="block">
          <span className="label">
            Password
          </span>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            {...register('password', { required: 'Required' })}
          />
          {errors.password && (
            <small className="text-[#8A2E2E] font-medium text-xs mt-1 block">{errors.password?.message}</small>
          )}
        </label>

        <button
          className="btn btn-primary w-full py-3.5 text-[#181c1b] font-bold shadow-xs uppercase tracking-wider text-xs mt-1"
        >
          {isAdminMode ? 'Log in as Administrator' : 'Log in'}
        </button>

        <div className="space-y-2 pt-2 text-center text-xs text-[#4d4635] font-medium">
          <p>
            New here?{' '}
            <Link className="font-bold text-[#735c00] hover:underline" to="/register">
              Create an account
            </Link>
          </p>

          <div className="pt-2 border-t border-[#e0e3e1]">
            {isAdminMode ? (
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(false);
                  navigate('/login', { replace: true });
                }}
                className="inline-flex items-center gap-1.5 font-bold text-[#4d4635] hover:text-[#181c1b] transition-colors uppercase text-[11px] cursor-pointer"
              >
                ← Back to Learner Sign-In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(true);
                  setError('');
                  navigate('/login?role=admin', { replace: true });
                }}
                className="inline-flex items-center gap-1.5 font-bold text-[#181c1b] bg-[#f1f4f2] hover:bg-[#ebefed] px-3.5 py-1.5 rounded-xl border border-[#d0c5af] transition-all cursor-pointer uppercase text-[11px]"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#735c00]" /> Sign in as Admin
              </button>
            )}
          </div>
        </div>
      </form>
    </AuthShell>
  );
}

type Registration = {
  fullName: string; username: string; email: string; password: string; confirmPassword: string
};

export function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Registration>();
  const { register: signup, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const submit = handleSubmit(async values => {
    try {
      await signup(values as unknown as Record<string, string>);
      try {
        await logout();
      } catch {
        // ignore logout errors if any
      }
      navigate('/login', {
        state: {
          registeredSuccess: true,
          prefilledUsername: values.username
        }
      });
    } catch (reason: any) {
      setError(reason.response?.data?.message ?? 'Registration failed.');
    }
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join QuizForge to start taking timed assessments"
      icon={<UserPlus className="h-5 w-5 text-[#735c00]" />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={submit} className="grid gap-4 text-left">
        <ErrorAlert message={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Full name</span>
            <input
              className="input"
              placeholder="John Doe"
              {...register('fullName', { required: 'Required' })}
            />
            {errors.fullName && <small className="text-[#8A2E2E] text-xs mt-1 block">{errors.fullName?.message}</small>}
          </label>

          <label className="block">
            <span className="label">Username</span>
            <input
              className="input"
              placeholder="johndoe"
              {...register('username', { required: 'Required', minLength: { value: 3, message: 'Use at least 3 characters' } })}
            />
            {errors.username && <small className="text-[#8A2E2E] text-xs mt-1 block">{errors.username?.message}</small>}
          </label>
        </div>

        <label className="block">
          <span className="label">Email</span>
          <input
            type="email"
            className="input"
            placeholder="john@example.com"
            {...register('email', { required: 'Required' })}
          />
          {errors.email && <small className="text-[#8A2E2E] text-xs mt-1 block">{errors.email?.message}</small>}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="label">Password</span>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              {...register('password', { required: true, minLength: { value: 8, message: 'Use at least 8 characters' } })}
            />
            <small className="text-[#4d4635] text-[11px] mt-0.5 block">At least 8 characters.</small>
            {errors.password && <small className="block text-[#8A2E2E] text-xs mt-1">{errors.password?.message}</small>}
          </label>

          <label className="block">
            <span className="label">Confirm password</span>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              {...register('confirmPassword', { validate: value => value === watch('password') || 'Passwords must match' })}
            />
            {errors.confirmPassword && <small className="text-[#8A2E2E] text-xs mt-1 block">{errors.confirmPassword?.message}</small>}
          </label>
        </div>

        <button className="btn btn-primary w-full py-3.5 text-[#181c1b] font-bold shadow-xs uppercase tracking-wider text-xs mt-2">
          Register
        </button>

        <p className="text-center text-xs text-[#4d4635] pt-1 font-medium">
          Already have an account?{' '}
          <Link className="font-bold text-[#735c00] hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function AuthShell({
  title,
  subtitle,
  icon,
  maxWidth = 'max-w-md',
  children
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  maxWidth?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center w-full py-10 px-4 sm:px-6 bg-[#f7faf8] min-h-[calc(100vh-140px)]">
      <div className={`relative z-10 w-full ${maxWidth} card p-8 sm:p-10 shadow-md`}>
        <div className="text-center mb-6 space-y-2">
          {icon && (
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#ebefed] border border-[#d0c5af] shadow-xs mb-1">
              {icon}
            </div>
          )}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#181c1b] tracking-tight">{title}</h1>
          {subtitle && (
            <p className="font-sans text-[#4d4635] text-xs sm:text-sm font-normal max-w-xs mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
