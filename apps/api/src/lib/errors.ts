import { GraphQLError } from 'graphql';

export function unauthenticated(): GraphQLError {
  return new GraphQLError('Not authenticated', {
    extensions: { code: 'UNAUTHENTICATED' },
  });
}

export function forbidden(message = 'Insufficient permissions'): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'FORBIDDEN' },
  });
}

export function notFound(entity: string): GraphQLError {
  return new GraphQLError(`${entity} not found`, {
    extensions: { code: 'NOT_FOUND' },
  });
}

export function conflict(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'CONFLICT' },
  });
}

export function badInput(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT' },
  });
}
