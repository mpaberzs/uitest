import { createContext, useState } from 'react';
import { BrowserRouter } from 'react-router';
import TodoitiRoutes from './routes';
import { NotificationsProvider } from '@toolpad/core/useNotifications';
import { DialogsProvider } from '@toolpad/core/useDialogs';

type AppUser = { id: string; firstName: string; lastName: string; email: string } | null;

export const UserContext = createContext<{
  user: AppUser;
  setUser: (user: AppUser) => void;
}>({
  user: null,
  setUser: (_: AppUser) => _,
});

const App = () => {
  const [user, setUser] = useState<AppUser>(null);
  return (
    <NotificationsProvider>
      <DialogsProvider>
        <UserContext.Provider value={{ user, setUser }}>
          <BrowserRouter>
            <TodoitiRoutes />
          </BrowserRouter>
        </UserContext.Provider>
      </DialogsProvider>
    </NotificationsProvider>
  );
};

export default App;
