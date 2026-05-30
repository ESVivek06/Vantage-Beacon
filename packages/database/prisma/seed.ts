import { PrismaClient, UserRole, Region, ConnectionKind, ProjectStatus, InvestmentStage, InvestmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ── Users ──────────────────────────────────────────────────────────────────

  const freelancer = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      passwordHash,
      role: UserRole.freelancer,
      region: Region.UK,
      profileData: {
        skills: ['React', 'TypeScript', 'Node.js'],
        hourlyRate: 85,
        currency: 'GBP',
        availability: 'full-time',
        yearsExperience: 6,
      },
      profile: {
        create: {
          displayName: 'Alice Chen',
          bio: 'Senior full-stack developer specialising in React and Node.js, based in London.',
          skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL'],
          tags: ['frontend', 'backend', 'open-to-work'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const founder = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      passwordHash,
      role: UserRole.founder,
      region: Region.NA,
      profileData: {
        companyName: 'NovaTech Inc.',
        stage: 'seed',
        industry: 'fintech',
        teamSize: 4,
        fundingRaised: 250000,
      },
      profile: {
        create: {
          displayName: 'Bob Williams',
          bio: 'Founder of NovaTech, building next-gen payments infrastructure for emerging markets.',
          skills: ['Product Strategy', 'Fundraising', 'B2B Sales'],
          tags: ['fintech', 'seed-stage', 'hiring'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const investor = await prisma.user.upsert({
    where: { email: 'priya@example.com' },
    update: {},
    create: {
      email: 'priya@example.com',
      passwordHash,
      role: UserRole.investor,
      region: Region.IN,
      profileData: {
        firmName: 'Horizon Ventures',
        aum: 50000000,
        focusSectors: ['fintech', 'saas', 'ai'],
        preferredStages: ['seed', 'pre_series_a'],
        ticketSize: { min: 100000, max: 1000000, currency: 'USD' },
      },
      profile: {
        create: {
          displayName: 'Priya Sharma',
          bio: 'Partner at Horizon Ventures, focused on early-stage fintech and AI/ML companies across APAC.',
          skills: ['Due Diligence', 'Portfolio Management', 'VC Strategy'],
          tags: ['investor', 'fintech', 'ai', 'seed'],
          verified: true,
        },
      },
    },
    include: { profile: true },
  });

  const supplier = await prisma.user.upsert({
    where: { email: 'david@example.com' },
    update: {},
    create: {
      email: 'david@example.com',
      passwordHash,
      role: UserRole.supplier,
      region: Region.UK,
      profileData: {
        companyName: 'CloudOps Ltd',
        category: 'infrastructure',
        services: ['AWS managed services', 'DevOps consulting', 'SRE on-demand'],
        certifications: ['AWS Solutions Architect', 'Kubernetes CKA'],
      },
      profile: {
        create: {
          displayName: 'David Park',
          bio: 'DevOps lead at CloudOps — we help startups scale AWS infrastructure without the overhead.',
          skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
          tags: ['supplier', 'devops', 'infrastructure'],
          verified: false,
        },
      },
    },
    include: { profile: true },
  });

  const stakeholder = await prisma.user.upsert({
    where: { email: 'maya@example.com' },
    update: {},
    create: {
      email: 'maya@example.com',
      passwordHash,
      role: UserRole.stakeholder,
      region: Region.UK,
      profileData: {
        organisation: 'UK Tech Alliance',
        role: 'Policy Advisor',
        interests: ['regulation', 'digital-economy', 'startup-policy'],
      },
      profile: {
        create: {
          displayName: 'Maya Johnson',
          bio: 'Policy advisor at UK Tech Alliance — bridging startups and regulators.',
          skills: ['Policy', 'Stakeholder Engagement', 'Research'],
          tags: ['policy', 'regtech', 'stakeholder'],
          verified: false,
        },
      },
    },
    include: { profile: true },
  });

  console.log(`Created users: ${[freelancer, founder, investor, supplier, stakeholder].map(u => u.email).join(', ')}`);

  // ── Projects ───────────────────────────────────────────────────────────────

  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      ownerId: founder.id,
      title: 'NovaTech Payments SDK',
      description: 'Open-source SDK for integrating NovaTech real-time payment rails into mobile apps. Looking for a React Native / TypeScript engineer.',
      status: ProjectStatus.open,
      requiredSkills: ['React Native', 'TypeScript', 'REST APIs', 'Payments'],
      budget: { min: 5000, max: 15000, currency: 'USD' },
      region: Region.NA,
    },
  });

  console.log(`Created project: ${project.title}`);

  // ── Connections ────────────────────────────────────────────────────────────

  const connection = await prisma.connection.upsert({
    where: { requesterId_receiverId: { requesterId: freelancer.id, receiverId: founder.id } },
    update: {},
    create: {
      requesterId: freelancer.id,
      receiverId: founder.id,
      status: 'accepted',
      kind: ConnectionKind.collaboration,
    },
  });

  console.log(`Created connection: ${connection.id}`);

  // ── Investment ─────────────────────────────────────────────────────────────

  const investment = await prisma.investment.create({
    data: {
      investorId: investor.id,
      founderId: founder.id,
      projectId: project.id,
      stage: InvestmentStage.seed,
      amount: 250000,
      currency: 'USD',
      status: InvestmentStatus.interested,
    },
  });

  console.log(`Created investment: ${investment.id}`);

  // ── Match ──────────────────────────────────────────────────────────────────

  await prisma.match.create({
    data: {
      sourceId: freelancer.id,
      targetId: project.id,
      score: 0.92,
      explainability: {
        kind: 'user_project',
        topReasons: [
          'Skills overlap: TypeScript, Node.js',
          'Region proximity: UK / NA (English-speaking)',
          'Budget within rate expectations',
        ],
        signals: {
          skillOverlap: 0.85,
          regionMatch: 0.7,
          budgetFit: 1.0,
          activityScore: 0.9,
        },
      },
    },
  });

  // ── Messages ───────────────────────────────────────────────────────────────

  await prisma.message.create({
    data: {
      senderId: founder.id,
      receiverId: freelancer.id,
      content: "Hi Alice! Saw your profile and think you'd be a great fit for our Payments SDK project. Would love to chat.",
      read: true,
    },
  });

  await prisma.message.create({
    data: {
      senderId: freelancer.id,
      receiverId: founder.id,
      content: "Thanks Bob! The project looks really interesting. I have availability starting next month — happy to jump on a call.",
      read: false,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
