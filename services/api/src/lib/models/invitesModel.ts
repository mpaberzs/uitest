import { CreateInvite, Invite, inviteSchema, TaskListAccessLevel } from '@todoiti/common';
import database from '../database';
import { sql } from 'slonik';
import { v4 as uuidv4 } from 'uuid';
import { delegateUserTaskListAccess } from './taskListAccessModel';
import z from 'zod';
import { getConfig } from '../config';

export const getInviteByHash = async (hash: string) => {
  const connection = await database();

  return connection.maybeOne(
    sql.type(
      inviteSchema.extend({ expired: z.number().int() })
    )`SELECT id, task_list_id, access_level, hash, expires_at, accepted, inviter_id, accepter_id, current_timestamp >= expires_at AS expired
    FROM collaboration_invites WHERE hash = ${hash}`
  );
};

export const acceptInvite = async (invite: Invite, accepterId: string) => {
  const connection = await database();

  await connection.transaction(async (tx) => {
    await delegateUserTaskListAccess(
      invite.task_list_id,
      invite.access_level as (typeof TaskListAccessLevel)[keyof typeof TaskListAccessLevel],
      accepterId,
      invite.inviter_id,
      tx
    );
    await tx.query(
      sql.unsafe`UPDATE collaboration_invites SET accepted=true, updated_at=current_timestamp, accepter_id=${accepterId} WHERE hash=${invite.hash}`
    );
  });
};

export const createInvite = async (
  taskListId: string,
  inviterId: string,
  payload: CreateInvite
): Promise<string> => {
  const connection = await database();
  const id = uuidv4();
  // FIXME: for PoC - should be improved later
  const hash = uuidv4();
  const link = `${getConfig().webAppUrl}/accept-invite/${hash}`;

  await connection.query(
    sql.unsafe`INSERT INTO collaboration_invites (id, hash, task_list_id, inviter_id, access_level, link) SELECT * FROM ${sql.unnest(
      [[id, hash, taskListId, inviterId, payload.access_level ?? TaskListAccessLevel.write, link]],
      ['uuid', 'uuid', 'uuid', 'uuid', 'int4', 'text']
    )}`
  );

  return link;
};
