import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import useVisitTracker from '../../hooks/useVisitTracker';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/search', label: '院校查询', icon: '🔍' },
  { path: '/compare', label: '分数线对比', icon: '📊' },
  { path: '/difficulty', label: '难度阶梯', icon: '🧗' },
  { path: '/recommend', label: '择校推荐', icon: '🎯' },
  { path: '/competition', label: '报录比分析', icon: '📈' },
  { path: '/knowledge', label: '考研常识', icon: '📖' },
  { path: '/admin', label: '数据管理', icon: '⚙️', auth: true, admin: true },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useVisitTracker();

  const closeSidebar = () => setSidebarOpen(false);

  const sidebar = (
    <>
      <Link to="/" onClick={closeSidebar} className="px-5 py-4 text-lg font-bold text-blue-600 border-b border-gray-100 block">
        考研择校分析
      </Link>
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.auth && !user) return null;
          if (item.admin && user?.role !== 'admin') return null;
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 p-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{user.username}</p>
              <p className="text-xs text-gray-400">{user.role === 'admin' ? '管理员' : user.role === 'consultant' ? '咨询师' : '学生'}</p>
            </div>
            <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500">退出</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { navigate('/login?mode=login'); closeSidebar(); }}
              className="flex-1 py-2 text-sm text-center text-blue-600 border border-blue-300 hover:bg-blue-50 rounded-lg transition-colors"
            >
              登录
            </button>
            <button
              onClick={() => { navigate('/login'); closeSidebar(); }}
              className="flex-1 py-2 text-sm text-center text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              注册
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebar}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={closeSidebar} />
          <aside className="relative w-64 bg-white flex flex-col z-50 animate-slide-in">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-800"
            aria-label="打开菜单"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="font-bold text-blue-600 text-sm">考研择校分析</Link>
        </div>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
