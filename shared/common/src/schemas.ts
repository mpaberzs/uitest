import z from 'zod';

export const taskStatusSchema = z.enum(['active', 'done', 'hidden']);
export const taskListAccessSchema = z.object({
  id: z.number(),
  task_list_id: z.string(),
  delegated_to: z.string(),
  delegated_by: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  expires_at: z.number().optional(),
  level: z.number().int().min(0).max(3), // 0: suspended; 1: read, 2: write, 3: admin
});

export const taskListSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  status: taskStatusSchema,
  description: z.string().optional(),
  created_at: z.number(),
  updated_at: z.number(),
  created_by: z.string(),
});

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

export const taskListWithTasksSchema = taskListSchema.extend({ tasks: z.array(taskSchema) });

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
