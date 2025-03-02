import { WebsocketRequestHandler } from 'express-ws';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { getConfig } from './lib/config';
import z from 'zod';
import { getUserTaskListAccess } from './lib/models/taskListAccessModel';
import { TaskListAccessLevel } from '@todoiti/common';
import { WebsocketService } from './lib/websocketService';

const websocketHandler: WebsocketRequestHandler = async (ws, req, next) => {
  const accessToken = req.query.accessToken;
  if (!accessToken) {
    console.warn('No accessToken in websocket request');
    ws.send(JSON.stringify({ status: 'failed', message: 'Unauthorized' }));
    ws.close();
    return;
  }

  let userId = '';
  try {
    const verified = jwt.verify(String(accessToken), getConfig().jwtAccessSecret) as JwtPayload;
    userId = verified.id;
  } catch (error: any) {
    console.warn('Error validating accessToken in websocket request:', error?.message);
    ws.send(JSON.stringify({ status: 'failed', message: 'Unauthorized' }));
    ws.close();
    return;
  }
  if (!userId) {
    // edge case
    ws.close();
    return;
  }

  try {
    const taskListId = z.string().uuid().parse(req.params.taskListId);
    const access = await getUserTaskListAccess(userId, taskListId);
    if (access && access.level >= TaskListAccessLevel.read && !access.expired) {
      WebsocketService.addSubscriber(taskListId, ws as any);
    }
  } catch (error: any) {
    console.warn('Error validating accessToken in websocket request:', error?.message);
    ws.send(JSON.stringify({ status: 'failed', message: 'Unauthorized' }));
    ws.close();
    return;
  }
};

export default websocketHandler;
