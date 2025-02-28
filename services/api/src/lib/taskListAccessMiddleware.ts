import { TaskListAccessLevel } from '@todoiti/common';
import {
  getUserAllTaskListAccessNonExpired,
  getUserTaskListAccess,
} from './models/taskListAccessModel';
import { RequestHandler } from 'express';

const checkTaskListAccessMiddleware =
  (targetLevel: (typeof TaskListAccessLevel)[keyof typeof TaskListAccessLevel]): RequestHandler =>
  async (req, res, next) => {
    // safeguard
    if (!(req.user as any).id) {
      console.error('[checkTaskListAccessMiddleware]: no user: possibly wrong middleware order');
      throw new Error('could not identify current user');
    }
    if (req.params.taskListId) {
      const result = await getUserTaskListAccess((req.user as any).id, req.params.taskListId);
      if (!result) {
        // we cannot let user poke around any unrealted taskList id there is and check if it exists so we say it doesn't exist without checking
        res.status(404).json({ message: 'Task list not found' });
        return;
      }
      if (result.level === TaskListAccessLevel.suspended || result.expired) {
        res.status(403).json({ message: 'Your access to the task list has been suspended' });
        return;
      } else if (result.level < targetLevel) {
        res.status(403).json({ message: 'No sufficient access to task list' });
        return;
      }
    } else {
      const result = await getUserAllTaskListAccessNonExpired((req.user as any).id);
      (req as any).accessibleTaskLists = result.map((a) => a.task_list_id);
    }
    next();
  };

export default checkTaskListAccessMiddleware;
