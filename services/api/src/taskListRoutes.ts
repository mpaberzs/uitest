import { Router } from 'express';
import Joi from 'joi';
import {
  createTaskList,
  getTaskListById,
  getTaskLists,
  updateTaskList,
} from './lib/models/taskListModel';
import { getUserTaskListAccess } from './lib/models/taskListAccessModel';
import { TaskListAccessLevel } from '@todoiti/common';

const router = Router();

router.get('/:taskListId', async (req, res) => {
  try {
    const paramsSchema = Joi.object({
      taskListId: Joi.string().uuid({ version: 'uuidv4' }),
    });
    const validationResult = paramsSchema.validate(req.params);
    if (validationResult.error) {
      res.status(400).json({ errors: validationResult.error.details });
    } else {
      const access = await getUserTaskListAccess((req.user as any).id, req.params.taskListId);
      if (access) {
        const taskList = await getTaskListById(req.params.taskListId, (req.user as any).id);
        res.json(taskList);
      } else {
        res.status(403).json({ message: 'No access' });
      }
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('', async (req, res) => {
  try {
    const taskLists = await getTaskLists((req.user as any).id, Boolean(req.query.onlyPersonal));

    res.json(taskLists);
  } catch (error: any) {
    console.error(error?.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('', async (req, res) => {
  const paramsSchema = Joi.object({
    taskId: Joi.string().uuid({ version: 'uuidv4' }),
  });

  const bodySchema = Joi.object({
    name: Joi.string().required().min(1),
    description: Joi.string(),
  });

  try {
    const paramsValidationResult = paramsSchema.validate(req.params);
    const bodyValidationResult = bodySchema.validate(req.body);
    const validationErrors = [paramsValidationResult.error, bodyValidationResult.error].filter(
      Boolean
    );
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors.map((e) => e!.details) });
    } else {
      const id = await createTaskList(req.body, (req.user as any).id);

      res.json({ id });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.patch('/:taskListId', async (req, res) => {
  const paramsSchema = Joi.object({
    taskListId: Joi.string().uuid({ version: 'uuidv4' }),
  });

  const bodySchema = Joi.object({
    name: Joi.string().required().min(1),
    description: Joi.string().required().min(1),
    status: Joi.string().optional().allow('active', 'done'),
  });

  try {
    const paramsValidationResult = paramsSchema.validate(req.params);
    const bodyValidationResult = bodySchema.validate(req.body);
    const validationErrors = [paramsValidationResult.error, bodyValidationResult.error].filter(
      Boolean
    );
    if (validationErrors.length > 0) {
      res.status(400).json({ errors: validationErrors.map((e) => e!.details) });
    } else {
      const access = await getUserTaskListAccess((req.user as any).id, req.params.taskListId);
      if (access && access.level > TaskListAccessLevel.read) {
        await updateTaskList(req.params.taskListId, req.body);
        res.json({ success: true });
      } else {
        res.status(403).json({ message: 'No access' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;
