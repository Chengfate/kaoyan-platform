import { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { scoreLines, schools, majors } from '../api';
import type { School, Major } from '../types';

const YEAR_OPTIONS = [2020, 2021, 2022, 2023, 2024];
const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

export default function ScoreComparePage() {
  const [schoolList, setSchoolList] = useState<School[]>([]);
  const [majorList, setMajorList] = useState<Major[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<number | null>(null);
  const [selectedYears, setSelectedYears] = useState<number[]>([2022, 2023, 2024]);
  const [compareData, setCompareData] = useState<Record<string, unknown>[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCompared, setHasCompared] = useState(false);

  useEffect(() => {
    Promise.all([
      schools.list({ page_size: 500 }).then(r => r.data.success && setSchoolList(r.data.data)),
      majors.list({ page_size: 300 }).then(r => r.data.success && setMajorList(r.data.data)),
    ]).catch(() => setError('加载院校/专业列表失败'));
  }, []);

  const filteredSchools = useMemo(() => {
    if (!searchTerm) return schoolList.slice(0, 80);
    const term = searchTerm.toLowerCase();
    return schoolList.filter(s =>
      s.name.toLowerCase().includes(term) ||
      (s.short_name && s.short_name.toLowerCase().includes(term)) ||
      s.province.includes(term)
    ).slice(0, 60);
  }, [schoolList, searchTerm]);

  const toggleSchool = (id: number) => {
    setSelectedSchools(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev);
  };

  const runCompare = async () => {
    if (selectedSchools.length < 1 || !selectedMajor) return;
    setLoading(true);
    setError('');
    try {
      const res = await scoreLines.compare({
        school_ids: selectedSchools,
        major_id: selectedMajor,
        years: selectedYears,
      });
      if (res.data.success) {
        setCompareData(res.data.data);
        setHasCompared(true);
      } else {
        setError('对比查询失败');
      }
    } catch {
      setError('网络请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const chartOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 50, right: 20, top: 20, bottom: 60 },
    xAxis: { type: 'category', data: selectedYears.map(String) },
    yAxis: { type: 'value', name: '分数', min: 200 },
    series: compareData.flatMap((d: any, di) => {
      const lines = d.score_lines || [];
      return [
        {
          name: `${d.school_name} 总分线`,
          type: 'line' as const,
          data: selectedYears.map(y => {
            const found = lines.filter((sl: any) => sl.line_type !== '录取最低分' && sl.line_type !== '录取平均分')
              .find((p: any) => p.year === y);
            return found?.total_score || null;
          }),
          connectNulls: true,
          lineStyle: { color: COLORS[di % COLORS.length], width: 2 },
          itemStyle: { color: COLORS[di % COLORS.length] },
        },
        {
          name: `${d.school_name} 录取均分`,
          type: 'line' as const,
          data: selectedYears.map(y => {
            const found = lines.find((p: any) => p.line_type === '录取平均分' && p.year === y);
            return found?.total_score || null;
          }),
          connectNulls: true,
          lineStyle: { color: COLORS[di % COLORS.length], width: 1.5, type: 'dashed' as const },
          itemStyle: { color: COLORS[di % COLORS.length] },
        },
      ];
    }),
  }), [compareData, selectedYears]);

  const tierBadge = (t: string) => {
    const m: Record<string, string> = { '985': 'bg-red-50 text-red-600', '211': 'bg-orange-50 text-orange-600', '双一流': 'bg-blue-50 text-blue-600' };
    return m[t] || 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-8 text-white">
        <h1 className="text-2xl font-bold">分数线对比分析</h1>
        <p className="mt-2 text-blue-100 text-sm">多所院校、同一专业，历年分数线横向对比，趋势一目了然</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 font-medium">关闭</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selectors */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-4">选择院校（最多5所）</h3>
            <div className="flex flex-wrap gap-1.5 mb-3 min-h-[2rem]">
              {selectedSchools.length === 0 && (
                <span className="text-xs text-gray-400 py-1">点击下方院校或搜索添加对比院校</span>
              )}
              {selectedSchools.map(id => {
                const s = schoolList.find(x => x.id === id);
                return s ? (
                  <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    {s.short_name || s.name}
                    <button onClick={() => toggleSchool(id)} className="ml-1 text-blue-400 hover:text-red-500">&times;</button>
                  </span>
                ) : null;
              })}
            </div>
            <input
              type="text" placeholder="搜索院校名称或省份..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-1">
              {filteredSchools.map(s => {
                const sel = selectedSchools.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSchool(s.id)}
                    className={`text-left px-3 py-1.5 rounded text-sm transition-colors truncate ${
                      sel ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                    }`}>
                    <span className={`text-xs px-1 py-0.5 rounded mr-1.5 ${tierBadge(s.tier)}`}>{s.tier}</span>
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Major & year */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 mb-4">对比设置</h3>
          <label className="block text-xs text-gray-400 mb-1">选择专业</label>
          <select value={selectedMajor || ''} onChange={e => setSelectedMajor(parseInt(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">请选择专业</option>
            {majorList.map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
            ))}
          </select>

          <label className="block text-xs text-gray-400 mb-1">选择年份</label>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {YEAR_OPTIONS.map(y => (
              <button key={y} onClick={() => setSelectedYears(prev => prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y].sort())}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedYears.includes(y) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{y}</button>
            ))}
          </div>

          <button onClick={runCompare} disabled={selectedSchools.length < 1 || !selectedMajor || loading}
            className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors">
            {loading ? '分析中...' : '开始对比'}
          </button>
          {selectedSchools.length < 1 || !selectedMajor ? (
            <p className="text-center text-xs text-gray-400 mt-2">
              {selectedSchools.length < 1 ? '请至少选择一所院校' : '请选择对比专业'}
            </p>
          ) : null}
        </div>
      </div>

      {/* Empty state before first compare */}
      {!hasCompared && !loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
          <div className="text-5xl mb-4">📊</div>
          <p className="font-medium text-gray-500">选择院校和专业后点击"开始对比"</p>
          <p className="text-sm mt-1">支持最多 5 所院校同专业分数线横向对比，含趋势图分析</p>
        </div>
      )}

      {/* No data after compare */}
      {hasCompared && !loading && compareData.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-medium text-gray-500">所选条件暂无对比数据</p>
          <p className="text-sm mt-1">请尝试选择其他院校、专业或年份组合</p>
        </div>
      )}

      {/* Results */}
      {compareData.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">对比结果汇总</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">院校</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">层次</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">省份</th>
                    {selectedYears.sort().map(y => (
                      <th key={y} className="text-center px-4 py-3 font-medium text-gray-600">{y}年总分线</th>
                    ))}
                    <th className="text-center px-4 py-3 font-medium text-gray-600">趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {compareData.map((d: any) => {
                    const scores = selectedYears.sort().map(y => {
                      const found = (d.score_lines || []).filter((sl: any) => sl.line_type !== '录取最低分' && sl.line_type !== '录取平均分')
                        .find((p: any) => p.year === y);
                      return found?.total_score || null;
                    });
                    const validScores = scores.filter((v: number | null): v is number => v != null);
                    const trend = validScores.length >= 2
                      ? validScores[validScores.length - 1]! > validScores[0]! ? '↑ 上升' : validScores[validScores.length - 1]! < validScores[0]! ? '↓ 下降' : '→ 平稳'
                      : '-';
                    return (
                      <tr key={d.school_id} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-800">{d.school_name}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-1.5 py-0.5 rounded ${tierBadge(d.tier)}`}>{d.tier}</span></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{d.school_province}</td>
                        {scores.map((sc, i) => (
                          <td key={i} className="px-4 py-3 text-center">
                            {sc != null ? (
                              <span className={`font-bold text-sm ${sc >= 350 ? 'text-red-600' : sc >= 300 ? 'text-orange-600' : 'text-green-600'}`}>{sc}</span>
                            ) : <span className="text-gray-300">-</span>}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center text-xs">{trend}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">分数线趋势图</h3>
            <ReactECharts option={chartOption} style={{ height: 420 }} />
          </div>
        </>
      )}
    </div>
  );
}
