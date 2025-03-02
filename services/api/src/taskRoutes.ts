import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTaskListTasks,
  updateTask,
} from './lib/models/taskModel';
import z from 'zod';
import { createTaskSchema, TaskListAccessLevel, taskStatusSchema } from '@todoiti/common';
import checkTaskListAccessMiddleware from './lib/taskListAccessMiddleware';
import { WebsocketService } from './lib/websocketService';

const router = Router();

router.get(
  '/:taskListId/:taskId',
  checkTaskListAccessMiddleware(TaskListAccessLevel.read),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskId: z.string().uuid(),
          taskListId: z.string().uuid(),
        })
        .parse(req.params);

      const task = await getTaskById(params.taskId, params.taskListId);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation failed: ', error.issues[0]);
        res.status(400).json(error.issues[0]);
      } else {
        res.status(500).json({ message: 'Something went wrong' });
      }
    }
  }
);

router.get(
  '/:taskListId',
  checkTaskListAccessMiddleware(TaskListAccessLevel.read),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskListId: z.string().uuid(),
        })
        .parse(req.params);

      const tasks = await getTaskListTasks(params.taskListId);
      res.json(tasks);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation failed: ', error.issues[0]);
        res.status(400).json(error.issues[0]);
      } else {
        res.status(500).json({ message: 'Something went wrong' });
      }
    }
  }
);

router.post(
  '/:taskListId',
  checkTaskListAccessMiddleware(TaskListAccessLevel.write),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskListId: z.string().uuid(),
        })
        .parse(req.params);

      const body = createTaskSchema.parse(req.body);

      const id = await createTask(body, params.taskListId);

      WebsocketService.publishUpdateToTaskListSubscribers(params.taskListId);
      res.json({ id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation failed: ', error.issues[0]);
        res.status(400).json(error.issues[0]);
      } else {
        res.status(500).json({ message: 'Something went wrong' });
      }
    }
  }
);

router.patch(
  '/:taskListId/:taskId',
  checkTaskListAccessMiddleware(TaskListAccessLevel.write),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskId: z.string().uuid(),
          taskListId: z.string().uuid(),
        })
        .parse(req.params);

      const body = z
        .object({
          name: z.string().min(3),
          description: z.string().optional(),
          status: taskStatusSchema,
        })
        .parse(req.body);

      await updateTask(params.taskId, body, params.taskListId);
      WebsocketService.publishUpdateToTaskListSubscribers(params.taskListId);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation failed: ', error.issues[0]);
        res.status(400).json(error.issues[0]);
      } else {
        res.status(500).json({ message: 'Something went wrong' });
      }
    }
  }
);

router.delete(
  '/:taskListId/:taskId',
  checkTaskListAccessMiddleware(TaskListAccessLevel.write),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskId: z.string().uuid(),
          taskListId: z.string().uuid(),
        })
        .parse(req.params);

      await deleteTask(params.taskId, params.taskListId);
      WebsocketService.publishUpdateToTaskListSubscribers(params.taskListId);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation failed: ', error.issues[0]);
        res.status(400).json(error.issues[0]);
      } else {
        res.status(500).json({ message: 'Something went wrong' });
      }
    }
  }
);

export default router;
