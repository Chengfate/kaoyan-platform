import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl font-extrabold text-gray-200 mb-4">404</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">页面未找到</h1>
        <p className="text-sm text-gray-500 mb-6">您访问的页面不存在或已被移除</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
            返回首页
          </Link>
          <Link to="/search" className="px-5 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            院校查询
          </Link>
        </div>
      </div>
    </div>
  );
}
