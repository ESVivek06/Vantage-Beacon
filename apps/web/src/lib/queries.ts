import { gql } from 'graphql-request';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
      region
      photoUrl
      profile {
        id
        displayName
        bio
        skills
        tags
        verified
      }
      ownedProjects {
        id
        title
        status
        region
      }
    }
  }
`;

export const USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      email
      role
      region
      photoUrl
      profile {
        id
        displayName
        bio
        skills
        tags
        verified
      }
      ownedProjects {
        id
        title
        status
        region
        description
        requiredSkills
      }
    }
  }
`;

export const USERS_QUERY = gql`
  query Users($role: UserRole, $region: Region, $limit: Int, $offset: Int) {
    users(role: $role, region: $region, limit: $limit, offset: $offset) {
      id
      email
      role
      region
      photoUrl
      profile {
        displayName
        bio
        skills
        tags
        verified
      }
    }
  }
`;

export const PROJECTS_QUERY = gql`
  query Projects($filter: ProjectFilterInput, $limit: Int, $offset: Int) {
    projects(filter: $filter, limit: $limit, offset: $offset) {
      id
      title
      description
      status
      requiredSkills
      budget
      region
      createdAt
      owner {
        id
        role
        photoUrl
        profile {
          displayName
        }
      }
    }
  }
`;

export const PROJECT_QUERY = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id
      title
      description
      status
      requiredSkills
      budget
      region
      createdAt
      updatedAt
      owner {
        id
        email
        role
        photoUrl
        profile {
          displayName
          bio
        }
      }
    }
  }
`;

export const MY_PROJECTS_QUERY = gql`
  query MyProjects {
    myProjects {
      id
      title
      description
      status
      requiredSkills
      budget
      region
      createdAt
      updatedAt
    }
  }
`;

export const CONNECTIONS_QUERY = gql`
  query Connections($status: ConnectionStatus) {
    connections(status: $status) {
      id
      status
      kind
      createdAt
      requester {
        id
        role
        photoUrl
        profile {
          displayName
        }
      }
      receiver {
        id
        role
        photoUrl
        profile {
          displayName
        }
      }
    }
  }
`;

export const MESSAGES_QUERY = gql`
  query Messages($withUserId: ID!, $limit: Int, $before: String) {
    messages(withUserId: $withUserId, limit: $limit, before: $before) {
      id
      senderId
      receiverId
      content
      read
      sentAt
    }
  }
`;

export const UNREAD_COUNT_QUERY = gql`
  query UnreadCount {
    unreadCount
  }
`;

export const DASHBOARD_METRICS_QUERY = gql`
  query DashboardMetrics {
    myMatchCount
    unreadCount
    myConnectionCount
  }
`;

// Mutations
export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      displayName
      bio
      skills
      tags
      verified
    }
  }
`;

export const REQUEST_PHOTO_UPLOAD_MUTATION = gql`
  mutation RequestProfilePhotoUpload($fileName: String!) {
    requestProfilePhotoUpload(fileName: $fileName) {
      url
      key
    }
  }
`;

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      title
      description
      status
      region
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      title
      description
      status
      requiredSkills
      budget
      region
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

export const SEND_CONNECTION_MUTATION = gql`
  mutation SendConnection($input: SendConnectionInput!) {
    sendConnection(input: $input) {
      id
      status
      kind
    }
  }
`;

export const RESPOND_TO_CONNECTION_MUTATION = gql`
  mutation RespondToConnection($id: ID!, $accept: Boolean!) {
    respondToConnection(id: $id, accept: $accept) {
      id
      status
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($toUserId: ID!, $content: String!) {
    sendMessage(toUserId: $toUserId, content: $content) {
      id
      content
      senderId
      receiverId
      sentAt
      read
    }
  }
`;

export const MARK_MESSAGES_READ_MUTATION = gql`
  mutation MarkMessagesRead($fromUserId: ID!) {
    markMessagesRead(fromUserId: $fromUserId)
  }
`;
