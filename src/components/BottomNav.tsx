import { Calendar, RefreshCw } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="メインナビゲーション">
      <NavLink to="/" end className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}>
        <RefreshCw size={22} />
        <span>ルーティン</span>
      </NavLink>
      <NavLink to="/stamps" className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}>
        <Calendar size={22} />
        <span>スタンプカード</span>
      </NavLink>
    </nav>
  );
}
