import { createContext, useState } from 'react';
import { BrowserRouter } from 'react-router';
import TodoitiRoutes from './routes';

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
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <TodoitiRoutes />
      </BrowserRouter>
    </UserContext.Provider>
  );
};

export default App;
