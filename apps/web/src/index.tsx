import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import TaskList from './pages/task-list';
import Signup from './pages/signup';

const domNode = document.getElementById('root');
const root = createRoot(domNode!);

root.render(
  <BrowserRouter>
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
      <Route path="todos/:id" element={<TaskList />} />
    </Routes>
  </BrowserRouter>
);
