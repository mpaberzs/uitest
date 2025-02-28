import z from 'zod';
import {
  authUserSchema,
  createUserSchema,
  taskListSchema,
  taskSchema,
  updateUserSchema,
  userLoginSchema,
  userSchema,
  taskListAccessSchema,
  createTaskSchema,
} from './schemas';

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskList = z.infer<typeof createTaskSchema>;
export type UpdateTaskList = z.infer<typeof createTaskSchema>;
export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof createTaskSchema>;
export type TaskList = z.infer<typeof taskListSchema>;
export type TaskListAccess = z.infer<typeof taskListAccessSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
