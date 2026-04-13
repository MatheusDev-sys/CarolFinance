import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NewRequest from './pages/NewRequest';
import Settings from './pages/Settings';

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* User Routes */}
        <Route path="/" element={role === 'admin' ? <Navigate to="/admin" replace /> : <Dashboard />} />
        <Route path="/new" element={role === 'user' ? <NewRequest /> : <Navigate to="/" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
        
        {/* Shared Routes */}
        <Route path="/settings" element={<Settings />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/CarolFinance">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
