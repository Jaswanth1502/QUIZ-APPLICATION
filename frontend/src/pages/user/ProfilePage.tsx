import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ErrorAlert } from '../../components/common/ErrorAlert';

type ProfileForm = { fullName:string; email:string };
type PasswordForm = { currentPassword:string; newPassword:string; confirmPassword:string };

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const profile = useForm<ProfileForm>();
  const password = useForm<PasswordForm>();

  useEffect(() => {
    if (user) profile.reset({ fullName: user.fullName, email: user.email });
  }, [user, profile]);

  async function saveProfile(values: ProfileForm) {
    setError(''); setMessage('');
    try {
      await api.put('/users/me', values);
      await refreshUser();
      setMessage('Profile updated.');
    } catch (e:any) { setError(e.response?.data?.message ?? 'Profile update failed.'); }
  }
  async function changePassword(values: PasswordForm) {
    setError(''); setMessage('');
    if (values.newPassword !== values.confirmPassword) {
      password.setError('confirmPassword', { message: 'Passwords do not match.' });
      return;
    }
    try {
      await api.put('/users/me/password', values);
      password.reset();
      setMessage('Password changed.');
    } catch (e:any) { setError(e.response?.data?.message ?? 'Password change failed.'); }
  }

  return <section className="container-page py-10">
    <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b]">Profile</h1>
    <p className="font-sans text-[#4d4635] text-sm mt-2 mb-8">Manage your account information and password.</p>
    <ErrorAlert message={error} />
    {message && <div className="mb-6 rounded-xl bg-[#d0e9d6] text-[#364c3e] border border-[#5B7564] p-4 text-sm font-semibold" role="status">{message}</div>}
    <div className="grid lg:grid-cols-2 gap-6">
      <form className="card p-7 md:p-8 space-y-4" onSubmit={profile.handleSubmit(saveProfile)}>
        <h2 className="font-serif text-xl font-bold text-[#181c1b] mb-2 border-b border-[#e0e3e1] pb-3">Personal details</h2>
        <div><label className="label" htmlFor="username">Username</label><input id="username" className="input bg-[#f1f4f2] text-[#4d4635]" value={user?.username ?? ''} disabled /></div>
        <div><label className="label" htmlFor="fullName">Full name</label><input id="fullName" className="input" {...profile.register('fullName', { required: 'Full name is required.' })}/><p className="text-[#8A2E2E] text-xs mt-1 font-medium">{profile.formState.errors.fullName?.message}</p></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="input" {...profile.register('email', { required: 'Email is required.' })}/><p className="text-[#8A2E2E] text-xs mt-1 font-medium">{profile.formState.errors.email?.message}</p></div>
        <button className="btn btn-primary mt-2" disabled={profile.formState.isSubmitting}>Save changes</button>
      </form>
      <form className="card p-7 md:p-8 space-y-4" onSubmit={password.handleSubmit(changePassword)}>
        <h2 className="font-serif text-xl font-bold text-[#181c1b] mb-2 border-b border-[#e0e3e1] pb-3">Change password</h2>
        <div><label className="label" htmlFor="currentPassword">Current password</label><input id="currentPassword" type="password" className="input" {...password.register('currentPassword', { required: 'Current password is required.' })}/></div>
        <div><label className="label" htmlFor="newPassword">New password</label><input id="newPassword" type="password" className="input" {...password.register('newPassword', { required: 'New password is required.', minLength: { value: 8, message: 'Use at least 8 characters.' } })}/><p className="text-[#8A2E2E] text-xs mt-1 font-medium">{password.formState.errors.newPassword?.message}</p></div>
        <div><label className="label" htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" type="password" className="input" {...password.register('confirmPassword', { required: true })}/><p className="text-[#8A2E2E] text-xs mt-1 font-medium">{password.formState.errors.confirmPassword?.message}</p></div>
        <button className="btn btn-primary mt-2" disabled={password.formState.isSubmitting}>Change password</button>
      </form>
    </div>
  </section>;
}
