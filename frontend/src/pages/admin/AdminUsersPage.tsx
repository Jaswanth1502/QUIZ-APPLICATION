import { useEffect, useState } from 'react';
import { BarChart3, Download, X } from 'lucide-react';
import api from '../../api/client';
import AdminNav from '../../components/admin/AdminNav';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { Loading } from '../../components/common/Loading';
import { Pagination } from '../../components/common/Pagination';
import type { Page, User } from '../../types';
import { exportUserAnalyticsPdf } from '../../utils/exportPdf';

type UserAnalytics = {
  userId: number;
  fullName: string;
  username: string;
  email: string;
  roles: string[];
  status: string;
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  passRate: number;
  averageScore: number;
  quizBreakdown: Array<{
    quizTitle: string;
    attempts: number;
    avgScore: number;
    passed: number;
    failed: number;
  }>;
  recentAttempts: Array<{
    attemptId: number;
    quizTitle: string;
    percentage: number;
    score: number;
    maximumScore: number;
    correctAnswers: number;
    totalQuestions: number;
    status: string;
    submittedAt: string;
    timeTakenSeconds: number;
  }>;
};

export function AdminUsersPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<User> | null>(null);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const load = () =>
    api
      .get('/admin/users', { params: { page, size: 15, sort: 'createdAt,desc' } })
      .then(({ data }) => setData(data))
      .catch(e => setError(e.response?.data?.message ?? 'Unable to load users.'));

  useEffect(() => {
    void load();
  }, [page]);

  const viewUserAnalytics = async (user: User) => {
    setSelectedUser(user);
    setLoadingAnalytics(true);
    try {
      const { data } = await api.get(`/admin/users/${user.id}/analytics`);
      setAnalytics(data);
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Unable to fetch user analytics.');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  async function changeStatus(user: User, e: React.MouseEvent) {
    e.stopPropagation();
    const status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`${status === 'ACTIVE' ? 'Activate' : 'Deactivate'} ${user.username}?`)) return;
    try {
      await api.patch(`/admin/users/${user.id}/status`, null, { params: { status } });
      await load();
      if (selectedUser?.id === user.id) {
        void viewUserAnalytics(user);
      }
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Unable to update user status.');
    }
  }

  return (
    <section className="container-page py-8">
      <AdminNav />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span className="badge">User Management & Roster</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b] mt-2">User Management</h1>
          <p className="font-sans text-[#4d4635] text-sm mt-1">
            Review accounts, control access, and inspect individual performance analytics.
          </p>
        </div>
      </div>

      <ErrorAlert message={error} />

      {!data && !error ? (
        <Loading />
      ) : (
        data && (
          <div className="card p-7">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Analytics</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map(user => (
                    <tr
                      key={user.id}
                      onClick={() => void viewUserAnalytics(user)}
                      className="cursor-pointer hover:bg-[#f1f4f2] transition-colors"
                    >
                      <td className="font-serif font-bold text-[#181c1b]">{user.fullName}</td>
                      <td className="font-sans text-[#4d4635]">{user.username}</td>
                      <td className="font-sans text-[#4d4635]">{user.email}</td>
                      <td className="font-sans text-xs text-[#5B7564] font-medium">{user.roles.join(', ')}</td>
                      <td>
                        <span
                          className={`badge ${
                            user.status === 'ACTIVE'
                              ? '!bg-[#d0e9d6] !text-[#364c3e] !border-[#5B7564]'
                              : '!bg-[#ffdad6] !text-[#8A2E2E] !border-[#8A2E2E]'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            void viewUserAnalytics(user);
                          }}
                          className="font-sans font-bold text-xs uppercase tracking-wider text-[#735c00] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <BarChart3 className="h-3.5 w-3.5" /> View Analytics
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary text-xs uppercase tracking-wider py-1 px-3"
                          onClick={e => void changeStatus(user, e)}
                        >
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.number} totalPages={data.totalPages} onPage={setPage} />
          </div>
        )
      )}

      {/* User Analytics Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="relative card p-7 sm:p-10 shadow-2xl overflow-y-auto w-full max-w-[96vw] xl:max-w-7xl max-h-[95vh] my-auto">
            {/* Modal Header */}
            <div className="flex flex-wrap items-start justify-between border-b border-[#e0e3e1] pb-4 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge">Participant Roster</span>
                  <span className="text-xs font-mono text-[#5B7564] bg-[#ebefed] px-2.5 py-0.5 border border-[#d0c5af] rounded-lg">
                    User ID: #{selectedUser.id}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#181c1b]">
                  {selectedUser.fullName}
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#4d4635] mt-1">
                  Username: <strong className="text-[#181c1b]">@{selectedUser.username}</strong> · Email:{' '}
                  <strong className="text-[#181c1b]">{selectedUser.email}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => analytics && exportUserAnalyticsPdf(analytics)}
                  disabled={!analytics || loadingAnalytics}
                  className="btn btn-primary text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                  title="Export complete user data as PDF report"
                >
                  <Download className="h-4 w-4" /> EXPORT DATA
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setAnalytics(null);
                  }}
                  className="p-2.5 border border-[#d0c5af] hover:bg-[#ffdad6] text-[#8A2E2E] rounded-xl transition-colors cursor-pointer"
                  aria-label="Close analytics"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {loadingAnalytics ? (
              <Loading label="Fetching participant analytics..." />
            ) : analytics ? (
              <div className="space-y-8 text-left">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="card h-[130px] p-6 flex flex-col justify-center">
                    <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#5B7564]">
                      Total Attempts
                    </p>
                    <p className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b] mt-1">
                      {analytics.totalAttempts}
                    </p>
                  </div>

                  <div className="card h-[130px] p-6 flex flex-col justify-center">
                    <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#5B7564]">
                      Pass Rate
                    </p>
                    <p className="font-serif text-3xl sm:text-4xl font-bold text-[#735c00] mt-1">
                      {analytics.passRate}%
                    </p>
                  </div>

                  <div className="card h-[130px] p-6 flex flex-col justify-center">
                    <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#5B7564]">
                      Average Score
                    </p>
                    <p className="font-serif text-3xl sm:text-4xl font-bold text-[#181c1b] mt-1">
                      {analytics.averageScore}%
                    </p>
                  </div>

                  <div className="card h-[130px] p-6 flex flex-col justify-center">
                    <p className="font-sans text-xs font-bold uppercase tracking-wider text-[#5B7564]">
                      Passed / Failed
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-serif text-2xl font-bold text-[#364c3e]">
                        {analytics.passedAttempts} P
                      </span>
                      <span className="text-sm text-[#d0c5af]">/</span>
                      <span className="font-serif text-2xl font-bold text-[#8A2E2E]">
                        {analytics.failedAttempts} F
                      </span>
                    </div>
                  </div>
                </div>

                {/* Donut Chart & Quiz Performance Section */}
                <div className="grid md:grid-cols-12 gap-6 items-center card p-6 sm:p-8 bg-[#f7faf8]">
                  {/* SVG Donut Chart for Average Score */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-[#ffffff] border border-[#d0c5af] rounded-2xl shadow-xs">
                    <span className="font-serif text-xl font-bold text-[#181c1b] mb-4">
                      Average Score Index
                    </span>

                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        {/* Background track circle */}
                        <path
                          className="text-[#e0e3e1]"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Foreground score progress circle */}
                        <path
                          className="text-[#D4AF37]"
                          strokeDasharray={`${analytics.averageScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-serif text-3xl font-bold text-[#181c1b]">
                          {analytics.averageScore}%
                        </span>
                        <span className="font-sans text-[11px] text-[#5B7564] font-bold uppercase tracking-wider mt-0.5">
                          Overall Avg
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-xs text-[#4d4635] text-center mt-4">
                      {analytics.passRate >= 70
                        ? 'High academic performance across attempted quizzes.'
                        : 'Requires review in specific category subjects.'}
                    </p>
                  </div>

                  {/* Quiz Breakdown Progress Bars */}
                  <div className="md:col-span-8 space-y-4 text-left">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181c1b] border-b border-[#d0c5af] pb-2">
                      Quiz Attempts & Score Distribution
                    </h3>

                    {analytics.quizBreakdown.length ? (
                      analytics.quizBreakdown.map((item, i) => (
                        <div key={i} className="space-y-1.5 bg-[#ffffff] p-4 rounded-xl border border-[#e0e3e1]">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-[#181c1b] font-sans">
                              {item.quizTitle}
                            </span>
                            <span className="font-serif font-bold text-[#735c00]">
                              {item.avgScore}% avg ({item.attempts} attempt{item.attempts > 1 ? 's' : ''})
                            </span>
                          </div>
                          <div className="h-2.5 w-full bg-[#e0e3e1] rounded-full overflow-hidden border border-[#d0c5af]">
                            <div
                              className="h-full bg-[#D4AF37] transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(0, item.avgScore))}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="font-sans text-sm text-[#4d4635]">No quiz attempts recorded yet.</p>
                    )}
                  </div>
                </div>

                {/* Recent Attempts Roster Table */}
                <div className="space-y-3">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#181c1b]">Recent Quiz Attempts</h3>
                  {analytics.recentAttempts.length ? (
                    <div className="table-wrap bg-[#ffffff]">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Quiz Title</th>
                            <th>Score</th>
                            <th>Correct</th>
                            <th>Time Taken</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recentAttempts.map(att => (
                            <tr key={att.attemptId}>
                              <td className="font-sans font-bold text-[#181c1b]">{att.quizTitle}</td>
                              <td className="font-serif font-bold text-[#181c1b]">
                                {Number(att.percentage).toFixed(1)}%
                              </td>
                              <td className="font-sans text-xs text-[#181c1b]">
                                {att.correctAnswers} / {att.totalQuestions}
                              </td>
                              <td className="font-sans text-xs text-[#4d4635]">
                                {att.timeTakenSeconds
                                  ? `${Math.floor(att.timeTakenSeconds / 60)}m ${att.timeTakenSeconds % 60}s`
                                  : 'N/A'}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    att.status === 'PASS'
                                      ? '!bg-[#d0e9d6] !text-[#364c3e] !border-[#5B7564]'
                                      : '!bg-[#ffdad6] !text-[#8A2E2E] !border-[#8A2E2E]'
                                  }`}
                                >
                                  {att.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="font-sans text-sm text-[#4d4635]">No recent attempts recorded.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
