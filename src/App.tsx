import { Outlet } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';

export function App() {
  return (
    <div className="app">
      <main className="app__main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
