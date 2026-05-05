import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthProvider';

export default function ShopList() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, userType, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userType === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    api.get('/public/shops')
      .then((r) => setShops(r.data.shops))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userType, navigate]);

  const selectShop = (shopId) => {
    if (!token) {
      navigate('/login', { state: { next: `/reservar/${shopId}` } });
    } else {
      navigate(`/reservar/${shopId}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="shop-list-page">
      <header className="shop-list-header">
        <div className="header-brand">BARBER TURNOS</div>
        <nav className="header-nav">
          {token ? (
            <>
              <Link to="/mis-turnos">Mis Turnos</Link>
              <button type="button" className="logout-button" onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <>
              <Link to="/login">Ingresar</Link>
              <Link to="/register" className="btn-register-sm">Registrarse</Link>
            </>
          )}
        </nav>
      </header>

      <main className="shop-list-content">
        <h2>Elegí tu barbería</h2>
        <p className="shop-list-subtitle">Seleccioná una barbería para ver disponibilidad y reservar tu turno</p>

        {loading ? (
          <p className="empty-msg">Cargando...</p>
        ) : shops.length === 0 ? (
          <p className="empty-msg">No hay barberías disponibles.</p>
        ) : (
          <div className="shop-grid">
            {shops.map((s) => (
              <div key={s._id} className="shop-card">
                <h3>{s.name}</h3>
                {s.address && <p className="shop-address">📍 {s.address}</p>}
                {s.phone && <p className="shop-phone">📞 {s.phone}</p>}
                <button
                  type="button"
                  className="btn-confirm"
                  onClick={() => selectShop(s._id)}
                >
                  Reservar Turno
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
