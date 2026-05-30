import { getClientForRegion, Region, ConnectionStatus, ConnectionKind } from '@vb/database';
import { conflict, notFound, forbidden } from '../lib/errors';
import { pubsub, EVENTS } from '../lib/pubsub';
import { enqueueConnectionAcceptedEmail } from '../email/queue';

export async function sendConnection(
  requesterId: string,
  region: Region,
  receiverId: string,
  kind: ConnectionKind,
) {
  if (requesterId === receiverId) throw conflict('Cannot connect to yourself');

  const db = getClientForRegion(region);

  const existing = await db.connection.findFirst({
    where: {
      OR: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
      deletedAt: null,
    },
  });
  if (existing) throw conflict('A connection between these users already exists');

  const connection = await db.connection.create({
    data: { requesterId, receiverId, kind },
    include: {
      requester: { include: { profile: true } },
      receiver: { include: { profile: true } },
    },
  });

  await pubsub.publish(EVENTS.CONNECTION_UPDATE, {
    connectionUpdate: {
      connectionId: connection.id,
      status: connection.status,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
    },
  });

  return connection;
}

export async function respondToConnection(
  connectionId: string,
  userId: string,
  region: Region,
  accept: boolean,
) {
  const db = getClientForRegion(region);

  const connection = await db.connection.findFirst({
    where: { id: connectionId, deletedAt: null },
  });
  if (!connection) throw notFound('Connection');
  if (connection.receiverId !== userId) throw forbidden('Not the receiver of this request');
  if (connection.status !== ConnectionStatus.pending) {
    throw conflict('This connection request has already been responded to');
  }

  const updated = await db.connection.update({
    where: { id: connectionId },
    data: { status: accept ? ConnectionStatus.accepted : ConnectionStatus.declined },
    include: {
      requester: { include: { profile: true } },
      receiver: { include: { profile: true } },
    },
  });

  await pubsub.publish(EVENTS.CONNECTION_UPDATE, {
    connectionUpdate: {
      connectionId: updated.id,
      status: updated.status,
      requesterId: updated.requesterId,
      receiverId: updated.receiverId,
    },
  });

  // Notify the requester that the receiver accepted their connection request
  if (accept && updated.requester.profile) {
    const acceptorName = updated.receiver.profile?.displayName ?? 'Someone';
    enqueueConnectionAcceptedEmail({
      to: updated.requester.email,
      userId: updated.requester.id,
      displayName: updated.requester.profile.displayName,
      connectionName: acceptorName,
      messagesUrl: `${process.env.APP_URL ?? 'https://app.vb.com'}/messages`,
    }).catch((err: Error) => {
      console.error('[connection.service] Failed to enqueue connection-accepted email:', err.message);
    });
  }

  return updated;
}

export async function listConnections(
  userId: string,
  region: Region,
  status?: ConnectionStatus,
) {
  const db = getClientForRegion(region);
  return db.connection.findMany({
    where: {
      OR: [{ requesterId: userId }, { receiverId: userId }],
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    include: {
      requester: { include: { profile: true } },
      receiver: { include: { profile: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
