import { createContext, useState } from 'react';

type AppUser = { id: string; firstName: string; lastName: string; email: string };

export const UserContext = createContext<{ user?: AppUser; setUser: (user: AppUser) => void }>({
  setUser: (_: AppUser) => {},
});

export const UserProvider = () => {
  const [user, setUser] = useState<AppUser>();

  return <UserContext.Provider value={{ user, setUser }}></UserContext.Provider>;
};
