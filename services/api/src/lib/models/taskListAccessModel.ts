import { TaskListAccess, taskListAccessSchema } from '@todoiti/common';
import database from '../database';
import { sql } from 'slonik';

export const getUserAllTaskListAccess = async (
  userId: string,
): Promise<readonly TaskListAccess[]> => {
  const connection = await database();

  return connection.any(
    sql.type(
      taskListAccessSchema
    )`SELECT tla.id, tla.task_list_id, tla.delegated_to, tla.status, tla.delegated_by, tla.delegated_at, tla.updated_at, tla.expires_at, tla.level
    FROM task_list_access tla
    WHERE tla.delegated_to = ${userId} AND tla.expires_at IS NULL OR tla.expires_at > current_timestamp`
  );
}

export const getUserTaskListAccess = async (
  userId: string,
  taskListId: string
): Promise<TaskListAccess | null> => {
  const connection = await database();

  return connection.maybeOne(
    sql.type(
      taskListAccessSchema
    )`SELECT tla.id, tla.task_list_id, tla.delegated_to, tla.status, tla.delegated_by, tla.delegated_at, tla.updated_at, tla.expires_at, tla.level
    FROM task_list_access tla
    WHERE tla.delegated_to = ${userId} AND tla.task_list_id = ${taskListId} AND (tla.expires_at IS NULL OR tla.expires_at > current_timestamp)`
  );
}
