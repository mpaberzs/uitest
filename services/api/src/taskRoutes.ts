import { Router } from 'express';
import { createTask, getTaskById, getTaskListTasks, updateTask } from './lib/models/taskModel';
import { getUserTaskListAccess } from './lib/models/taskListAccessModel';
import z from 'zod';
import { TaskListAccessLevel, taskStatusSchema } from '@todoiti/common';

const router = Router();

router.get('/:taskListId/:taskId', async (req, res) => {
  try {
    const params = z
      .object({
        taskId: z.string().uuid(),
        taskListId: z.string().uuid(),
      })
      .parse(req.params);

    const access = await getUserTaskListAccess((req.user as any).id, params.taskListId);
    if (access && access.level > TaskListAccessLevel.suspended) {
      const task = await getTaskById(params.taskId, params.taskListId);
      res.json(task);
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

router.get('/:taskListId', async (req, res) => {
  try {
    const params = z
      .object({
        taskListId: z.string().uuid(),
      })
      .parse(req.params);

    const access = await getUserTaskListAccess((req.user as any).id, params.taskListId);
    if (access && access.level > TaskListAccessLevel.suspended) {
      const tasks = await getTaskListTasks(params.taskListId);
      res.json(tasks);
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

router.post('/:taskListId', async (req, res) => {
  try {
    z.object({
      taskListId: z.string().uuid(),
    }).parse(req.params);

    const body = z
      .object({
        name: z.string().min(3),
        description: z.string().optional(),
        task_list_id: z.string().uuid(),
      })
      .parse(req.body);

    const access = await getUserTaskListAccess((req.user as any).id, body.task_list_id);
    if (access && access.level > TaskListAccessLevel.read) {
      const id = await createTask(body);

      res.json({ id });
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

router.patch('/:taskListId/:taskId', async (req, res) => {
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

    const access = await getUserTaskListAccess((req.user as any).id, params.taskListId);
    if (access && access.level > TaskListAccessLevel.read) {
      await updateTask(params.taskId, body, params.taskListId);
      res.json({ success: true });
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

export default router;
