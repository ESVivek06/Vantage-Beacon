/**
 * Staging validation seed — VAN-56
 *
 * Seeds the 3-founder + 5-freelancer synthetic dataset used in the
 * syntheticMatchValidation.test.ts suite. Run this on a fresh staging DB
 * before executing the /matchCandidates GraphQL smoke tests.
 *
 * Usage: npx ts-node packages/database/prisma/seed.staging-validation.ts
 *   or:  DATABASE_URL=<staging-url> npx tsx packages/database/prisma/seed.staging-validation.ts
 */

import { PrismaClient, UserRole, Region } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const STAGING_PASSWORD = 'StagingTest123!';

async function main() {
  console.log('Seeding staging validation dataset (VAN-56)...');

  const passwordHash = await bcrypt.hash(STAGING_PASSWORD, 10);

  // ── 3 Founder profiles ───────────────────────────────────────────────────────

  const founderFintech = await prisma.user.upsert({
    where: { email: 'amara.osei@staging-van56.test' },
    update: {},
    create: {
      email: 'amara.osei@staging-van56.test',
      passwordHash,
      role: UserRole.founder,
      region: Region.UK,
      profileData: {
        companyName: 'PanPay',
        stage: 'series_a',
        industry: 'fintech',
        teamSize: 8,
        fundingRaised: 1200000,
      },
      profile: {
        create: {
          displayName: 'Amara Osei',
          bio: 'Fintech founder building cross-border payments for Africa. Seeking Series A.',
          skills: ['Payments', 'Fundraising', 'Go-to-market'],
          tags: ['fintech', 'africa', 'b2b'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const founderEdtech = await prisma.user.upsert({
    where: { email: 'priya.nair@staging-van56.test' },
    update: {},
    create: {
      email: 'priya.nair@staging-van56.test',
      passwordHash,
      role: UserRole.founder,
      region: Region.IN,
      profileData: {
        companyName: 'TutorAI',
        stage: 'seed',
        industry: 'edtech',
        teamSize: 4,
        fundingRaised: 300000,
      },
      profile: {
        create: {
          displayName: 'Priya Nair',
          bio: 'EdTech founder building AI-powered tutoring for K-12. Former teacher.',
          skills: ['Product', 'EdTech', 'Curriculum'],
          tags: ['edtech', 'ai', 'k12'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const founderClimate = await prisma.user.upsert({
    where: { email: 'lars.eriksson@staging-van56.test' },
    update: {},
    create: {
      email: 'lars.eriksson@staging-van56.test',
      passwordHash,
      role: UserRole.founder,
      region: Region.UK,
      profileData: {
        companyName: 'CarbonTrack',
        stage: 'pre_seed',
        industry: 'climate',
        teamSize: 3,
        fundingRaised: 0,
      },
      profile: {
        create: {
          displayName: 'Lars Eriksson',
          bio: 'Climate tech founder building carbon tracking SaaS for SMEs. Pre-seed.',
          skills: ['Sustainability', 'SaaS', 'B2B Sales'],
          tags: ['climate', 'saas', 'sustainability'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  // ── 5 Freelancer profiles ────────────────────────────────────────────────────

  const flFrontend = await prisma.user.upsert({
    where: { email: 'sophie.wu@staging-van56.test' },
    update: {},
    create: {
      email: 'sophie.wu@staging-van56.test',
      passwordHash,
      role: UserRole.freelancer,
      region: Region.UK,
      profileData: {
        skills: ['React', 'TypeScript', 'GraphQL', 'Next.js'],
        hourlyRate: 110,
        currency: 'GBP',
        availability: 'full-time',
        yearsExperience: 8,
      },
      profile: {
        create: {
          displayName: 'Sophie Wu',
          bio: 'Senior React/TypeScript engineer. 8 years building fintech products.',
          skills: ['React', 'TypeScript', 'GraphQL', 'Next.js'],
          tags: ['fintech', 'frontend', 'saas'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const flBackend = await prisma.user.upsert({
    where: { email: 'kofi.mensah@staging-van56.test' },
    update: {},
    create: {
      email: 'kofi.mensah@staging-van56.test',
      passwordHash,
      role: UserRole.freelancer,
      region: Region.UK,
      profileData: {
        skills: ['Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
        hourlyRate: 95,
        currency: 'GBP',
        availability: 'full-time',
        yearsExperience: 6,
      },
      profile: {
        create: {
          displayName: 'Kofi Mensah',
          bio: 'Backend engineer specialising in payments APIs and Node.js microservices.',
          skills: ['Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
          tags: ['payments', 'backend', 'api'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const flFullstack = await prisma.user.upsert({
    where: { email: 'nina.patel@staging-van56.test' },
    update: {},
    create: {
      email: 'nina.patel@staging-van56.test',
      passwordHash,
      role: UserRole.freelancer,
      region: Region.IN,
      profileData: {
        skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
        hourlyRate: 65,
        currency: 'USD',
        availability: 'full-time',
        yearsExperience: 5,
      },
      profile: {
        create: {
          displayName: 'Nina Patel',
          bio: 'Full-stack developer. Built 3 SaaS MVPs from 0 to 1 for early-stage startups.',
          skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
          tags: ['saas', 'mvp', 'startup'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const flMl = await prisma.user.upsert({
    where: { email: 'daniel.kim@staging-van56.test' },
    update: {},
    create: {
      email: 'daniel.kim@staging-van56.test',
      passwordHash,
      role: UserRole.freelancer,
      region: Region.NA,
      profileData: {
        skills: ['Python', 'PyTorch', 'NLP', 'LLMs'],
        hourlyRate: 130,
        currency: 'USD',
        availability: 'part-time',
        yearsExperience: 7,
      },
      profile: {
        create: {
          displayName: 'Daniel Kim',
          bio: 'ML engineer with NLP and LLM fine-tuning experience. Python and PyTorch.',
          skills: ['Python', 'PyTorch', 'NLP', 'LLMs'],
          tags: ['ai', 'ml', 'nlp'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const flMobile = await prisma.user.upsert({
    where: { email: 'fatima.alhassan@staging-van56.test' },
    update: {},
    create: {
      email: 'fatima.alhassan@staging-van56.test',
      passwordHash,
      role: UserRole.freelancer,
      region: Region.UK,
      profileData: {
        skills: ['React Native', 'TypeScript', 'iOS', 'Android'],
        hourlyRate: 100,
        currency: 'GBP',
        availability: 'full-time',
        yearsExperience: 5,
      },
      profile: {
        create: {
          displayName: 'Fatima Al-Hassan',
          bio: 'React Native engineer. Mobile-first fintech apps with biometric auth.',
          skills: ['React Native', 'TypeScript', 'iOS', 'Android'],
          tags: ['mobile', 'fintech', 'react-native'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  // ── 2 Investor profiles ───────────────────────────────────────────────────────

  const invSaas = await prisma.user.upsert({
    where: { email: 'callum.ross@staging-van56.test' },
    update: {},
    create: {
      email: 'callum.ross@staging-van56.test',
      passwordHash,
      role: UserRole.investor,
      region: Region.UK,
      profileData: {
        investmentStage: ['pre_seed', 'seed'],
        sectors: ['SaaS', 'Fintech', 'Climate'],
        ticketSize: { min: 25000, max: 150000, currency: 'GBP' },
        portfolio: 15,
      },
      profile: {
        create: {
          displayName: 'Callum Ross',
          bio: 'Angel investor. 15 investments in early-stage B2B SaaS. Fintech and climate focus.',
          skills: ['SaaS', 'Fintech', 'B2B', 'Climate'],
          tags: ['angel', 'early-stage', 'saas'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const invDeeptech = await prisma.user.upsert({
    where: { email: 'elena.vasquez@staging-van56.test' },
    update: {},
    create: {
      email: 'elena.vasquez@staging-van56.test',
      passwordHash,
      role: UserRole.investor,
      region: Region.UK,
      profileData: {
        investmentStage: ['seed', 'series_a'],
        sectors: ['AI', 'ML', 'DeepTech', 'Climate'],
        ticketSize: { min: 250000, max: 2000000, currency: 'GBP' },
        portfolio: 8,
      },
      profile: {
        create: {
          displayName: 'Elena Vasquez',
          bio: 'VC partner at DeepTech Fund. Invests in AI/ML infrastructure and climate tech.',
          skills: ['AI', 'ML', 'DeepTech', 'Climate'],
          tags: ['vc', 'deeptech', 'ai'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const users = [founderFintech, founderEdtech, founderClimate, flFrontend, flBackend, flFullstack, flMl, flMobile, invSaas, invDeeptech];
  console.log(`Seeded ${users.length} users:`);
  for (const u of users) {
    console.log(`  [${u.role}] ${u.profile?.displayName} (${u.email}) — region: ${u.region}`);
  }

  console.log('\nVAN-55/VAN-56 staging validation seed complete.');
  console.log('Next step: run scripts/smoke-test-matching.sh against api.staging.vb.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
