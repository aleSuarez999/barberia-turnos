import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

// Paso 1: elegir servicio, barbero, fecha y hora
// Paso 2: ingresar nombre, celular y mail → backend verifica si ya existe
//   - Si existe: reserva directa (sin OTP)
//   - Si es nuevo: envía OTP por WhatsApp → paso 3
// Paso 3: ingresar codigo OTP → confirmar reserva

export default function Booking() {
  const { shopSlug } = useParams();

  const [shopId, setShopId] = useState(null);
  const [shopName, setShopName] = useState('');
  const [shopError, setShopError] = useState('');

  const [activities, setActivities] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  // Paso actual
  const [step, setStep] = useState(1);

  // Datos del cliente (paso 2)
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // OTP (paso 3)
  const [otpCode, setOtpCode] = useState('');

  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reservation, setReservation] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().split('T')[0];
  })();

  // Resolver slug → shopId
  useEffect(() => {
    api.get(`/public/shops/slug/${shopSlug}`)
      .then((r) => { setShopId(r.data.shop._id); setShopName(r.data.shop.name); })
      .catch(() => setShopError('Barberia no encontrada'));
  }, [shopSlug]);

  useEffect(() => {
    if (!shopId) return;
    Promise.all([
      api.get(`/public/activities?shop=${shopId}`),
      api.get(`/public/barbers?shop=${shopId}`),
    ]).then(([actResp, barResp]) => {
      setActivities(actResp.data.activities);
      setBarbers(barResp.data.barbers);
      if (actResp.data.activities.length > 0) setSelectedActivity(actResp.data.activities[0]);
      if (barResp.data.barbers.length > 0) setSelectedBarber(barResp.data.barbers[0]);
    }).catch(() => setMsg('Error cargando datos'));
  }, [shopId]);

  useEffect(() => {
    if (!selectedBarber || !date) return;
    const dayOfWeek = new Date(date + 'T00:00:00').getUTCDay();
    if (dayOfWeek === 0) {
      setMsg('Los domingos estamos cerrados.');
      setDate('');
      setSlots([]);
      return;
    }
    setMsg('');
    setSelectedTime('');
    api.get(`/public/slots?barber=${selectedBarber._id}&date=${date}`)
      .then((r) => setSlots(r.data.slots))
      .catch(() => setMsg('Error cargando horarios'));
  }, [selectedBarber, date]);

  // --- Paso 1 → Paso 2 ---
  const goToClientStep = () => {
    if (!selectedActivity || !selectedBarber || !date || !selectedTime) {
      return setMsg('Completa todos los campos antes de continuar');
    }
    setMsg('');
    setStep(2);
  };

  // --- Paso 2: enviar datos → backend decide si necesita OTP ---
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) return setMsg('Nombre y celular son obligatorios');
    setLoading(true);
    setMsg('');
    try {
      const resp = await api.post('/otp/send', {
        phone: clientPhone,
        name: clientName,
        email: clientEmail,
      });
      if (resp.data.clientExists) {
        // Cliente conocido → reservar directamente
        await _doBook({ isNew: false });
      } else {
        // Cliente nuevo → pedir OTP
        setStep(3);
      }
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error enviando codigo');
    } finally {
      setLoading(false);
    }
  };

  // --- Paso 3: verificar OTP y reservar ---
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode) return setMsg('Ingresa el codigo');
    setLoading(true);
    setMsg('');
    try {
      await _doBook({ isNew: true, code: otpCode });
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Codigo incorrecto o expirado');
    } finally {
      setLoading(false);
    }
  };

  const _doBook = async ({ isNew, code }) => {
    const payload = {
      phone: clientPhone,
      shopSlug,
      barberId: selectedBarber._id,
      activityId: selectedActivity._id,
      date,
      time: selectedTime,
      notes,
    };

    const endpoint = isNew ? '/otp/verify-and-book' : '/otp/book';
    if (isNew) payload.code = code;

    const resp = await api.post(endpoint, payload);
    setReservation(resp.data.reservation);
    setSuccess(true);
  };

  // --- Reset para reservar otro turno ---
  const resetForm = () => {
    setStep(1);
    setDate('');
    setSelectedTime('');
    setSlots([]);
    setNotes('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setOtpCode('');
    setMsg('');
    setSuccess(false);
    setReservation(null);
  };

  // --- Pantallas ---

  if (shopError) {
    return <div className="app-card"><p className="error-text">{shopError}</p></div>;
  }

  if (success) {
    return (
      <div className="app-card">
        <h1>{shopName}</h1>
        <p className="subtitle success-confirm">Turno reservado!</p>
        <p className="subtitle">Te enviamos la confirmacion por WhatsApp.</p>
        {reservation && (
          <div className="reservation-summary">
            <p><strong>{reservation.activity?.title}</strong></p>
            <p>Barbero: {reservation.barber?.name}</p>
            <p>Fecha: {reservation.date} a las {reservation.time}</p>
          </div>
        )}
        <button className="btn-confirm" type="button" onClick={resetForm}>
          Reservar otro turno
        </button>
      </div>
    );
  }

  // Paso 1: seleccion de turno
  if (step === 1) {
    return (
      <div className="app-card">
        <h1>{shopName || '...'}</h1>
        <p className="subtitle">Turnos Online</p>

        <div className="section-title">Servicio</div>
        <div className="option-grid">
          {activities.map((a) => (
            <div
              key={a._id}
              className={`card-opt ${selectedActivity?._id === a._id ? 'selected' : ''}`}
              onClick={() => setSelectedActivity(a)}
            >
              <strong>{a.title}</strong>
              {a.description && <><br /><small>{a.description}</small></>}
              <span className="price-tag">${Number(a.price).toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>

        <div className="section-title">Barbero</div>
        <div className="option-grid">
          {barbers.map((b) => (
            <div
              key={b._id}
              className={`card-opt barber-item ${selectedBarber?._id === b._id ? 'selected' : ''}`}
              onClick={() => setSelectedBarber(b)}
            >
              <strong>{b.name}</strong>
              {b.specialties?.length > 0 && <><br /><small>{b.specialties.join(', ')}</small></>}
            </div>
          ))}
        </div>

        <div className="section-title">Dia y Hora</div>
        <input
          type="date"
          className="input-text"
          value={date}
          min={today}
          max={maxDate}
          onChange={(e) => setDate(e.target.value)}
        />
        {slots.length > 0 && (
          <div className="time-grid">
            {slots.map((t) => (
              <div
                key={t}
                className={`time-slot ${selectedTime === t ? 'selected' : ''}`}
                onClick={() => setSelectedTime(t)}
              >
                {t}
              </div>
            ))}
          </div>
        )}
        {date && slots.length === 0 && !msg && (
          <p className="empty-msg">Sin horarios disponibles para este dia.</p>
        )}

        <div className="section-title">Notas (opcional)</div>
        <textarea
          className="input-text"
          placeholder="Alguna aclaracion?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {msg && <p className="error-text">{msg}</p>}
        <button className="btn-confirm" type="button" onClick={goToClientStep}>
          Continuar
        </button>
      </div>
    );
  }

  // Paso 2: datos del cliente
  if (step === 2) {
    return (
      <div className="app-card">
        <h1>{shopName}</h1>
        <p className="subtitle">Tus datos</p>

        <form onSubmit={handleClientSubmit}>
          <div className="section-title">Nombre completo *</div>
          <input
            className="input-text"
            type="text"
            placeholder="Nombre y apellido"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />

          <div className="section-title">Celular *</div>
          <input
            className="input-text"
            type="tel"
            placeholder="Ej: 5491100000000"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            required
          />
          <small className="field-hint">Incluir codigo de pais. Ej: 549 + codigo de area + numero</small>

          <div className="section-title">Email (opcional)</div>
          <input
            className="input-text"
            type="email"
            placeholder="tu@email.com"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />

          {msg && <p className="error-text">{msg}</p>}
          <div className="form-actions-booking">
            <button type="button" className="btn-secondary" onClick={() => { setStep(1); setMsg(''); }}>
              Volver
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Paso 3: codigo OTP (solo clientes nuevos)
  return (
    <div className="app-card">
      <h1>{shopName}</h1>
      <p className="subtitle">Verificacion</p>
      <p className="otp-info">
        Te enviamos un codigo de 6 digitos por WhatsApp al <strong>{clientPhone}</strong>.
        Ingresalo para confirmar tu turno.
      </p>

      <form onSubmit={handleOtpSubmit}>
        <input
          className="input-text input-otp"
          type="text"
          inputMode="numeric"
          placeholder="Codigo de 6 digitos"
          maxLength={6}
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
          required
        />

        {msg && <p className="error-text">{msg}</p>}
        <div className="form-actions-booking">
          <button type="button" className="btn-secondary" onClick={() => { setStep(2); setMsg(''); setOtpCode(''); }}>
            Volver
          </button>
          <button type="submit" className="btn-confirm" disabled={loading}>
            {loading ? 'Confirmando...' : 'Confirmar turno'}
          </button>
        </div>
      </form>
    </div>
  );
}
