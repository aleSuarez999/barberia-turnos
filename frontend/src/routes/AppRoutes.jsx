import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import Login from '../pages/Login';
import Booking from '../pages/Booking';
import AdminPanel from '../pages/AdminPanel';
import AdminRoute from './AdminRoute';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login solo para admin y superadmin */}
        <Route path="/login" element={<Login />} />

        {/* Reserva publica por barberia */}
        <Route path="/:shopSlug/turnos" element={<Booking />} />

        {/* Panel admin */}
        <Route element={<AdminRoute><Layout /></AdminRoute>}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
