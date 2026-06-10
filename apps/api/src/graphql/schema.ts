export const typeDefs = /* GraphQL */ `
  scalar DateTime
  scalar JSON

  # ─── Enums ───────────────────────────────────────────────────────────────────

  enum UserRole {
    freelancer
    founder
    investor
    supplier
    stakeholder
  }

  enum Region {
    UK
    IN
    NA
  }

  enum ConnectionStatus {
    pending
    accepted
    declined
  }

  enum ConnectionKind {
    collaboration
    investment
    supply
    mentorship
  }

  enum ProjectStatus {
    draft
    open
    in_progress
    completed
  }

  enum InvestmentStage {
    seed
    pre_series_a
    series_a
    growth
  }

  # ─── Core types ──────────────────────────────────────────────────────────────

  type User {
    id: ID!
    email: String!
    role: UserRole!
    region: Region!
    profileData: JSON!
    photoUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
    profile: Profile
    ownedProjects: [Project!]!
    sentConnections: [Connection!]!
    receivedConnections: [Connection!]!
  }

  type Profile {
    id: ID!
    userId: ID!
    displayName: String!
    bio: String
    skills: [String!]!
    tags: [String!]!
    verified: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
  }

  type Project {
    id: ID!
    ownerId: ID!
    title: String!
    description: String
    status: ProjectStatus!
    requiredSkills: [String!]!
    budget: JSON
    region: Region!
    createdAt: DateTime!
    updatedAt: DateTime!
    owner: User!
  }

  type Connection {
    id: ID!
    requesterId: ID!
    receiverId: ID!
    status: ConnectionStatus!
    kind: ConnectionKind!
    createdAt: DateTime!
    updatedAt: DateTime!
    requester: User!
    receiver: User!
  }

  type Message {
    id: ID!
    senderId: ID!
    receiverId: ID!
    content: String!
    read: Boolean!
    sentAt: String!
  }

  # ─── Auth & utility types ────────────────────────────────────────────────────

  type AuthPayload {
    token: String!
    user: User!
  }

  type PresignedUrl {
    url: String!
    key: String!
  }

  # ─── Matching types ──────────────────────────────────────────────────────────

  type MatchExplanation {
    semanticScore: Float!
    skillOverlap: [String!]!
    regionMatch: Boolean!
    topReasons: [String!]!
  }

  type Match {
    id: ID!
    sourceId: ID!
    targetId: ID!
    targetType: String!
    score: Float!
    explanation: MatchExplanation!
    matchedAt: DateTime!
  }

  # Pre-computed quality band — never exposes raw score to UI.
  enum MatchBand {
    strong
    good
    possible
    weak
  }

  # Processing state of the AI match generation pipeline.
  enum MatchStatus {
    ready
    processing
    failed
  }

  # A reason chip shown on the MatchCard. key is for analytics only.
  type MatchReason {
    label: String!
    key: String!
  }

  # A traction signal chip for the Investor MatchCard variant.
  type TractionSignal {
    label: String!
    icon: String!
    # true = success chip, false = warning chip, null = neutral chip
    positive: Boolean
  }

  # A skill chip for Freelancer / Founder MatchCard variants.
  type SkillOverlapItem {
    skill: String!
    # true = success chip (matched), false = neutral chip (required but unmatched)
    matched: Boolean!
  }

  # Enriched match result returned by matchCandidates — includes resolved profile metadata.
  type MatchResult {
    id: ID!
    sourceId: ID!
    targetId: ID!
    targetType: String!
    score: Float!
    explanation: MatchExplanation!
    matchedAt: DateTime!
    displayName: String
    region: String
    role: String
  }

  # Full UI-ready match result with all MatchCard display fields (VAN-140 data contract).
  type MatchDisplayResult {
    id: ID!
    sourceId: ID!
    targetId: ID!
    targetType: String!
    score: Float!
    explanation: MatchExplanation!
    matchedAt: DateTime!
    displayName: String
    region: String
    role: String
    # UI display contract fields
    matchBand: MatchBand!
    matchStatus: MatchStatus!
    matchReasons: [MatchReason!]!
    aiRationale: String
    tractionSignals: [TractionSignal!]
    skillOverlap: [SkillOverlapItem!]
  }

  type MatchMetrics {
    accepted: Int!
    total: Int!
    rate: Float!
    ratePercent: String!
    meetingTarget: Boolean!
  }

  input MatchFilterInput {
    region: Region
    requiredSkills: [String!]
    targetType: String
    targetRole: String
  }

  # ─── Subscription event types ────────────────────────────────────────────────

  type MatchEvent {
    userId: ID!
    matchedUserId: ID!
    score: Float!
  }

  type ConnectionUpdateEvent {
    connectionId: ID!
    status: ConnectionStatus!
    requesterId: ID!
    receiverId: ID!
  }

  # ─── Inputs ──────────────────────────────────────────────────────────────────

  input RegisterInput {
    email: String!
    password: String!
    role: UserRole!
    region: Region!
    displayName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateProfileInput {
    displayName: String
    bio: String
    skills: [String!]
    tags: [String!]
    profileData: JSON
    photoKey: String
  }

  input CreateProjectInput {
    title: String!
    description: String
    requiredSkills: [String!]!
    budget: JSON
    region: Region!
  }

  input UpdateProjectInput {
    title: String
    description: String
    status: ProjectStatus
    requiredSkills: [String!]
    budget: JSON
  }

  input SendConnectionInput {
    receiverId: ID!
    kind: ConnectionKind!
  }

  input ProjectFilterInput {
    status: ProjectStatus
    region: Region
    skills: [String!]
  }

  # ─── Operations ──────────────────────────────────────────────────────────────

  type Query {
    me: User
    user(id: ID!): User
    users(role: UserRole, region: Region, limit: Int, offset: Int): [User!]!
    profile(userId: ID!): Profile
    project(id: ID!): Project
    projects(filter: ProjectFilterInput, limit: Int, offset: Int): [Project!]!
    myProjects: [Project!]!
    connections(status: ConnectionStatus): [Connection!]!
    messages(withUserId: ID!, limit: Int, before: String): [Message!]!
    unreadCount: Int!
    matches(matchType: String!, filters: MatchFilterInput, limit: Int): [Match!]!
    matchCandidates(userId: ID!, role: UserRole!, limit: Int): [MatchResult!]!
    matchDisplay(userId: ID!, role: UserRole!, limit: Int, requiredSkills: [String!]): [MatchDisplayResult!]!
    matchMetrics(since: DateTime): MatchMetrics!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): Profile!
    requestProfilePhotoUpload(fileName: String!): PresignedUrl!
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!
    sendConnection(input: SendConnectionInput!): Connection!
    respondToConnection(id: ID!, accept: Boolean!): Connection!
    sendMessage(toUserId: ID!, content: String!): Message!
    markMessagesRead(fromUserId: ID!): Int!
    submitMatchFeedback(matchId: ID!, action: String!, reason: String): Boolean!
  }

  type Subscription {
    newMatch: MatchEvent!
    connectionUpdate: ConnectionUpdateEvent!
  }
`;
