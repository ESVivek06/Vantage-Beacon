import { messageResolvers } from './messages';

export const resolvers = {
  Query: {
    ...messageResolvers.Query,
  },
  Mutation: {
    ...messageResolvers.Mutation,
  },
  Message: messageResolvers.Message,
};
