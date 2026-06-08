import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { admin, visits } from '../api';
import client from '../api/client';
import type { DataUpdateLog, AdminUser, UserStats, VisitStats, VisitLog } from '../types';

const TABS = [
  { key: 'data', label: '数据管理' },
  { key: 'users', label: '用户管理' },
  { key: 'visits', label: '访问分析' },
];

export default function AdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');

  // Redirect non-admin
  useEffect(() => {
    if (user === null && !localStorage.getItem('token')) {
      navigate('/login');
    }
    // Check after store loads - if not admin, redirect
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role !== 'admin') navigate('/');
      } catch { navigate('/'); }
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-4xl mb-3">🔒</div>
        <p className="font-medium text-gray-500">需要管理员权限</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
          前往登录
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">管理后台</h1>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {user.role === 'admin' ? '管理员' : ''} · {user.username}
        </span>
      </div>

      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-colors ${
              tab === t.key ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'data' && <DataTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'visits' && <VisitsTab />}
    </div>
  );
}

// ==================== Data Management Tab ====================

function DataTab() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<DataUpdateLog[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [scraping, setScraping] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    const r = await admin.stats();
    if (r.data.success) setStats(r.data.data);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const fetchLogs = async () => {
    const r = await admin.scrapeLogs();
    if (r.data.success) { setLogs(r.data.data); setLogsLoaded(true); }
  };

  const triggerScrape = async (type: string) => {
    setScraping(type);
    try {
      await client.post(`/admin/scrape/${type}`);
      setTimeout(() => { loadStats(); fetchLogs(); }, 3000);
    } catch { /* ignore */ }
    setScraping(null);
  };

  const statCards = [
    { label: '院校总数', value: stats?.total_schools ?? '-', color: 'text-blue-600' },
    { label: '专业总数', value: stats?.total_majors ?? '-', color: 'text-purple-600' },
    { label: '分数线条数', value: stats?.total_score_lines ?? '-', color: 'text-orange-600' },
    { label: '报录数据条数', value: stats?.total_admissions ?? '-', color: 'text-green-600' },
    { label: '注册用户', value: stats?.total_users ?? '-', color: 'text-teal-600' },
  ];

  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        {statCards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-400 mb-1">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{String(c.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">手动数据抓取</h2>
          <div className="space-y-2.5">
            {[
              { type: 'schools', label: '抓取院校数据', icon: '🏫' },
              { type: 'majors', label: '抓取专业目录', icon: '📚' },
              { type: 'score-lines', label: '抓取国家线', icon: '📋' },
            ].map(a => (
              <button
                key={a.type}
                onClick={() => triggerScrape(a.type)}
                disabled={scraping !== null}
                className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <span>{a.icon}</span> <span>{a.label}</span>
                {scraping === a.type && <span className="ml-auto text-xs text-blue-500">抓取中...</span>}
              </button>
            ))}
          </div>
          {stats?.scheduler && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                定时任务: {(stats.scheduler as { running: boolean; jobCount: number }).jobCount} 个运行中
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">更新日志</h2>
            <button onClick={fetchLogs} className="px-3 py-1.5 text-xs border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
              刷新
            </button>
          </div>
          {!logsLoaded ? (
            <p className="text-sm text-gray-400 text-center py-8">点击"刷新"加载日志</p>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">暂无记录</p>
          ) : (
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">数据源</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">状态</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-500">新增</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-500">更新</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-500">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">{log.source}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          log.status === 'success' ? 'bg-green-50 text-green-700' :
                          log.status === 'running' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {log.status === 'success' ? '成功' : log.status === 'running' ? '运行中' : '失败'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{log.records_added}</td>
                      <td className="px-3 py-2 text-right">{log.records_updated}</td>
                      <td className="px-3 py-2 text-gray-400">{log.finished_at || log.started_at || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ==================== Users Tab ====================

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null);

  const loadUsers = useCallback(async (p: number) => {
    setLoading(true);
    const params: Record<string, string | number> = { page: p, page_size: 20 };
    if (search.trim()) params.search = search.trim();
    if (roleFilter !== 'all') params.role = roleFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    const r = await admin.listUsers(params);
    if (r.data.success) {
      setUsers(r.data.data);
      if (r.data.pagination) {
        setTotalPages(r.data.pagination.total_pages);
      }
    }
    setLoading(false);
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    admin.getUserStats().then(r => { if (r.data.success) setUserStats(r.data.data); });
  }, []);

  useEffect(() => { loadUsers(page); }, [page, roleFilter, statusFilter]);

  const handleSearch = () => { setPage(1); loadUsers(1); };

  const handleToggle = async (id: number) => {
    const r = await admin.toggleUser(id);
    if (r.data.success) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: r.data.data.is_active ? 1 : 0 } : u));
    }
  };

  const handleDelete = async (id: number) => {
    const r = await admin.deleteUser(id);
    if (r.data.success) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setConfirmDelete(null);
    }
  };

  const roleBadge = (role: string) => {
    if (role === 'admin') return 'bg-red-50 text-red-700';
    if (role === 'consultant') return 'bg-purple-50 text-purple-700';
    return 'bg-blue-50 text-blue-700';
  };
  const roleLabel = (role: string) => role === 'admin' ? '管理员' : role === 'consultant' ? '咨询师' : '学生';

  return (
    <div className="space-y-6">
      {/* User stats */}
      {userStats && (
        <div className="grid grid-cols-7 gap-3">
          {[
            { label: '总用户', value: userStats.total, color: 'text-gray-800' },
            { label: '活跃', value: userStats.active, color: 'text-green-600' },
            { label: '已禁用', value: userStats.inactive, color: 'text-red-600' },
            { label: '学生', value: userStats.students, color: 'text-blue-600' },
            { label: '咨询师', value: userStats.consultants, color: 'text-purple-600' },
            { label: '管理员', value: userStats.admins, color: 'text-red-600' },
            { label: '今日新增', value: userStats.today, color: 'text-teal-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-400 mb-1">搜索用户名/邮箱</label>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="输入关键词..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">角色</label>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="all">全部角色</option>
              <option value="student">学生</option>
              <option value="consultant">咨询师</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">状态</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="all">全部</option>
              <option value="active">活跃</option>
              <option value="inactive">已禁用</option>
            </select>
          </div>
          <button onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
            搜索
          </button>
        </div>
      </div>

      {/* User table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-3 font-medium text-gray-600 text-xs">用户名</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 text-xs">手机号</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 text-xs">省份</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 text-xs">本科学校</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 text-xs">年级</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 text-xs">专业</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 text-xs">角色</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 text-xs">状态</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 text-xs">访问</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600 text-xs">注册时间</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 text-xs">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400">加载中...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400">暂无用户</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2.5 font-medium text-gray-800 text-sm">{u.username}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{u.phone || '-'}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{u.province || '-'}</td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs max-w-[120px] truncate" title={u.undergraduate_school || ''}>{u.undergraduate_school || '-'}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500 text-xs">{u.grade || '-'}</td>
                    <td className="px-3 py-2.5 text-center text-gray-500 text-xs max-w-[80px] truncate" title={u.major_name || ''}>{u.major_name || '-'}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadge(u.role)}`}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        u.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {u.is_active ? '正常' : '已禁用'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-600 text-xs">{u.visit_count}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-400">{u.created_at?.slice(0, 10)}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex gap-1.5 justify-center">
                        {u.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleToggle(u.id)}
                              className={`text-xs px-2 py-1 rounded ${u.is_active ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                            >
                              {u.is_active ? '禁用' : '启用'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ id: u.id, name: u.username })}
                              className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                            >
                              删除
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              上一页
            </button>
            <span className="text-sm text-gray-500">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              下一页
            </button>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 mx-4 max-w-sm w-full z-10 animate-fade-in">
            <h3 className="font-bold text-gray-800">确认删除用户</h3>
            <p className="text-sm text-gray-500 mt-2">
              确定要删除用户 <span className="font-medium text-red-600">{confirmDelete.name}</span> 吗？
              此操作不可撤销，该用户的评论和推荐数据也将被清除。
            </p>
            <div className="flex gap-3 mt-5 justify-end">
              <button onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
                取消
              </button>
              <button onClick={() => handleDelete(confirmDelete.id)}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Visits Tab ====================

function VisitsTab() {
  const [vStats, setVStats] = useState<VisitStats | null>(null);
  const [visitList, setVisitList] = useState<VisitLog[]>([]);
  const [vPage, setVPage] = useState(1);
  const [vTotalPages, setVTotalPages] = useState(1);
  const [vLoading, setVLoading] = useState(false);
  const [usernameFilter, setUsernameFilter] = useState('');

  const loadVisitStats = useCallback(async () => {
    const r = await admin.visitStats();
    if (r.data.success) setVStats(r.data.data);
  }, []);

  const loadVisits = useCallback(async (p: number) => {
    setVLoading(true);
    const params: Record<string, string | number> = { page: p, page_size: 50 };
    if (usernameFilter.trim()) params.username = usernameFilter.trim();
    const r = await admin.listVisits(params);
    if (r.data.success) {
      setVisitList(r.data.data);
      if (r.data.pagination) setVTotalPages(r.data.pagination.total_pages);
    }
    setVLoading(false);
  }, [usernameFilter]);

  useEffect(() => { loadVisitStats(); }, [loadVisitStats]);
  useEffect(() => { loadVisits(vPage); }, [vPage, loadVisits]);

  const handleVSearch = () => { setVPage(1); loadVisits(1); };

  return (
    <div className="space-y-6">
      {/* Visit stats */}
      {vStats && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: '总访问量', value: vStats.totalVisits, color: 'text-blue-600' },
              { label: '独立访客(IP)', value: vStats.uniqueIps, color: 'text-purple-600' },
              { label: '今日访问', value: vStats.todayVisits, color: 'text-green-600' },
              { label: '热门页面', value: vStats.topPages[0]?.page || '-', color: 'text-orange-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{String(s.value)}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Top pages */}
          {vStats.topPages.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-medium text-gray-700 mb-3">热门页面 Top 10</h3>
              <div className="space-y-2">
                {vStats.topPages.map((p, i) => (
                  <div key={p.page} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <span className="text-sm text-gray-600 flex-1">{p.page}</span>
                    <span className="text-sm font-medium text-gray-800">{p.count}</span>
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${(p.count / vStats.topPages[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Visit log table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">访问记录</h3>
            <div className="flex gap-2">
              <input
                value={usernameFilter} onChange={e => setUsernameFilter(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVSearch()}
                placeholder="筛选用户名..."
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-40"
              />
              <button onClick={handleVSearch}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                筛选
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">用户</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">访问页面</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">时间</th>
              </tr>
            </thead>
            <tbody>
              {vLoading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">加载中...</td></tr>
              ) : visitList.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">暂无访问记录</td></tr>
              ) : (
                visitList.map(v => (
                  <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      {v.username ? (
                        <span className="font-medium text-gray-700">{v.username}</span>
                      ) : (
                        <span className="text-gray-400 italic">未登录访客</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{v.page}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{v.ip || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{v.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {vTotalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100">
            <button onClick={() => setVPage(p => Math.max(1, p - 1))} disabled={vPage <= 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              上一页
            </button>
            <span className="text-sm text-gray-500">{vPage} / {vTotalPages}</span>
            <button onClick={() => setVPage(p => Math.min(vTotalPages, p + 1))} disabled={vPage >= vTotalPages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
