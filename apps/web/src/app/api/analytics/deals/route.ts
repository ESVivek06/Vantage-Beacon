import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

function makeTrend(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - 1 - i) * 86400000)
      .toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
    yourAvg: Math.floor(14 + Math.random() * 8),
    platformAvg: 20,
  }));
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  return NextResponse.json({
    kpis: {
      activeDeals: 7,
      activeDealsTrend: 2,
      avgVelocityDays: 18,
      closeRate: 40,
      closeRateTrend: 5,
      totalDeployed: '£3.2M',
      totalDeployedTrend: 33,
    },
    pipeline: [
      {
        id: 'd1',
        name: 'TechStart',
        stage: 'sourced',
        series: 'Seed',
        sector: 'SaaS',
        region: 'UK',
        matchScore: 8.9,
        daysInPipeline: 3,
        rationale: 'Strong product-market fit in B2B SaaS matching your thesis.',
        activities: [{ date: '22 Jun', text: 'Added to pipeline from match feed' }],
      },
      {
        id: 'd2',
        name: 'GreenAI',
        stage: 'screening',
        series: 'Series A',
        sector: 'CleanTech',
        region: 'UK',
        matchScore: 7.2,
        daysInPipeline: 7,
        rationale: 'CleanTech SaaS with strong ESG credentials.',
        activities: [
          { date: '21 Jun', text: 'Initial screening call scheduled' },
          { date: '18 Jun', text: 'Pitch deck reviewed' },
        ],
      },
      {
        id: 'd3',
        name: 'NovaMed',
        stage: 'due_diligence',
        series: 'Series A',
        sector: 'HealthTech',
        region: 'UK',
        matchScore: 9.1,
        daysInPipeline: 12,
        rationale:
          "Strong alignment with your health-tech thesis — NovaMed's MedTech SaaS model matches 4 of your 5 stated investment criteria.",
        activities: [
          { date: '20 Jun', text: 'Due diligence documents requested' },
          { date: '18 Jun', text: 'Initial call completed' },
          { date: '15 Jun', text: 'Matched via AI' },
        ],
      },
      {
        id: 'd4',
        name: 'DataPipe',
        stage: 'term_sheet',
        series: 'Seed',
        sector: 'FinTech',
        region: 'UK',
        matchScore: 8.4,
        daysInPipeline: 21,
        rationale: 'FinTech data infrastructure play with defensible moat.',
        activities: [
          { date: '22 Jun', text: 'Term sheet sent' },
          { date: '17 Jun', text: 'Partner meeting' },
        ],
      },
      {
        id: 'd5',
        name: 'CloudScale',
        stage: 'closed',
        series: 'Series A',
        sector: 'SaaS',
        region: 'UK',
        matchScore: 8.8,
        daysInPipeline: 30,
        rationale: 'Multi-cloud orchestration platform.',
        activities: [{ date: '10 Jun', text: 'Deal closed — £2.4M invested' }],
      },
      {
        id: 'd6',
        name: 'BioLeap',
        stage: 'closed',
        series: 'Seed',
        sector: 'HealthTech',
        region: 'UK',
        matchScore: 7.9,
        daysInPipeline: 45,
        rationale: 'Early biotech platform with strong IP.',
        activities: [{ date: '01 Jun', text: 'Deal closed — £800K invested' }],
      },
    ],
    thesisAlignment: [
      { label: 'FinTech', value: 42 },
      { label: 'HealthTech', value: 21 },
      { label: 'CleanTech', value: 14 },
      { label: 'SaaS', value: 12 },
      { label: 'Other', value: 11 },
    ],
    velocityTrend: makeTrend(30),
  });
}
