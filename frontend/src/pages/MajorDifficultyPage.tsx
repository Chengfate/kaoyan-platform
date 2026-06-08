import { useState, useEffect, useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { majors } from '../api';

const DISCIPLINES = ['全部', '哲学', '经济学', '法学', '教育学', '文学', '历史学', '理学', '工学', '农学', '医学', '管理学', '艺术学'];
const YEARS = [2024, 2023, 2022, 2021, 2020];

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  S: { label: 'S 地狱难度', color: '#7c3aed', bg: 'bg-purple-100 text-purple-700', desc: '竞争极其激烈，分数线极高' },
  A: { label: 'A 很难', color: '#ef4444', bg: 'bg-red-100 text-red-700', desc: '热门专业，报录比高，分数线高' },
  B: { label: 'B 较难', color: '#f97316', bg: 'bg-orange-100 text-orange-700', desc: '有一定竞争，需要充分准备' },
  C: { label: 'C 中等', color: '#eab308', bg: 'bg-yellow-100 text-yellow-700', desc: '难度适中，认真备考可上岸' },
  D: { label: 'D 相对容易', color: '#22c55e', bg: 'bg-green-100 text-green-700', desc: '竞争较小，上岸机会较大' },
};

const getTierColor = (d: number) => {
  if (d >= 90) return '#7c3aed';
  if (d >= 75) return '#ef4444';
  if (d >= 55) return '#f97316';
  if (d >= 35) return '#eab308';
  return '#22c55e';
};

interface MajorDiff {
  id: number; code: string; name: string; discipline: string; degree_type: string;
  school_count: number; avg_ratio: number | null; avg_score: number | null;
  max_score: number | null; min_score: number | null;
  difficulty: number; tier: string;
}

export default function MajorDifficultyPage() {
  const [data, setData] = useState<MajorDiff[]>([]);
  const [prevData, setPrevData] = useState<MajorDiff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscipline, setSelectedDiscipline] = useState('全部');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [sortBy, setSortBy] = useState<'difficulty' | 'ratio' | 'score' | 'schools'>('difficulty');
  const [search, setSearch] = useState('');
  const [expandedMajor, setExpandedMajor] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      majors.getDifficulty(selectedYear),
      majors.getDifficulty(selectedYear - 1),
    ]).then(([res, prevRes]) => {
      if (res.data.success) setData(res.data.data as MajorDiff[]);
      if (prevRes.data.success) setPrevData(prevRes.data.data as MajorDiff[]);
    }).finally(() => setLoading(false));
  }, [selectedYear]);

  const prevMap = useMemo(() => {
    const m: Record<number, number> = {};
    prevData.forEach(d => { m[d.id] = d.difficulty; });
    return m;
  }, [prevData]);

  const filtered = useMemo(() => {
    let arr = data;
    if (selectedDiscipline !== '全部') arr = arr.filter(d => d.discipline === selectedDiscipline);
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      arr = arr.filter(d => d.name.toLowerCase().includes(kw) || d.code.includes(kw));
    }
    return arr;
  }, [data, selectedDiscipline, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const key = sortBy === 'difficulty' ? 'difficulty' : sortBy === 'ratio' ? 'avg_ratio' : sortBy === 'score' ? 'avg_score' : 'school_count';
    return arr.sort((a, b) => ((b[key] ?? 0) as number) - ((a[key] ?? 0) as number));
  }, [filtered, sortBy]);

  const tierStats = useMemo(() => {
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    filtered.forEach(d => { counts[d.tier]++; });
    return counts;
  }, [filtered]);

  const summaryStats = useMemo(() => {
    const total = filtered.length;
    if (total === 0) return { total: 0, avgRatio: 0, avgScore: 0, hardestDiscipline: '-' };
    const sumRatio = filtered.reduce((s, d) => s + (d.avg_ratio ?? 0), 0);
    const sumScore = filtered.reduce((s, d) => s + (d.avg_score ?? 0), 0);
    const disciplineAvg: Record<string, number> = {};
    const disciplineCount: Record<string, number> = {};
    filtered.forEach(d => {
      disciplineAvg[d.discipline] = (disciplineAvg[d.discipline] || 0) + d.difficulty;
      disciplineCount[d.discipline] = (disciplineCount[d.discipline] || 0) + 1;
    });
    let hardest = '-';
    let hardestAvg = 0;
    Object.entries(disciplineAvg).forEach(([k, v]) => {
      const avg = v / (disciplineCount[k] || 1);
      if (avg > hardestAvg) { hardestAvg = avg; hardest = k; }
    });
    return {
      total,
      avgRatio: Math.round(sumRatio / total * 10) / 10,
      avgScore: Math.round(sumScore / total),
      hardestDiscipline: hardest,
      hardestAvg: Math.round(hardestAvg),
    };
  }, [filtered]);

  const top10 = useMemo(() => [...filtered].sort((a, b) => b.difficulty - a.difficulty).slice(0, 10), [filtered]);

  // Pie chart for tier distribution
  const pieOption = useMemo(() => ({
    tooltip: { formatter: '{b}: {c} 个 ({d}%)' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '45%'],
      label: { show: true, formatter: '{b}\n{d}%', fontSize: 10 },
      emphasis: { label: { fontSize: 16, fontWeight: 'bold' } },
      data: Object.entries(TIER_CONFIG).map(([k, cfg]) => ({
        name: cfg.label, value: tierStats[k],
        itemStyle: { color: cfg.color },
      })),
    }],
  }), [tierStats]);

  // Bar chart for top 10 hardest
  const barOption = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = params[0]; const d = top10[p.dataIndex];
        return `<b>${d.name}</b> (${d.code})<br/>难度分: ${d.difficulty} [${d.tier}]<br/>报录比: ${d.avg_ratio}:1<br/>均分: ${d.avg_score}<br/>学科: ${d.discipline}`;
      },
    },
    grid: { left: 160, right: 60, top: 10, bottom: 20 },
    xAxis: { type: 'value', name: '综合难度分', max: 100 },
    yAxis: {
      type: 'category',
      data: top10.map(d => `${d.name}(${d.code})`).reverse(),
      axisLabel: { fontSize: 10, width: 140, overflow: 'truncate' },
      inverse: true,
    },
    series: [{
      type: 'bar',
      data: top10.map(d => ({
        value: d.difficulty,
        itemStyle: { color: getTierColor(d.difficulty), borderRadius: [0, 4, 4, 0] },
      })).reverse(),
      label: { show: true, position: 'right', formatter: '{c}', fontSize: 10 },
    }],
  }), [top10]);

  const scatterOption = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data;
        return `<b>${d[2]}</b> (${d[3]})<br/>难度分: ${d[4]} [${d[5]}级]<br/>均分: ${d[0]} | 报录比: ${d[1]}:1<br/>开设院校: ${d[6]}所`;
      },
    },
    grid: { left: 70, right: 30, top: 20, bottom: 50 },
    xAxis: { type: 'value', name: '平均分数线', min: 250, max: 450 },
    yAxis: { type: 'value', name: '平均报录比' },
    series: ['S', 'A', 'B', 'C', 'D'].map(tier => ({
      name: TIER_CONFIG[tier].label,
      type: 'scatter',
      symbolSize: (val: number[]) => Math.max(8, Math.min(28, (val[6] || 0) / 8)),
      data: sorted
        .filter(d => d.tier === tier)
        .map(d => [d.avg_score || 0, d.avg_ratio || 0, d.name, d.discipline, d.difficulty, d.tier, d.school_count]),
      itemStyle: { color: TIER_CONFIG[tier].color, opacity: 0.75 },
      emphasis: { itemStyle: { opacity: 1, shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
    })),
  }), [sorted]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 rounded-xl p-8 text-white">
        <h1 className="text-2xl font-bold">考研专业难易程度阶梯</h1>
        <p className="mt-2 text-purple-200 text-sm">基于历年复试分数线和报录比数据，综合分析专业报考难度排行</p>
      </div>

      {/* Summary Stats */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-400 mb-1">当前筛选专业数</div>
            <div className="text-2xl font-extrabold text-gray-800">{summaryStats.total}</div>
            <div className="text-xs text-gray-400 mt-1">{selectedDiscipline === '全部' ? '全部学科' : selectedDiscipline}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-400 mb-1">平均报录比</div>
            <div className="text-2xl font-extrabold text-orange-600">{summaryStats.avgRatio}:1</div>
            <div className="text-xs text-gray-400 mt-1">报考人数 ÷ 录取人数</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-400 mb-1">平均复试线</div>
            <div className="text-2xl font-extrabold text-blue-600">{summaryStats.avgScore}</div>
            <div className="text-xs text-gray-400 mt-1">{selectedYear}年院校复试线均分</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="text-xs text-gray-400 mb-1">最难学科门类</div>
            <div className="text-2xl font-extrabold text-purple-600">{summaryStats.hardestDiscipline}</div>
            <div className="text-xs text-gray-400 mt-1">平均难度分 {summaryStats.hardestAvg}</div>
          </div>
        </div>
      )}

      {/* Tier Distribution Cards */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(TIER_CONFIG).map(([key, cfg]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-xs font-bold mb-1" style={{ color: cfg.color }}>{cfg.label}</div>
            <div className="text-2xl font-extrabold text-gray-800">{tierStats[key]}</div>
            <div className="text-xs text-gray-400 mt-1">个专业</div>
            <div className="text-xs text-gray-400 mt-0.5">{cfg.desc}</div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">学科门类</label>
            <select value={selectedDiscipline} onChange={e => setSelectedDiscipline(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
              {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">数据年份</label>
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
              {YEARS.map(y => <option key={y} value={y}>{y}年</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">排序方式</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
              <option value="difficulty">综合难度</option>
              <option value="ratio">报录比</option>
              <option value="score">分数线</option>
              <option value="schools">开设院校数</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-400 mb-1">搜索专业</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="输入专业名称或代码..."
                className="w-full pl-10 pr-8 py-1.5 border border-gray-200 rounded-lg text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row: Scatter + Pie */}
      {!loading && sorted.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-800 mb-1">专业难度分布图</h2>
            <p className="text-xs text-gray-400 mb-4">横轴为平均分数线，纵轴为平均报录比，气泡大小表示开设院校数量</p>
            <ReactECharts option={scatterOption} style={{ height: 420 }} />
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-800 mb-1">难度等级占比</h2>
            <p className="text-xs text-gray-400 mb-2">{selectedDiscipline === '全部' ? '全部学科' : selectedDiscipline} · {selectedYear}年 · {sorted.length}个专业</p>
            <ReactECharts option={pieOption} style={{ height: 370 }} />
          </div>
        </div>
      )}

      {/* Top 10 Hardest Bar Chart */}
      {!loading && top10.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-800 mb-1">最难考的十大专业</h2>
          <p className="text-xs text-gray-400 mb-4">按综合难度分降序排列 · {selectedYear}年 · {selectedDiscipline === '全部' ? '全部学科' : selectedDiscipline}</p>
          <ReactECharts option={barOption} style={{ height: 350 }} />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">专业难度排行 ({sorted.length} 个)</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
              加载中...
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16 text-gray-400">当前筛选条件下无匹配专业</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200 sticky top-0">
                <tr>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 w-12">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">专业代码</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">专业名称</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">学科门类</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">难度等级</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">综合难度分</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 w-16">趋势</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">平均报录比</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">平均分数线</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">最高/最低分</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">开设院校</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d, i) => {
                  const prevDiff = prevMap[d.id];
                  const trend = prevDiff ? d.difficulty - prevDiff : null;
                  return (
                    <tr key={d.id} className={`border-t border-gray-100 hover:bg-gray-50 ${i < 3 ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-4 py-3 text-center font-bold text-gray-400">
                        {i < 3 ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs ${
                            i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
                          }`}>{i + 1}</span>
                        ) : i + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.code}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{d.name}</td>
                      <td className="px-4 py-3 text-gray-500">{d.discipline}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${TIER_CONFIG[d.tier]?.bg}`}>
                          {TIER_CONFIG[d.tier]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{
                              width: `${d.difficulty}%`,
                              backgroundColor: getTierColor(d.difficulty),
                            }} />
                          </div>
                          <span className="font-bold text-gray-700 w-8 text-xs">{d.difficulty}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {trend != null && Math.abs(trend) >= 1 ? (
                          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                            trend > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {trend > 0 ? '↑' : '↓'}{Math.abs(Math.round(trend))}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium">
                        <span className={(d.avg_ratio ?? 0) > 15 ? 'text-red-600' : (d.avg_ratio ?? 0) > 8 ? 'text-orange-600' : 'text-green-600'}>
                          {d.avg_ratio != null ? `${d.avg_ratio}:1` : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-gray-700">
                        {d.avg_score != null ? d.avg_score : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        {d.max_score != null ? `${d.max_score}` : '-'} / {d.min_score != null ? `${d.min_score}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{d.school_count} 所</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
