'use client';

import { useState, useEffect } from 'react';
import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { BarChart3, PieChartIcon } from 'lucide-react';

interface DataPoint {
  date: string;
  dailyRuns: number;
  cumulativeRuns: number;
}

interface ChartStats {
  totalRuns: number;
  last7DaysRuns: number;
  last30DaysRuns: number;
  averageDailyRuns: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const timeRanges = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: 'ALL', value: 'all' }
];

// Category colors matching the donut chart in the image
const CATEGORY_COLORS: Record<string, string> = {
  'Tools': '#00CED1',
  'Development': '#4169E1',
  'Data & AI': '#BA55D3',
  'Business': '#FFD700',
  'DevOps': '#9370DB',
  'Testing Security': '#90EE90',
  'Content Media': '#FF69B4',
  'Documentation': '#708090',
  'Research': '#7B68EE',
  'Databases': '#32CD32',
  'Lifestyle': '#FF1493',
  'Blockchain': '#FF8C00'
};

// Mock distribution data
const mockDistributionData: CategoryData[] = [
  { name: 'Tools', value: 42150, percentage: 21.5, color: CATEGORY_COLORS['Tools'] },
  { name: 'Development', value: 36559, percentage: 18.7, color: CATEGORY_COLORS['Development'] },
  { name: 'Data & AI', value: 24400, percentage: 12.5, color: CATEGORY_COLORS['Data & AI'] },
  { name: 'Business', value: 23599, percentage: 12.1, color: CATEGORY_COLORS['Business'] },
  { name: 'DevOps', value: 19852, percentage: 10.1, color: CATEGORY_COLORS['DevOps'] },
  { name: 'Testing Security', value: 15130, percentage: 7.7, color: CATEGORY_COLORS['Testing Security'] },
  { name: 'Content Media', value: 11318, percentage: 5.8, color: CATEGORY_COLORS['Content Media'] },
  { name: 'Documentation', value: 10618, percentage: 5.4, color: CATEGORY_COLORS['Documentation'] },
  { name: 'Research', value: 5533, percentage: 2.8, color: CATEGORY_COLORS['Research'] },
  { name: 'Databases', value: 2643, percentage: 1.4, color: CATEGORY_COLORS['Databases'] },
  { name: 'Lifestyle', value: 2136, percentage: 1.1, color: CATEGORY_COLORS['Lifestyle'] },
  { name: 'Blockchain', value: 1731, percentage: 0.9, color: CATEGORY_COLORS['Blockchain'] }
];

export default function SkillAnalyticsChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [stats, setStats] = useState<ChartStats | null>(null);
  const [selectedRange, setSelectedRange] = useState('90d');
  const [loading, setLoading] = useState(true);
  const [showCumulative, setShowCumulative] = useState(true);
  const [viewMode, setViewMode] = useState<'timeline' | 'distribution'>('timeline');
  const [distributionData] = useState<CategoryData[]>(mockDistributionData);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/skill-runs?range=${selectedRange}`);
      const result = await response.json();

      // Format data for chart
      const formattedData = result.points.map((point: DataPoint) => ({
        ...point,
        displayDate: formatDate(point.date),
      }));

      setData(formattedData);
      setStats(result.stats);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Parse date for better display
      const dateObj = new Date(payload[0]?.payload?.date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-3">{formattedDate}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: '#b08968' }}></div>
              <span className="text-xs text-gray-600 font-medium">Daily Runs:</span>
              <span className="text-sm font-bold text-gray-900">{formatNumber(payload[0].value)}</span>
            </div>
            {showCumulative && payload[1] && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span className="text-xs text-gray-600 font-medium">Total:</span>
                <span className="text-sm font-bold text-gray-900">{formatNumber(payload[1].value)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-lg shadow-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{data.name}</p>
          <p className="text-xs text-gray-600 mt-1">
            Tasks: <span className="font-bold text-gray-900">{formatNumber(data.value)}</span>
          </p>
          <p className="text-xs text-gray-600">
            Share: <span className="font-bold text-gray-900">{data.payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Compact Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900"># Tasks automated by Skills</h2>
          <p className="text-sm text-gray-600 mt-0.5">Turn routine work into skills and let them run for you</p>
        </div>

        {/* Live Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">
              <span className="font-medium text-gray-900">892,341</span> conversations today
            </span>
          </div>
          <div className="text-gray-600">
            <span className="font-medium text-gray-900">42</span> new skills this week
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between mb-3">
        {/* View Toggle */}
        <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg">
          <button
            onClick={() => setViewMode('timeline')}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1",
              viewMode === 'timeline'
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <BarChart3 className="h-3 w-3" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode('distribution')}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 flex items-center gap-1",
              viewMode === 'distribution'
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <PieChartIcon className="h-3 w-3" />
            Distribution
          </button>
        </div>

        {/* Controls - Only show for timeline view */}
        {viewMode === 'timeline' && (
          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex gap-0.5 p-0.5 bg-white rounded-lg border border-gray-200">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200",
                    selectedRange === range.value
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Cumulative Toggle */}
            <button
              onClick={() => setShowCumulative(!showCumulative)}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200",
                "border",
                showCumulative
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              {showCumulative ? '✓ ' : ''}Cumulative
            </button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-[360px] w-full py-3">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-2 h-8 bg-gray-300 rounded"></div>
              <div className="w-2 h-12 bg-gray-300 rounded"></div>
              <div className="w-2 h-16 bg-gray-300 rounded"></div>
              <div className="w-2 h-20 bg-gray-300 rounded"></div>
              <div className="w-2 h-14 bg-gray-300 rounded"></div>
              <div className="w-2 h-18 bg-gray-300 rounded"></div>
              <div className="w-2 h-22 bg-gray-300 rounded"></div>
              <div className="w-2 h-16 bg-gray-300 rounded"></div>
            </div>
            <p className="text-sm text-gray-500 font-medium">Analyzing skill execution patterns...</p>
          </div>
        ) : viewMode === 'timeline' ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
                <defs>
                  <linearGradient id="colorDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b08968" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#b08968" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="6 6"
                  vertical={false}
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />

                <XAxis
                  dataKey="displayDate"
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />

                <YAxis
                  yAxisId="left"
                  tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                  tickLine={false}
                  tickFormatter={formatNumber}
                />

                {showCumulative && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#10b981', fontSize: 12, fontWeight: 500 }}
                    axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                    tickLine={false}
                    tickFormatter={formatNumber}
                  />
                )}

                <Tooltip content={<CustomTooltip />} />

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="dailyRuns"
                  stroke="#b08968"
                  strokeWidth={2}
                  fill="url(#colorDaily)"
                  name="Daily Skills Run"
                  animationDuration={1500}
                />

                {showCumulative && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativeRuns"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    name="Cumulative Total"
                    strokeDasharray="0"
                    animationDuration={1500}
                  />
                )}

              <Legend
                wrapperStyle={{
                  paddingTop: '2px',
                  fontSize: '11px',
                }}
                iconType="rect"
                iconSize={10}
                formatter={(value) => (
                  <span className="text-gray-600 text-xs">{value}</span>
                )}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          // Distribution View
          <div className="h-full flex">
            {/* Donut Chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    innerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="w-[260px] flex flex-col justify-center pl-4">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">Domain Distribution</h3>
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-2">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between group hover:bg-gray-50 px-1 py-0.5 rounded">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[11px] text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-900 font-semibold">{formatNumber(item.value)}</span>
                      <span className="text-[10px] text-gray-500">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
