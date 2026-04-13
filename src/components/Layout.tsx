import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export default function Layout() {
  const { role, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    ...(role === 'user' ? [{ path: '/new', icon: PlusCircle, label: 'Pedir' }] : []),
    ...(role === 'admin' ? [{ path: '/admin', icon: ShieldCheck, label: 'Admin' }] : []),
    { path: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md pt-safe">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight text-indigo-600">Carol Finance</h1>
          <button 
            onClick={() => signOut()}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 active:scale-95 transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-lg p-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white/90 pb-safe backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-colors",
                  isActive ? "text-indigo-600" : "text-slate-400"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
