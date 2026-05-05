import { useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shopSlug } = useParams();
  const next = location.state?.next || `/${shopSlug}/turnos`;
  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register-client', form);
      navigate(`/${shopSlug}/login`, { state: { msg: 'Cuenta creada. Ingresa con tus datos.', next } });
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Crear Cuenta</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Nombre completo *" value={form.name} onChange={handleChange} required />
          <input name="username" placeholder="Usuario *" value={form.username} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Contrasena *" value={form.password} onChange={handleChange} required />
          <input name="phone" placeholder="Telefono" value={form.phone} onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Registrarse'}</button>
          {error && <p className="error-text">{error}</p>}
        </form>
        <p className="login-link">Ya tenes cuenta? <Link to={`/${shopSlug}/login`} state={{ next }}>Ingresar</Link></p>
      </div>
    </div>
  );
}
