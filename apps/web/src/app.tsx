import type { Task } from '@todoiti/common';

const App = () => {
  const task: Task = { name: 'TODO' };

  return <div>{task.name}</div>;
};

export default App;
