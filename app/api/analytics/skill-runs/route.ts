import { NextRequest, NextResponse } from 'next/server';

interface SkillRunDataPoint {
  date: string;
  dailyRuns: number;
  cumulativeRuns: number;
}

// Generate mock skill run data with realistic growth pattern
function generateSkillRunData(days: number): SkillRunDataPoint[] {
  const data: SkillRunDataPoint[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  let cumulative = days === 365 ? 15000 : days === 90 ? 85000 : 105000; // Start with base cumulative

  for (let i = 0; i <= days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    // Calculate daily runs with growth pattern
    let dailyRuns: number;
    const dayIndex = i / days; // 0 to 1 progress

    if (dayIndex < 0.3) {
      // Slow growth phase
      dailyRuns = Math.floor(Math.random() * 50) + 20;
    } else if (dayIndex < 0.6) {
      // Medium growth phase
      dailyRuns = Math.floor(Math.random() * 150) + 80;
    } else if (dayIndex < 0.85) {
      // Rapid growth phase
      dailyRuns = Math.floor(Math.random() * 500) + 300;
    } else {
      // Explosive growth (recent)
      dailyRuns = Math.floor(Math.random() * 1500) + 1000;
    }

    // Add some weekly pattern (weekends slightly lower)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      dailyRuns = Math.floor(dailyRuns * 0.7);
    }

    cumulative += dailyRuns;

    data.push({
      date: currentDate.toISOString().split('T')[0],
      dailyRuns,
      cumulativeRuns: cumulative
    });
  }

  return data;
}

// Calculate summary statistics
function calculateStats(data: SkillRunDataPoint[]) {
  const last7Days = data.slice(-7);
  const last30Days = data.slice(-30);

  return {
    totalRuns: data[data.length - 1]?.cumulativeRuns || 0,
    last7DaysRuns: last7Days.reduce((sum, d) => sum + d.dailyRuns, 0),
    last30DaysRuns: last30Days.reduce((sum, d) => sum + d.dailyRuns, 0),
    averageDailyRuns: Math.floor(last30Days.reduce((sum, d) => sum + d.dailyRuns, 0) / 30),
    peakDailyRuns: Math.max(...data.map(d => d.dailyRuns)),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const range = searchParams.get('range') || '90d';

  // Parse range parameter
  let days = 90;
  switch (range) {
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '90d':
      days = 90;
      break;
    case '120d':
      days = 120;
      break;
    case 'all':
      days = 365;
      break;
    default:
      days = 90;
  }

  // Generate mock data
  const data = generateSkillRunData(days);
  const stats = calculateStats(data);

  return NextResponse.json({
    success: true,
    range,
    points: data,
    stats,
    metadata: {
      generatedAt: new Date().toISOString(),
      dataPointsCount: data.length,
      rangeInDays: days,
    }
  });
}