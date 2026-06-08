import { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { admissions, majors } from '../api';
import type { AdmissionData, Major } from '../types';

const DISCIPLINES = ['全部', '哲学', '经济学', '法学', '教育学', '文学', '历史学', '理学', '工学', '农学', '医学', '管理学', '艺术学'];
const TIERS = ['全部', '985', '211', '双一流', '普通一本'];
const YEARS = [2025, 2024, 2023, 2022, 2021, 2020];
const TIER_SCORE: Record<string, number> = { '985': 95, '211': 80, '双一流': 70, '普通一本': 50, '二本': 35, '其他': 20 };

export default function CompetitionPage() {
  const [allMajors, setAllMajors] = useState<Major[]>([]);
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState('全部');
  const [selectedTier, setSelectedTier] = useState('全部');
  const [selectedYear, setSelectedYear] = useState(2024);
  const [rankings, setRankings] = useState<AdmissionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Trend state
  const [trendSchoolId, setTrendSchoolId] = useState<number | null>(null);
  const [trendData, setTrendData] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    majors.list({ page_size: 500 }).then(res => {
      if (res.data.success) setAllMajors(res.data.data);
    }).catch(() => { /* non-critical */ });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params: Record<string, string | number> = { year: selectedYear, page_size: 100 };
    if (selectedMajorId) params.major_id = selectedMajorId;
    admissions.rankings(params).then(res => {
      if (res.data.success) {
        let data = res.data.data;
        if (selectedDiscipline !== '全部') {
          data = data.filter((d: any) => d.discipline === selectedDiscipline);
        }
        if (selectedTier !== '全部') {
          data = data.filter((d: any) => d.school_tier === selectedTier);
        }
        setRankings(data.slice(0, 50));
      }
    }).catch(() => {
      setError('加载排名数据失败，请重试');
    }).finally(() => setLoading(false));
  }, [selectedMajorId, selectedYear]);

  // Load trend data when school is selected
  useEffect(() => {
    if (!trendSchoolId || !selectedMajorId) return;
    admissions.competition(trendSchoolId, selectedMajorId).then(res => {
      if (res.data.success) setTrendData(res.data.data);
    });
  }, [trendSchoolId, selectedMajorId]);

  const filteredRankings = useMemo(() => {
    let data = rankings;
    if (selectedDiscipline !== '全部') {
      data = data.filter((d: any) => d.discipline === selectedDiscipline);
    }
    if (selectedTier !== '全部') {
      data = data.filter((d: any) => d.school_tier === selectedTier);
    }
    return data.slice(0, 20);
  }, [rankings, selectedDiscipline, selectedTier]);

  const stats = useMemo(() => {
    const d = filteredRankings;
    if (!d.length) return { avg: 0, max: 0, min: 0, median: 0, total: 0 };
    const ratios = d.map(r => r.competition_ratio).sort((a, b) => a - b);
    return {
      avg: +(ratios.reduce((s, r) => s + r, 0) / ratios.length).toFixed(1),
      max: ratios[ratios.length - 1],
      min: ratios[0],
      median: ratios[Math.floor(ratios.length / 2)],
      total: d.length,
    };
  }, [filteredRankings]);

  const barOption = useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 160, right: 30, top: 10, bottom: 20 },
    xAxis: { type: 'value', name: '报录比' },
    yAxis: {
      type: 'category',
      inverse: true,
      data: filteredRankings.slice(0, 15).map(r => `${r.school_name?.slice(0, 6)}`).reverse(),
      axisLabel: { fontSize: 10 },
    },
    series: [{
      type: 'bar',
      data: filteredRankings.slice(0, 15).map(r => r.competition_ratio).reverse(),
      itemStyle: {
        color: (params: any) => {
          const v = params.value;
          if (v > 15) return '#ef4444';
          if (v > 8) return '#f97316';
          return '#22c55e';
        },
        borderRadius: [0, 4, 4, 0],
      },
      label: { show: true, position: 'right', formatter: '{c}:1', fontSize: 10 },
    }],
  }), [filteredRankings]);

  const trendOption = useMemo(() => ({
    tooltip: { trigger: 'axis' },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: trendData.map((d: any) => d.year) },
    yAxis: [
      { type: 'value', name: '报录比' },
      { type: 'value', name: '人数' },
    ],
    series: [
      {
        name: '报录比', type: 'line', smooth: true,
        data: trendData.map((d: any) => d.competition_ratio),
        itemStyle: { color: '#3b82f6' },
        areaStyle: { color: 'rgba(59,130,246,0.1)' },
      },
      {
        name: '报考人数', type: 'bar', yAxisIndex: 1,
        data: trendData.map((d: any) => d.total_applicants),
        itemStyle: { color: 'rgba(249,115,22,0.3)' },
      },
      {
        name: '录取人数', type: 'bar', yAxisIndex: 1,
        data: trendData.map((d: any) => d.admit_actual),
        itemStyle: { color: 'rgba(34,197,94,0.5)' },
      },
    ],
  }), [trendData]);

  const disciplineMajorMap = useMemo(() => {
    const map: Record<string, Major[]> = {};
    for (const m of allMajors) {
      if (!map[m.discipline]) map[m.discipline] = [];
      map[m.discipline].push(m);
    }
    return map;
  }, [allMajors]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-8 text-white">
        <h1 className="text-2xl font-bold">📈 报录比与竞争分析</h1>
        <p className="mt-2 text-orange-100 text-sm">全面了解各院校专业的竞争激烈程度，辅助择校决策</p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); }} className="text-red-500 hover:text-red-700 font-medium">关闭</button>
        </div>
      )}

      {/* Stats */}
      {filteredRankings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: '平均报录比', value: `${stats.avg}:1` },
            { label: '最高报录比', value: `${stats.max}:1` },
            { label: '最低报录比', value: `${stats.min}:1` },
            { label: '中位数', value: `${stats.median}:1` },
            { label: '统计数量', value: `${stats.total}条` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-xs text-gray-400">{s.label}</div>
              <div className="text-xl font-bold text-gray-800 mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">学科门类</label>
            <select value={selectedDiscipline} onChange={e => { setSelectedDiscipline(e.target.value); setSelectedMajorId(null); }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {DISCIPLINES.map(d => (<option key={d} value={d}>{d}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">具体专业</label>
            <select value={selectedMajorId || ''} onChange={e => setSelectedMajorId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">全部专业</option>
              {(selectedDiscipline === '全部' ? allMajors : (disciplineMajorMap[selectedDiscipline] || []))
                .slice(0, 200)
                .map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">院校层次</label>
            <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {TIERS.map(t => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">年份</label>
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              {YEARS.map(y => (<option key={y} value={y}>{y}年</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      {filteredRankings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-3">🔝 竞争激烈排行 Top 15</h3>
            <ReactECharts option={barOption} style={{ height: 400 }} />
          </div>

          {/* Trend chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-3">
              📉 历年趋势
              {trendSchoolId ? '' : <span className="text-xs text-gray-400 font-normal ml-2">点击下方表格行查看</span>}
            </h3>
            {trendData.length > 0 ? (
              <ReactECharts option={trendOption} style={{ height: 400 }} />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400 text-sm">点击表格中的院校查看历年趋势</div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">竞争排行</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-12">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">院校</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">专业</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">年份</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">报考人数</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">录取人数</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">报录比</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">录取均分</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">加载中...</td></tr>
              ) : filteredRankings.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">暂无数据</td></tr>
              ) : (
                filteredRankings.map((d, i) => (
                  <tr key={d.id || i}
                    onClick={() => { setTrendSchoolId(d.school_id); if (d.major_id && !selectedMajorId) setSelectedMajorId(d.major_id); }}
                    className={`border-t border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${trendSchoolId === d.school_id ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">{d.school_name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ml-2 ${
                        d.school_tier === '985' ? 'bg-red-50 text-red-600' :
                        d.school_tier === '211' ? 'bg-orange-50 text-orange-600' :
                        d.school_tier === '双一流' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>{d.school_tier}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{d.major_name}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{d.year}</td>
                    <td className="px-4 py-3 text-center font-medium">{d.total_applicants}</td>
                    <td className="px-4 py-3 text-center font-medium text-blue-600">{d.admit_actual}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                        d.competition_ratio > 15 ? 'bg-red-100 text-red-700' :
                        d.competition_ratio > 8 ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>{d.competition_ratio}:1</span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-700">{d.avg_admit_score || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
