import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { schools, admin } from '../api';
import type { School } from '../types';

const QUICK_TIERS = ['985', '211', '双一流'];
const TIER_COLORS: Record<string, string> = {
  '985': 'from-red-500 to-pink-500 text-white',
  '211': 'from-orange-500 to-amber-500 text-white',
  '双一流': 'from-blue-500 to-cyan-500 text-white',
};
const TIER_LABEL: Record<string, string> = {
  '985': 'bg-red-100 text-red-700', '211': 'bg-orange-100 text-orange-700', '双一流': 'bg-blue-100 text-blue-700',
};

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [topSchools, setTopSchools] = useState<Record<string, School[]>>({});
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    admin.stats().then(res => { if (res.data.success) setStats(res.data.data); }).catch(() => {});
  }, []);

  useEffect(() => {
    // Load top schools for each tier
    const loaded: Record<string, School[]> = {};
    Promise.all(QUICK_TIERS.map(tier =>
      schools.list({ tier, page_size: 6 }).then(res => {
        if (res.data.success) loaded[tier] = res.data.data;
      })
    )).then(() => setTopSchools(loaded)).catch(() => {});
  }, []);

  const handleSearch = () => {
    if (keyword.trim()) navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    else navigate('/search');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-10 md:p-16 text-white text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">考研择校分析平台</h1>
        <p className="mt-4 text-blue-200 text-lg max-w-2xl mx-auto">聚合真实考研数据，智能分析院校专业匹配度、竞争激烈程度，帮助考生科学选择目标院校</p>
        <div className="mt-8 max-w-xl mx-auto flex gap-2">
          <input
            value={keyword} onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="输入院校名称快速查询..."
            className="flex-1 px-5 py-3 rounded-xl text-gray-800 text-sm outline-none border-0"
          />
          <button onClick={handleSearch}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-sm transition-colors">
            查询
          </button>
        </div>
        <div className="mt-6 flex justify-center gap-3 text-sm text-blue-200">
          <button onClick={() => navigate('/search')} className="hover:text-white">院校查询</button>
          <span>|</span>
          <button onClick={() => navigate('/compare')} className="hover:text-white">分数线对比</button>
          <span>|</span>
          <button onClick={() => navigate('/difficulty')} className="hover:text-white">难度阶梯</button>
          <span>|</span>
          <button onClick={() => navigate('/recommend')} className="hover:text-white">智能推荐</button>
          <span>|</span>
          <button onClick={() => navigate('/competition')} className="hover:text-white">报录比分析</button>
          <span>|</span>
          <button onClick={() => navigate('/knowledge')} className="hover:text-white">考研常识</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '收录院校', value: stats.total_schools || '-', icon: '🏛', color: 'from-blue-50 to-blue-100 border-blue-200' },
          { label: '硕士专业', value: stats.total_majors || '-', icon: '📚', color: 'from-green-50 to-green-100 border-green-200' },
          { label: '分数线数据', value: stats.total_score_lines || '-', icon: '📊', color: 'from-orange-50 to-orange-100 border-orange-200' },
          { label: '报录数据', value: stats.total_admissions || '-', icon: '📈', color: 'from-purple-50 to-purple-100 border-purple-200' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl border p-5`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className="text-2xl font-extrabold text-gray-800">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schools by tier */}
      <div className="space-y-6">
        {QUICK_TIERS.map(tier => (
          <div key={tier}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`bg-gradient-to-r ${TIER_COLORS[tier]} text-xs font-bold px-3 py-1 rounded-full`}>{tier}</div>
                <span className="text-sm text-gray-400">热门院校</span>
              </div>
              <Link to={`/search?tier=${tier}`} className="text-xs text-blue-500 hover:text-blue-600">查看全部 →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(topSchools[tier] || []).map(s => (
                <Link key={s.id} to={`/schools/${s.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all group">
                  <div className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors truncate">{s.name}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${TIER_LABEL[tier]}`}>{tier}</span>
                    <span className="text-xs text-gray-400">{s.province}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {s.category} · {s.major_count}个专业
                    {s.is_self_rated === 1 && <span className="ml-1 text-orange-500">· 自主划线</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: '📊 分数线对比', desc: '多校同专业分数横向对比，趋势图一目了然', link: '/compare', color: 'border-l-4 border-blue-400' },
          { title: '🧗 难度阶梯', desc: '各专业难易程度排名，S/A/B/C/D五级分类', link: '/difficulty', color: 'border-l-4 border-purple-400' },
          { title: '🎯 智能择校推荐', desc: '基于个人背景的五因子模型智能匹配', link: '/recommend', color: 'border-l-4 border-green-400' },
          { title: '📈 报录比排行', desc: '各专业竞争激烈程度排名与历年趋势', link: '/competition', color: 'border-l-4 border-orange-400' },
          { title: '📖 考研常识', desc: '报考、分数线、复试调剂等全面知识解析', link: '/knowledge', color: 'border-l-4 border-teal-400' },
          { title: '🔍 院校查询', desc: '按省份、层次、类别精准筛选目标院校', link: '/search', color: 'border-l-4 border-indigo-400' },
        ].map(item => (
          <Link key={item.link} to={item.link}
            className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow ${item.color}`}>
            <h3 className="font-bold text-gray-800">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {stats.last_update && (
        <div className="text-center text-xs text-gray-400 pb-6">
          最近数据更新：{stats.last_update as string}
        </div>
      )}
    </div>
  );
}
