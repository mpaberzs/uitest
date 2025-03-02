import { Route, Routes } from 'react-router';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Task from './pages/task';
import Signup from './pages/signup';
import ProtectedRoute from './protected-route';
import AcceptInvite from './pages/accept-invite';
import AuthRoute from './auth-route';
import ErrorPage from './pages/error';

const TodoitiRoutes = () => (
  <Routes>
    <Route element={<AuthRoute />}>
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<Signup />} />
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route index element={<Dashboard />} />
      <Route path="tasks/:id" element={<Task />} />
      <Route path="accept-invite/:hash" element={<AcceptInvite />} />
    </Route>

    <Route path="error" element={<ErrorPage />} />
    {/*FIXME: proper not found page*/}
    <Route path="*" element={<div>Not Found</div>} />
  </Routes>
);

export default TodoitiRoutes;
