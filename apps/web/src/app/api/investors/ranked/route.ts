export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getClient } from '@vb/database';

export interface RankedInvestor {
  investorId: string;
  displayName: string | null;
  region: string | null;
  stage: string | null;
  investmentCount: number;
  rankScore: number;
  isCallout: boolean;
  latestActivity: string;
  fundSectors: string[];
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== 'founder') {
    return NextResponse.json({ error: 'Only founders can view investor rankings' }, { status: 403 });
  }

  const db = getClient();

  try {
    // Fetch the founder's project(s) for context (stage, domain)
    const founderProjects = await db.project.findMany({
      where: { ownerId: session.user.id, deletedAt: null, status: { not: 'draft' } },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const founderProject = founderProjects[0] as {
      requiredSkills?: string[];
      budget?: { domain?: string } | null;
    } | undefined;
    const founderSkills: string[] = founderProject?.requiredSkills ?? [];
    const founderDomain: string | null = (founderProject?.budget as { domain?: string } | null)?.domain ?? null;

    // Fetch all investors with their investment history
    const investors = await db.user.findMany({
      where: { role: 'investor', deletedAt: null },
      include: {
        profile: true,
        madeInvestments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { project: true },
        },
      },
      take: 50,
    });

    if (investors.length === 0) {
      // Recency fallback: return empty with flag
      return NextResponse.json({ investors: [], count: 0, recencyFallback: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ranked: RankedInvestor[] = (investors as any[]).map((investor) => {
      const investments = investor.madeInvestments ?? [];
      const latestInvestment = investments[0];
      const stage = latestInvestment?.stage ?? null;

      // Portfolio overlap: count how many of investor's past projects overlap with founder's skills
      const portfolioSkills = investments.flatMap(
        (inv) => (inv.project?.requiredSkills ?? []) as string[],
      );
      const overlap = founderSkills.filter((s) => portfolioSkills.includes(s)).length;

      // Domain/sector match
      const portfolioDomains = investments
        .map((inv) => (inv.project?.budget as { domain?: string } | null)?.domain)
        .filter(Boolean) as string[];
      const sectorMatch = founderDomain ? portfolioDomains.includes(founderDomain) : false;

      // Rank score: portfolio overlap (weighted) + sector match + recency
      const recencyBonus = latestInvestment
        ? Math.max(0, 1 - (Date.now() - latestInvestment.createdAt.getTime()) / (90 * 24 * 60 * 60 * 1000))
        : 0;
      const rankScore = overlap * 0.5 + (sectorMatch ? 0.3 : 0) + recencyBonus * 0.2;

      return {
        investorId: investor.id,
        displayName: investor.profile?.displayName ?? null,
        region: investor.region ?? null,
        stage,
        investmentCount: investments.length,
        rankScore,
        isCallout: false,
        latestActivity: latestInvestment?.createdAt.toISOString() ?? new Date(0).toISOString(),
        fundSectors: portfolioDomains.slice(0, 5),
      };
    });

    // Sort by rankScore desc, then recency fallback for ties
    ranked.sort((a, b) => b.rankScore - a.rankScore || (b.latestActivity > a.latestActivity ? 1 : -1));

    // Mark top 3 as callout candidates (suppress if fewer than 2 have meaningful scores)
    const qualifiedCallouts = ranked.filter((r) => r.rankScore > 0);
    if (qualifiedCallouts.length >= 2) {
      ranked.slice(0, 3).forEach((r) => {
        r.isCallout = true;
      });
    }

    return NextResponse.json({
      investors: ranked.slice(0, 20),
      count: ranked.length,
      recencyFallback: ranked.every((r) => r.rankScore === 0),
      calloutSuppressed: qualifiedCallouts.length < 2,
    });
  } catch (err) {
    console.error('[GET /api/investors/ranked]', err);
    return NextResponse.json({ error: 'Failed to fetch investor rankings' }, { status: 500 });
  }
}
