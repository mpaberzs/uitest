import { Router } from 'express';
import Joi from 'joi';
import { createTask, getTaskById, getTaskListTasks, updateTask } from './lib/models/taskModel';
import { getUserTaskListAccess } from './lib/models/taskListAccessModel';

const router = Router();

router.get('/:taskListId/:taskId', async (req, res) => {
  try {
    const paramsSchema = Joi.object({
      taskId: Joi.string().uuid({ version: 'uuidv4' }),
      taskListId: Joi.string().uuid({ version: 'uuidv4' }),
    });
    const validationResult = paramsSchema.validate(req.params);
    if (validationResult.error) {
      res.status(400).json({ errors: validationResult.error.details });
    } else {
      const access = await getUserTaskListAccess(
        (req.user as any).id,
        req.params.taskListId
      ).then();
      if (access && access.level >= 1) {
        const task = await getTaskById(req.params.taskId, req.params.taskListId);
        res.json(task);
      } else {
        res.status(403).json({ message: 'No access' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/:taskListId', async (req, res) => {
  try {
    const access = await getUserTaskListAccess((req.user as any).id, req.params.taskListId).then();
    if (access && access.level >= 1) {
      const tasks = await getTaskListTasks(req.params.taskListId);
      res.json(tasks);
    } else {
      res.status(403).json({ message: 'No access' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/:taskListId', async (req, res) => {
  const paramsSchema = Joi.object({
    taskId: Joi.string().uuid({ version: 'uuidv4' }),
    taskListId: Joi.string().uuid({ version: 'uuidv4' }),
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
      const access = await getUserTaskListAccess(
        (req.user as any).id,
        req.params.taskListId
      ).then();
      if (access && access.level > 1) {
        const id = await createTask(req.body);

        res.json({ id });
      } else {
        res.status(403).json({ message: 'No access' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.patch('/:taskListId/:taskId', async (req, res) => {
  const paramsSchema = Joi.object({
    taskId: Joi.string().uuid({ version: 'uuidv4' }),
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
      await updateTask(req.params.taskId, req.body, req.params.taskListId);
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;
