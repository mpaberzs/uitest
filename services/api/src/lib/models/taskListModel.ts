import { TaskList, TaskListAccessLevel, taskListSchema, taskSchema } from '@todoiti/common';
import database from '../database';
import { sql } from 'slonik';
import { v4 as uuidv4 } from 'uuid';
import { delegateUserTaskListAccess } from './taskListAccessModel';

export const getTaskLists = async (
  userId: string,
  delegatedTaskLists: string[],
  onlyPersonal: boolean
): Promise<readonly TaskList[]> => {
  const connection = await database();

  return connection.any(
    sql.type(
      taskListSchema
    )`SELECT tl.id, tl.status, tl.name, tl.description, tl.created_at, tl.updated_at, tl.created_by 
    FROM task_lists tl
    WHERE tl.id IN (${sql.join(delegatedTaskLists, sql.fragment`,`)}) AND tl.created_by = ${onlyPersonal ? userId : sql.identifier`created_by`}
    ORDER BY tl.created_at DESC`
  );
};

export const getTaskListById = async (id: string): Promise<TaskList | null> => {
  const connection = await database();

  return connection.maybeOne(
    sql.type(
      taskSchema
    )`SELECT tl.id, tl.status, tl.name, tl.description, tl.created_at, tl.updated_at, tl.created_by 
    FROM task_lists tl 
    WHERE tl.id = ${id}`
  );
};

export const createTaskList = async (
  payload: Pick<TaskList, 'name' | 'description'>,
  userId: string
): Promise<string> => {
  const connection = await database();
  const id = uuidv4();
  await connection.transaction(async (tx) => {
    await tx.query(
      sql.unsafe`INSERT INTO task_lists (id, name, description, created_by) SELECT * FROM ${sql.unnest(
        [[id, payload.name, payload.description ?? '', userId]],
        ['uuid', 'text', 'text', 'uuid']
      )}`
    );

    // delegate the task list to the user with admin level
    await delegateUserTaskListAccess(id, TaskListAccessLevel.admin, userId, userId, tx);
  });

  return id;
};

export const setTaskListDone = async (
  id: string,
  status: TaskList['status'],
  updateRelatedTasks: boolean
): Promise<void> => {
  const connection = await database();

  await connection.transaction(async (tx) => {
    await tx.query(sql.unsafe`UPDATE task_lists SET status = ${status} WHERE id = ${id}`);

    if (updateRelatedTasks) {
      await tx.query(sql.unsafe`UPDATE tasks SET status = ${status} WHERE task_list_id = ${id}`);
    }
  });
};

export const updateTaskList = async (
  id: string,
  payload: Pick<TaskList, 'name' | 'description' | 'status'>
): Promise<void> => {
  const connection = await database();

  await connection.query(
    sql.unsafe`UPDATE task_lists SET name = ${payload.name}, description = ${payload.description ?? ''}, status = ${payload.status} WHERE id = ${id}`
  );
};

export const deleteTaskList = async (id: string): Promise<void> => {
  const connection = await database();

  await connection.query(sql.unsafe`DELETE FROM task_lists WHERE id = ${id}`);
};
