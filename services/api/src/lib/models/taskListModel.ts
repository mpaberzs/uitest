import { TaskList, TaskListAccessLevel, taskListSchema, taskSchema } from '@todoiti/common';
import database from '../database';
import { sql } from 'slonik';
import { v4 as uuidv4 } from 'uuid';

export const getTaskLists = async (
  userId: string,
  onlyPersonal: boolean
): Promise<readonly TaskList[]> => {
  const connection = await database();

  return connection.any(
    sql.type(
      taskListSchema
    )`SELECT tl.id, tl.status, tl.name, tl.description, tl.created_at, tl.updated_at, tl.created_by 
    FROM task_lists tl
    LEFT JOIN task_list_access tla ON tla.delegated_to = ${userId} AND tla.task_list_id = tl.id 
    WHERE tla.id IS NOT NULL AND tl.created_by = ${onlyPersonal ? userId : sql.identifier`created_by`}`
  );
};

export const getTaskListById = async (id: string, userId: string): Promise<TaskList | null> => {
  const connection = await database();

  return connection.maybeOne(
    sql.type(
      taskSchema
    )`SELECT tl.id, tl.status, tl.name, tl.description, tl.created_at, tl.updated_at, tl.created_by 
    FROM task_lists tl 
    LEFT JOIN task_list_access tla ON tla.delegated_to = ${userId} AND tla.task_list_id = tl.id 
    WHERE tl.id = ${id} AND tla.id IS NOT NULL`
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
    await tx.query(
      sql.unsafe`INSERT INTO task_list_access (task_list_id, delegated_to, delegated_by, level) SELECT * FROM ${sql.unnest(
        [[id, userId, userId, TaskListAccessLevel.admin]],
        ['uuid', 'uuid', 'uuid', 'text']
      )}`
    );
  });

  return id;
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
