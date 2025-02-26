import { Router } from 'express';
import {
  createTaskList,
  getTaskListById,
  getTaskLists,
  updateTaskList,
} from './lib/models/taskListModel';
import { getUserTaskListAccess } from './lib/models/taskListAccessModel';
import { Task, TaskListAccessLevel, taskStatusSchema } from '@todoiti/common';
import z from 'zod';
import { getTaskListTasks } from './lib/models/taskModel';

const router = Router();

router.get('/:taskListId', async (req, res) => {
  try {
    console.info('debug', req.params, req.query);
    const params = z
      .object({
        taskListId: z.string().uuid(),
      })
      .parse(req.params);

    const access = await getUserTaskListAccess((req.user as any).id, params.taskListId);
    if (access && access.level > TaskListAccessLevel.suspended) {
      const taskList = await getTaskListById(params.taskListId, (req.user as any).id);
      let tasks: readonly Task[] = [];
      if (Boolean(req.query.withTasks)) {
        tasks = await getTaskListTasks(params.taskListId);
      }
      res.json({...taskList, tasks });
    } else {
      res.status(403).json({ message: 'No access' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
});

router.get('', async (req, res) => {
  try {
    const taskLists = await getTaskLists((req.user as any).id, Boolean(req.query.onlyPersonal));

    res.json(taskLists);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
});

router.post('', async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().min(3),
        description: z.string().optional(),
      })
      .parse(req.body);
    const id = await createTaskList(body, (req.user as any).id);

    res.json({ id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
});

router.patch('/:taskListId', async (req, res) => {
  try {
    const params = z
      .object({
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

    const access = await getUserTaskListAccess((req.user as any).id, params.taskListId);
    if (access && access.level > TaskListAccessLevel.read) {
      await updateTaskList(req.params.taskListId, req.body);
      res.json({ success: true });
    } else {
      res.status(403).json({ message: 'No access' });
    }
    const id = await createTaskList(body, (req.user as any).id);

    res.json({ id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
});

export default router;
