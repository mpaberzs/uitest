import { Route, Routes } from 'react-router';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Task from './pages/task-list';
import Signup from './pages/signup';
import AuthRoute from './auth-route';
import ProtectedRoute from './protected-route';

const TodoitiRoutes = () => (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route index element={<Dashboard />} />
      <Route path="tasks/:id" element={<Task />} />
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
    </Route>

    <Route element={<AuthRoute />}>
    </Route>

    {/*TODO: proper error pages*/}
    <Route path="error" element={<div>Something went wrong</div>} />
    <Route path="*" element={<div>Not Found</div>} />
  </Routes>
);

export default TodoitiRoutes;
