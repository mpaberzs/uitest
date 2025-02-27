import { createRoot } from 'react-dom/client';
import TodoitiRoutes from './routes';
import { BrowserRouter } from 'react-router';

const domNode = document.getElementById('root');
const root = createRoot(domNode!);

root.render(
  <BrowserRouter>
    <TodoitiRoutes />
  </BrowserRouter>
);
