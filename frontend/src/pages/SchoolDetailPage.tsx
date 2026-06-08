import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { schools } from '../api';
import CommentSection from '../components/school/CommentSection';
import type { School } from '../types';

const navItems = [
  { key: 'overview', label: '院校概况' },
  { key: 'detail', label: '专业详情' },
  { key: 'comments', label: '评论区' },
];

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [majorSearch, setMajorSearch] = useState('');

  const detailRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    Promise.all([
      schools.get(parseInt(id)),
      schools.getMajorsDetail(parseInt(id)),
    ]).then(([sRes, dRes]) => {
      if (sRes.data.success) setSchool(sRes.data.data);
      if (dRes.data.success) setRows(dRes.data.data);
    }).catch(() => {
      setError('加载院校数据失败，请刷新重试');
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const refs: Record<string, HTMLDivElement | null> = {
      detail: detailRef.current,
      overview: overviewRef.current,
      comments: commentsRef.current,
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = Object.keys(refs).find(k => refs[k] === entry.target);
            if (key) setActiveSection(key);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );
    Object.values(refs).forEach(ref => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, [school]);

  const scrollTo = (key: string) => {
    const refMap: Record<string, HTMLDivElement | null> = {
      detail: detailRef.current,
      overview: overviewRef.current,
      comments: commentsRef.current,
    };
    refMap[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Filter rows by search term, then group by major for rowspan
  const { groupedRows, filteredCount } = useMemo(() => {
    const filtered = !majorSearch.trim() ? rows : rows.filter(row => {
      const term = majorSearch.trim().toLowerCase();
      return (
        (row.major_name as string)?.toLowerCase().includes(term) ||
        (row.major_code as string)?.toLowerCase().includes(term) ||
        (row.department as string)?.toLowerCase().includes(term) ||
        (row.discipline as string)?.toLowerCase().includes(term)
      );
    });
    const groups: { major_id: number; rows: typeof filtered }[] = [];
    for (const row of filtered) {
      const last = groups[groups.length - 1];
      if (last && last.major_id === row.major_id) {
        last.rows.push(row);
      } else {
        groups.push({ major_id: row.major_id as number, rows: [row] });
      }
    }
    return { groupedRows: groups, filteredCount: filtered.length };
  }, [rows, majorSearch]);

  if (loading) return (
    <div className="text-center py-16 text-gray-400">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
      加载中...
    </div>
  );
  if (error) return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">⚠</div>
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
        刷新页面
      </button>
    </div>
  );
  if (!school) return <div className="text-center py-12 text-red-400">院校不存在</div>;

  const tierColor = (t: string) => {
    const c: Record<string, string> = { '985': 'bg-red-100 text-red-700', '211': 'bg-orange-100 text-orange-700', '双一流': 'bg-blue-100 text-blue-700' };
    return c[t] || 'bg-gray-100 text-gray-600';
  };

  const ratioBadge = (r: number | null) => {
    if (r == null) return <span className="text-gray-400">-</span>;
    const cls = r > 15 ? 'bg-red-50 text-red-700' : r > 8 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700';
    return <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cls}`}>{r}:1</span>;
  };

  const schoolId = parseInt(id!);
  const disciplineColors: Record<string, string> = {
    '哲学': 'bg-purple-50 text-purple-700', '经济学': 'bg-yellow-50 text-yellow-700',
    '法学': 'bg-blue-50 text-blue-700', '教育学': 'bg-green-50 text-green-700',
    '文学': 'bg-pink-50 text-pink-700', '历史学': 'bg-orange-50 text-orange-700',
    '理学': 'bg-cyan-50 text-cyan-700', '工学': 'bg-slate-100 text-slate-700',
    '农学': 'bg-lime-50 text-lime-700', '医学': 'bg-red-50 text-red-700',
    '管理学': 'bg-indigo-50 text-indigo-700', '艺术学': 'bg-rose-50 text-rose-700',
    '军事学': 'bg-amber-50 text-amber-700', '交叉学科': 'bg-teal-50 text-teal-700',
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">🏛</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-800">{school.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${tierColor(school.tier)}`}>{school.tier}</span>
              {school.is_self_rated === 1 && <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-orange-100 text-orange-700">自主划线</span>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              <span>📍 {school.province} {school.city || ''}</span>
              <span>🏛 {school.category}</span>
              <span>🔢 代码: {school.code}</span>
              <span>📚 {school.major_count} 个专业</span>
            </div>
            {school.website && (
              <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:text-blue-600 mt-2 inline-block">
                {school.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Nav */}
      <div className="sticky top-0 z-10 bg-white rounded-lg border border-gray-200 p-1 flex gap-1 shadow-sm">
        {navItems.map(s => (
          <button
            key={s.key}
            onClick={() => scrollTo(s.key)}
            className={`flex-1 py-2 text-sm rounded-md font-medium transition-colors ${
              activeSection === s.key ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.label}
            {s.key === 'detail' && ` (${groupedRows.length})`}
          </button>
        ))}
      </div>

      {/* Section: 院校概况 */}
      <div ref={overviewRef} id="section-overview" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-28">
        <h2 className="text-lg font-bold text-gray-800 mb-3">📋 院校概况</h2>
        <p className="text-gray-600 leading-relaxed">
          {school.description || `${school.name}是${school.tier}院校，位于${school.province}${school.city || ''}，属于${school.category}类院校。${school.is_self_rated ? '该校为全国硕士研究生自主划线高校。' : ''}`}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[
            { label: '院校层次', value: school.tier },
            { label: '院校类别', value: school.category },
            { label: '所在省份', value: school.province },
            { label: '招生专业数', value: `${school.major_count} 个` },
            { label: '自主划线', value: school.is_self_rated ? '是' : '否' },
            { label: '所在城市', value: school.city || '-' },
            { label: '院校代码', value: school.code },
            { label: '数据条目', value: `${rows.length} 条` },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400">{item.label}</div>
              <div className="text-sm font-medium text-gray-700 mt-1">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: 专业详情合并表格 */}
      <div ref={detailRef} id="section-detail" className="bg-white rounded-xl border border-gray-200 overflow-hidden scroll-mt-28">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">
              📊 专业分数线 & 报录数据 ({groupedRows.length} 个专业{filteredCount !== rows.length ? ` / 共${rows.length}条` : ''})
            </h2>
            <span className="text-xs text-gray-400">同一专业按年份排列，可横向对比分数线与报录比</span>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索专业名称、代码、院系或学科门类..."
              value={majorSearch}
              onChange={e => setMajorSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {majorSearch && (
              <button
                onClick={() => setMajorSearch('')}
                className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left px-3 py-3 font-medium text-gray-600 w-24">专业代码</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">专业名称</th>
                <th className="text-left px-3 py-3 font-medium text-gray-600">院系</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 w-16">年份</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 w-20">总分线</th>
                <th className="text-center px-2 py-3 font-medium text-gray-600 w-28">
                  <div>单科线</div>
                  <div className="text-xs text-gray-400 font-normal">政/英/数/专</div>
                </th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 w-20">报录比</th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 w-28">
                  <div>报考→录取</div>
                  <div className="text-xs text-gray-400 font-normal">(推免)</div>
                </th>
                <th className="text-center px-3 py-3 font-medium text-gray-600 w-20">录取均分</th>
              </tr>
            </thead>
            <tbody>
              {groupedRows.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">
                  {majorSearch ? '当前搜索条件下无匹配专业' : '暂无数据'}
                </td></tr>
              ) : (
                groupedRows.map(group => (
                  group.rows.map((row, ri) => {
                    const hasYear = row.year != null;
                    return (
                      <tr key={`${group.major_id}-${ri}`} className={`border-t border-gray-100 ${ri === 0 ? 'bg-gray-50/50' : 'hover:bg-gray-50/50'}`}>
                        {ri === 0 && (
                          <>
                            <td rowSpan={group.rows.length} className="px-3 py-2.5 font-mono text-xs text-gray-500 align-top">
                              {row.major_code as string}
                            </td>
                            <td rowSpan={group.rows.length} className="px-3 py-2.5 align-top">
                              <div className="font-medium text-gray-800">{row.major_name as string}</div>
                              <div className="flex gap-1 mt-0.5">
                                <span className={`text-xs px-1 rounded ${disciplineColors[row.discipline as string] || 'bg-gray-50 text-gray-600'}`}>
                                  {row.discipline as string}
                                </span>
                                <span className="text-xs text-gray-400">{row.degree_type as string}</span>
                              </div>
                            </td>
                            <td rowSpan={group.rows.length} className="px-3 py-2.5 text-gray-500 text-xs align-top">
                              {row.department as string || '-'}
                            </td>
                          </>
                        )}
                        {hasYear ? (
                          <>
                            <td className="px-3 py-2.5 text-center font-mono font-medium text-gray-700">{row.year as number}</td>
                            <td className="px-3 py-2.5 text-center">
                              {row.total_score != null ? (
                                <span className={`font-bold text-sm ${
                                  (row.total_score as number) >= 350 ? 'text-red-600' :
                                  (row.total_score as number) >= 300 ? 'text-orange-600' : 'text-green-600'
                                }`}>{row.total_score as number}</span>
                              ) : <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              {row.politics != null ? (
                                <span className="text-xs text-gray-500">
                                  {row.politics as number}/{row.english as number}/{row.math != null ? row.math as number : '-'}/{row.major_course != null ? row.major_course as number : '-'}
                                </span>
                              ) : <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-3 py-2.5 text-center">{ratioBadge(row.competition_ratio as number | null)}</td>
                            <td className="px-3 py-2.5 text-center">
                              {row.total_applicants != null ? (
                                <span className="text-xs">
                                  <span className="text-gray-700 font-medium">{row.total_applicants as number}</span>
                                  <span className="text-gray-400 mx-1">→</span>
                                  <span className="text-blue-600 font-medium">{row.admit_actual as number}</span>
                                  {(row.admit_exempt as number) > 0 && (
                                    <span className="text-gray-400 ml-1">({row.admit_exempt as number})</span>
                                  )}
                                </span>
                              ) : <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {row.avg_admit_score != null ? (
                                <span className="font-medium text-gray-700">{row.avg_admit_score as number}</span>
                              ) : <span className="text-gray-400">-</span>}
                            </td>
                          </>
                        ) : (
                          <td colSpan={6} className="px-3 py-2.5 text-center text-gray-400 text-xs">暂无分数线及报录数据</td>
                        )}
                      </tr>
                    );
                  })
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section: 评论区 */}
      <div ref={commentsRef} id="section-comments" className="bg-white rounded-xl border border-gray-200 p-6 scroll-mt-28">
        <CommentSection schoolId={schoolId} />
      </div>
    </div>
  );
}
