export class WebsocketService {
  // FIXME: could be redis pub/sub with separate service
  // taskListId to ws instance
  static wsSubscribers = new Map<string, WebSocket[]>();

  static addSubscriber = (taskListId: string, wsInstance: WebSocket) => {
    const subs = this.wsSubscribers.get(taskListId) || [];
    this.wsSubscribers.set(taskListId, [...subs, wsInstance as any]);
  };

  static publishUpdateToTaskListSubscribers = (
    taskListId: string,
    status: 'updated' | 'deleted' = 'updated'
  ) => {
    this.wsSubscribers.get(taskListId)?.forEach((ws) => {
      ws.send(JSON.stringify({ status }));
    });
  };

  static removeSubscriber = () => {
    // TODO
  };
}
