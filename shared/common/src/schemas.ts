import z from 'zod';
import { TaskListAccessLevel } from './constants';

export const taskStatusSchema = z.enum(['active', 'done', 'hidden']);
export const taskListAccessLevelSchema = z
  .number()
  .int()
  .min(TaskListAccessLevel.suspended)
  .max(TaskListAccessLevel.admin); // 0: suspended; 1: read, 2: write, 3: admin

export const taskListAccessSchema = z.object({
  id: z.number(),
  task_list_id: z.string(),
  delegated_to: z.string(),
  delegated_by: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  expires_at: z.number().optional(),
  level: taskListAccessLevelSchema,
});

export const createInviteSchema = z.object({
  access_level: taskListAccessLevelSchema.optional(),
  expires_at: z.number().int().positive().optional(),
});

export const inviteSchema = createInviteSchema.extend({
  task_list_id: z.string().uuid(),
  id: z.string().uuid(),
  expires_at: z.number().int().positive(),
  // FIXME: PoF: can be later improved
  hash: z.string().uuid(),
  accepted: z.boolean(),
  inviter_id: z.string().uuid(),
  link: z.string(),
  accepter_id: z.string().uuid().optional(),
});

export const createTaskSchema = z.object({
  name: z.string(),
  status: taskStatusSchema,
  description: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.extend({});

export const taskSchema = z.object({
  id: z.string().uuid(),
  task_list_id: z.string().uuid(),
  name: z.string(),
  status: taskStatusSchema,
  description: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  created_by: z.string(),
});

export const taskListSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: taskStatusSchema,
  description: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  created_by: z.string(),
  tasks: z.array(taskSchema).optional(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  created_at: z.number(),
  updated_at: z.number(),
});

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  // FIXME: stronger password validation e.g. https://forum.codewithmosh.com/t/password-complexity-for-zod/23622
  password: z.string().min(8),
});

export const createTaskListSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  status: taskStatusSchema,
});

export const updateTaskListSchema = createTaskListSchema.extend({});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  // FIXME: stronger password validation e.g. https://forum.codewithmosh.com/t/password-complexity-for-zod/23622
  password: z.string().min(8).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});
