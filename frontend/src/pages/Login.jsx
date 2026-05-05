import { useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthProvider';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { shopSlug } = useParams();
  const { setToken, setUserType, setRole } = useAuth();

  const successMsg = location.state?.msg || '';
  const next = location.state?.next || (shopSlug ? `/${shopSlug}/turnos` : '/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const resp = await api.post('/auth/login', { username, password });
      setToken(resp.data.token);
      setUserType(resp.data.userType);
      setRole(resp.data.role || '');
      navigate(resp.data.userType === 'admin' ? '/admin' : next, { replace: true });
    } catch {
      setError('Credenciales invalidas');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>BARBER TURNOS</h2>
        {successMsg && <p className="success-text">{successMsg}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Contrasena" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Ingresar</button>
          {error && <p className="error-text">{error}</p>}
        </form>
        {shopSlug && (
          <p className="login-link">No tenes cuenta? <Link to={`/${shopSlug}/register`} state={{ next }}>Registrate</Link></p>
        )}
      </div>
    </div>
  );
}
