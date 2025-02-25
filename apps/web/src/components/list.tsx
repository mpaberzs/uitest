import type { Task } from '@todoiti/common';
import { useEffect, useState } from 'react';
import { getTasks } from 'src/lib/api/tasksApi';

const List = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setIsLoading] = useState(true);
  useEffect(() => {
    getTasks()
      .then((tasks) => setTasks(tasks))
      .catch((error) => {
        // TODO: display errors in snackbar/toast
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      {loading ? (
        <div>loading...</div>
      ) : (
        tasks.map((task) => (
          <article>
            <ul>
              <li>{task.name}</li>
              <li>{task.status}</li>
              <li>{task.description}</li>
              <li>{task.created_at}</li>
              <li>{task.updated_at}</li>
              <li>{task.created_by}</li>
            </ul>
          </article>
        ))
      )}
    </div>
  );
};

export default List;
