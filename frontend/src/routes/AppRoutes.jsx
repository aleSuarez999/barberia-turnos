import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Booking from '../pages/Booking';
import MisTurnos from '../pages/MisTurnos';
import AdminPanel from '../pages/AdminPanel';
import AdminRoute from './AdminRoute';
import PrivateRoute from './PrivateRoute';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login admin */}
        <Route path="/login" element={<Login />} />

        {/* Area de clientes por barberia */}
        <Route path="/:shopSlug">
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
          <Route path="turnos" element={<Booking />} />

          {/* Mis turnos: requiere JWT de cliente */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="mis-turnos" element={<MisTurnos />} />
          </Route>
        </Route>

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
