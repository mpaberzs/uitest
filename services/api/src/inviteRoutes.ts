import { Router } from 'express';
import { acceptInvite, createInvite, getInviteByHash } from './lib/models/invitesModel';
import z from 'zod';
import { createInviteSchema, TaskListAccessLevel } from '@todoiti/common';
import checkTaskListAccessMiddleware from './lib/taskListAccessMiddleware';
import passport from 'passport';
import { getConfig } from './lib/config';

const router = Router();

router.get('/:hash', async (req, res) => {
  try {
    const params = z
      .object({
        hash: z.string().uuid(),
      })
      .parse(req.params);

    const invite = await getInviteByHash(params.hash);
    // FIXME: giving relevant http status for public route here might be potential access vector but for PoC keeping it quick
    if (!invite) {
      res.status(404).json({ message: 'Invite not found' });
      return;
    }

    if (invite.accepted) {
      res.status(400).json({ message: 'Invite has already been accepted' });
      return;
    } else if (invite.expired) {
      res.status(400).json({ message: 'Invite has expired' });
      return;
    }

    res.status(200).json({ invite });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else {
      res.status(500).json({ message: 'Something went wrong while getting invite' });
    }
  }
});

router.post(
  '/:taskListId',
  passport.authenticate('jwt', { session: false }),
  checkTaskListAccessMiddleware(TaskListAccessLevel.admin),
  async (req, res) => {
    try {
      const params = z
        .object({
          taskListId: z.string().uuid(),
        })
        .parse(req.params);

      const body = createInviteSchema.parse(req.body);

      const link = await createInvite(params.taskListId, (req.user as any).id, body);
      res.status(200).json({ link });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error('Validation failed: ', error.issues[0]);
        res.status(400).json(error.issues[0]);
      } else {
        console.error(`Error generating invite: ${error?.message}`);
        res.status(500).json({ message: 'Something went wrong while generating the invite' });
      }
    }
  }
);

router.post('/accept/:hash', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const params = z
      .object({
        hash: z.string().uuid(),
      })
      .parse(req.params);

    const invite = await getInviteByHash(params.hash);
    if (!invite) {
      res.status(404).json({ message: 'Invite not found' });
      return;
    }

    if (invite.accepted) {
      res.status(400).json({ message: 'Invite has already been accepted' });
      return;
    } else if (invite.expired) {
      res.status(400).json({ message: 'Invite has expired' });
      return;
    }

    await acceptInvite(invite, (req.user as any).id);
    res.status(200).json({ taskListId: invite.task_list_id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('Validation failed: ', error.issues[0]);
      res.status(400).json(error.issues[0]);
    } else {
      console.error(`Error accepting invite: ${error?.message}`);
      res.status(500).json({ message: 'Something went wrong while accepting the invite' });
    }
  }
});

export default router;
