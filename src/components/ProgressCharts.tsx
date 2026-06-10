import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BookOpen, Headphones, Trophy, Flame, TrendingUp, Target, Calendar, BarChart2 } from 'lucide-react';
import progressService, { DailyProgress, ProgressStats } from '../services/progressService';

interface TooltipPayload {
  color?: string;
  name?: string;
  value?: number;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

type HeatCell = { date: string; total: number };

function HeatmapCalendar({ data }: { data: DailyProgress[] }) {
  const weeks: (HeatCell | null)[][] = [];
  const map = new Map(data.map(d => [d.date, d]));

  // Build a 7-row grid (Mon..Sun) covering the last 12 weeks
  const today = new Date();
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setUTCDate(startDate.getUTCDate() - 83); // ~12 weeks back

  // align to Monday
  const dayOfWeek = startDate.getUTCDay(); // 0=Sun
  startDate.setUTCDate(startDate.getUTCDate() - ((dayOfWeek + 6) % 7));

  const cells: { date: string; total: number }[] = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    const dateStr = cur.toISOString().slice(0, 10);
    const d = map.get(dateStr);
    const total = d ? d.lawsRead + d.audioListened + d.quizzesTaken + d.casesViewed : 0;
    cells.push({ date: dateStr, total });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  for (let w = 0; w < Math.ceil(cells.length / 7); w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  const getColor = (total: number) => {
    if (total === 0) return 'bg-slate-100';
    if (total <= 2) return 'bg-gold-200';
    if (total <= 5) return 'bg-gold-400';
    if (total <= 10) return 'bg-gold-500';
    return 'bg-gold-600';
  };

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div>
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((d, i) => (
            <div key={i} className="w-3 h-3 flex items-center justify-center text-[9px] text-slate-400 font-medium">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell, di) =>
              cell ? (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-[2px] ${getColor(cell.total)} cursor-default`}
                  title={`${cell.date}: ${cell.total} activities`}
                />
              ) : (
                <div key={di} className="w-3 h-3" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-slate-400">Less</span>
        {['bg-slate-100', 'bg-gold-200', 'bg-gold-400', 'bg-gold-500', 'bg-gold-600'].map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-[2px] ${c}`} />
        ))}
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
}

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'];

export default function ProgressCharts() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressService.getStats(84).then(s => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!stats) return null;

  const { daily, streak } = stats;

  // Last 30 days for charts
  const last30 = daily.slice(-30);

  // Combine lawsRead + casesViewed into a single "Laws & Cases" metric everywhere
  const lawsAndCases = (d: DailyProgress) => d.lawsRead + d.casesViewed;

  // Last 7 days for bar chart
  const last7 = daily.slice(-7).map(d => ({
    day: new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short' }),
    'Laws & Cases': lawsAndCases(d),
    'Audio': d.audioListened,
    'Quizzes': d.quizzesTaken,
  }));

  const last30LineData = last30.map(d => ({
    date: new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    'Laws & Cases': lawsAndCases(d),
    'Audio': d.audioListened,
  }));

  const totals = daily.reduce(
    (acc, d) => ({
      laws: acc.laws + lawsAndCases(d),
      audio: acc.audio + d.audioListened,
      quizzes: acc.quizzes + d.quizzesTaken,
    }),
    { laws: 0, audio: 0, quizzes: 0 }
  );

  const todayData = daily[daily.length - 1];
  const todayTotal = todayData
    ? lawsAndCases(todayData) + todayData.audioListened + todayData.quizzesTaken
    : 0;

  const pieData = [
    { name: 'Laws & Cases', value: totals.laws },
    { name: 'Audio', value: totals.audio },
    { name: 'Quiz Questions', value: totals.quizzes },
  ].filter(d => d.value > 0);

  const avgLaws = last30.length > 0
    ? (last30.reduce((a, d) => a + lawsAndCases(d), 0) / last30.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-gold-600" />
        <h2 className="text-base font-bold text-slate-800">Learning Analytics</h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${streak} day${streak !== 1 ? 's' : ''}`}
          sub="consecutive study days"
          color="bg-orange-500"
        />
        <StatCard
          icon={BookOpen}
          label="Laws & Cases (total)"
          value={totals.laws}
          sub={`avg ${avgLaws}/day last 30d`}
          color="bg-blue-500"
        />
        <StatCard
          icon={Headphones}
          label="Audio Sections"
          value={totals.audio}
          sub="total listened"
          color="bg-gold-500"
        />
        <StatCard
          icon={Target}
          label="Today's Activity"
          value={todayTotal}
          sub="total activities today"
          color="bg-emerald-500"
        />
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">This Week's Activity</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={last7} barGap={4} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Bar dataKey="Laws & Cases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Audio" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Quizzes" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 30-day trend line */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">30-Day Learning Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={last30LineData}>
            <defs>
              <linearGradient id="lawsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="audioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval={6}
            />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            <Area type="monotone" dataKey="Laws & Cases" stroke="#3b82f6" strokeWidth={2} fill="url(#lawsGrad)" dot={false} />
            <Area type="monotone" dataKey="Audio" stroke="#f59e0b" strokeWidth={2} fill="url(#audioGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Activity heatmap + pie side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Activity Heatmap</h3>
          </div>
          <div className="overflow-x-auto">
            <HeatmapCalendar data={daily} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Activity Breakdown</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <Trophy className="w-8 h-8 opacity-30" />
              <p className="text-sm">Start learning to see your breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily goal line — quizzes */}
      {totals.quizzes > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Quiz Questions Answered — Last 30 Days</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={last30.map(d => ({
              date: new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
              Quizzes: d.quizzesTaken,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="Quizzes" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
