import { DateTimeResolver, JSONResolver } from 'graphql-scalars';
import { messageResolvers } from './messages';
import { userResolvers } from './user';
import { profileResolvers } from './profile';
import { projectResolvers } from './project';
import { connectionResolvers } from './connection';
import { subscriptionResolvers } from './subscription';
import { matchResolvers } from './match';

export const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  Query: {
    ...messageResolvers.Query,
    ...userResolvers.Query,
    ...profileResolvers.Query,
    ...projectResolvers.Query,
    ...connectionResolvers.Query,
    ...matchResolvers.Query,
  },

  Mutation: {
    ...messageResolvers.Mutation,
    ...userResolvers.Mutation,
    ...profileResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...connectionResolvers.Mutation,
    ...matchResolvers.Mutation,
  },

  Subscription: subscriptionResolvers.Subscription,

  Message: messageResolvers.Message,
  User: userResolvers.User,
  Profile: profileResolvers.Profile,
  Project: projectResolvers.Project,
  Connection: connectionResolvers.Connection,
};
