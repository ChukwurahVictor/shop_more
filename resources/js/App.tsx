import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
      <ToastProvider>
          <AuthProvider>
              <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Dashboard />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </AuthProvider>
      </ToastProvider>
  );
}
