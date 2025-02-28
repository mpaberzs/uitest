import { CreateTask, Task, taskSchema } from '@todoiti/common';
import database from '../database';
import { sql } from 'slonik';
import { v4 as uuidv4 } from 'uuid';

export const getTaskListTasks = async (taskListId: string): Promise<readonly Task[]> => {
  const connection = await database();

  return connection.any(
    sql.type(
      taskSchema
    )`SELECT id, status, name, description, created_at, updated_at, created_by FROM tasks WHERE task_List_id = ${taskListId}`
  );
};

export const getTaskById = async (id: string, taskListId: string): Promise<Task | null> => {
  const connection = await database();

  return connection.maybeOne(
    sql.type(
      taskSchema
    )`SELECT id, status, name, description, created_at, updated_at, created_by FROM tasks WHERE id = ${id} AND task_list_id = ${taskListId}`
  );
};

export const createTask = async (payload: CreateTask, taskListId: string): Promise<string> => {
  const connection = await database();
  const id = uuidv4();

  await connection.query(
    sql.unsafe`INSERT INTO tasks (id, name, description, task_list_id, status) SELECT * FROM ${sql.unnest(
      [[id, payload.name, payload.description ?? '', taskListId, payload.status]],
      ['uuid', 'text', 'text', 'uuid', 'text']
    )}`
  );
  return id;
};

export const updateTask = async (
  id: string,
  payload: Pick<Task, 'name' | 'description' | 'status'>,
  taskListId: string
): Promise<void> => {
  const connection = await database();

  await connection.query(
    // also check task_list_id to prevent payload forgery
    sql.unsafe`UPDATE tasks SET name = ${payload.name}, description = ${payload.description ?? ''}, status = ${payload.status} WHERE id = ${id} AND task_list_id = ${taskListId}`
  );
};

export const deleteTask = async (id: string, taskListId: string): Promise<void> => {
  const connection = await database();

  await connection.query(
    // also check task_list_id to prevent payload forgery
    sql.unsafe`DELETE FROM tasks WHERE id = ${id} AND task_list_id = ${taskListId}`
  );
};
