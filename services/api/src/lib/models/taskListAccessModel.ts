import { TaskListAccess, TaskListAccessLevel, taskListAccessSchema } from '@todoiti/common';
import database from '../database';
import { DatabaseTransactionConnection, sql } from 'slonik';
import z from 'zod';

export const delegateUserTaskListAccess = async (
  taskListId: string,
  level: (typeof TaskListAccessLevel)[keyof typeof TaskListAccessLevel] = TaskListAccessLevel.admin,
  targetUserId: string,
  currentUserId: string,
  tx?: DatabaseTransactionConnection
): Promise<void> => {
  const connection = tx ?? (await database());

  await connection.query(
    sql.unsafe`INSERT INTO task_list_access (task_list_id, delegated_to, delegated_by, level) SELECT * FROM ${sql.unnest(
      [[taskListId, targetUserId, currentUserId, level]],
      ['uuid', 'uuid', 'uuid', 'int4']
    )}`
  );
};

export const getUserAllTaskListAccessNonExpired = async (
  userId: string
): Promise<readonly Pick<TaskListAccess, 'id' | 'task_list_id' | 'level'>[]> => {
  const connection = await database();

  return connection.any(
    sql.type(taskListAccessSchema)`SELECT tla.id, tla.task_list_id, tla.level 
    FROM task_list_access tla
    WHERE tla.delegated_to = ${userId} AND tla.expires_at IS NULL OR tla.expires_at > current_timestamp`
  );
};

export const getUserTaskListAccess = async (
  userId: string,
  taskListId: string
): Promise<(TaskListAccess & { expired: boolean }) | null> => {
  const connection = await database();

  return connection.maybeOne(
    sql.type(
      taskListAccessSchema.extend({ expired: z.boolean() })
    )`SELECT tla.id, tla.task_list_id, tla.delegated_to, tla.delegated_by, tla.delegated_at, tla.updated_at, tla.expires_at, tla.level, tla.expires_at IS NOT NULL AND tla.expires_at <= current_timestamp AS expired
    FROM task_list_access tla
    WHERE tla.delegated_to = ${userId} AND tla.task_list_id = ${taskListId}`
  );
};
