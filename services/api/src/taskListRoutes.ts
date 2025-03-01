import { Router } from 'express';
import {
  createTaskList,
  deleteTaskList,
  getTaskListById,
  getTaskLists,
  setTaskListDone as setTaskListStatus,
  updateTaskList,
} from './lib/models/taskListModel';
import {
  createTaskListSchema,
  TaskListAccessLevel,
  taskStatusSchema,
  updateTaskListSchema,
} from '@todoiti/common';
import z from 'zod';
import { getTaskListTasks } from './lib/models/taskModel';
import taskListAccessMiddleware from './lib/taskListAccessMiddleware';

const router = Router();

router.get('/:taskListId', taskListAccessMiddleware(TaskListAccessLevel.read), async (req, res) => {
  try {
    const params = z
      .object({
        taskListId: z.string().uuid(),
      })
      .parse(req.params);

    const taskList = await getTaskListById(params.taskListId);
    const tasks = await getTaskListTasks(params.taskListId);
    res.json({ ...taskList, tasks });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
});

router.get('', taskListAccessMiddleware(TaskListAccessLevel.read), async (req, res) => {
  try {
    const taskLists = await getTaskLists(
      (req.user as any).id,
      (req as any).accessibleTaskLists,
      Boolean(req.query.onlyPersonal)
    );

    const taskListsWithTasks = await Promise.all(
      taskLists.map(async (taskList) => ({
        ...taskList,
        tasks: await getTaskListTasks(taskList.id),
      }))
    );

    res.json(taskListsWithTasks);
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
    const body = createTaskListSchema.parse(req.body);
    const id = await createTaskList(body, (req.user as any).id);

    res.json({ id });
  } catch (error: any) {
    console.error(`Error while adding task list: ${error?.message}`);
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else {
      res.status(500).json({ message: 'Something went wrong' });
    }
  }
});

router.post(
  '/:taskListId/:taskListStatus',
  taskListAccessMiddleware(TaskListAccessLevel.write),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskListId: z.string().uuid(),
          taskListStatus: taskStatusSchema
        })
        .parse(req.params);

      await setTaskListStatus(params.taskListId, params.taskListStatus);
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

router.patch(
  '/:taskListId',
  taskListAccessMiddleware(TaskListAccessLevel.write),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskListId: z.string().uuid(),
        })
        .parse(req.params);

      const body = updateTaskListSchema.parse(req.body);

      await updateTaskList(params.taskListId, body);
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
  '/:taskListId',
  taskListAccessMiddleware(TaskListAccessLevel.admin),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskListId: z.string().uuid(),
        })
        .parse(req.params);

      await deleteTaskList(params.taskListId);
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
