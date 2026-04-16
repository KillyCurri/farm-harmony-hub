import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';

const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="min-h-screen p-4 pt-20 md:p-6 md:ml-64 md:pt-6">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
