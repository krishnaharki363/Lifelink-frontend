import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type AuthMode = 'login' | 'register';

const getErrorMessage = (error: unknown): string => {
  const err = error as { response?: { data?: { errors?: { message?: string; msg?: string }[]; message?: string; error?: string; detail?: string }; status?: number } };
  const data = err?.response?.data;
  const validationErrors = Array.isArray(data?.errors)
    ? data!.errors!.map((item) => item?.message || item?.msg).filter(Boolean)
    : [];
  if (validationErrors.length > 0) return validationErrors.join(' • ');
  const message = data?.message || data?.error || data?.detail;
  if (typeof message === 'string' && message.trim()) return message;
  if (err?.response?.status === 401) return 'Invalid email or password. Please try again.';
  return 'Unable to complete the request. Please try again.';
};

const redirectByRole = (user: { role?: string }) => {
  const routes: Record<string, string> = { ADMIN: '/admin', HOSPITAL: '/hospital', DONOR: '/donor' };
  window.location.href = routes[user?.role ?? ''] ?? '/';
};

export const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]           = useState('DONOR');
  const [bloodType, setBloodType] = useState('');
  const [phone, setPhone]         = useState('');
  const [city, setCity]           = useState('');
  const [state, setState]         = useState('');
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const { login } = useAuth();

  const resetMessages = () => { setError(''); setSuccess(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = mode === 'login'
        ? { email, password }
        : { firstName, lastName, email, password, role, bloodType, phone, city, state };
      const response = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
      const data = response.data?.data ?? response.data;
      if (mode === 'login') {
        login(data.accessToken, data.user);
        redirectByRole(data.user);
        return;
      }
      if (data?.accessToken && data?.user) {
        login(data.accessToken, data.user);
        redirectByRole(data.user);
      } else {
        setSuccess('Account created! Please sign in.');
        setMode('login');
        setPassword(''); setConfirmPassword('');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-page)' }}>
      {/* Left panel — branding */}
      <div style={{
        flex: '0 0 460px', display: 'none',
        background: 'linear-gradient(160deg, var(--red-800) 0%, var(--red-600) 55%, var(--red-500) 100%)',
        padding: '3rem', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
      }} className="login-panel">
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>
            <Droplets size={24} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>LifeLink</span>
        </Link>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
            {[
              { n: '12,400+', l: 'Registered Donors' },
              { n: '87',      l: 'Partner Hospitals' },
              { n: '4,200+',  l: 'Lives Saved' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.n}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.8 }}>
            "LifeLink cut our blood sourcing time from 6 hours to under 45 minutes."
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.5rem' }}>— Dr. Priya Sharma, Kathmandu General</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-up">
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'var(--red-600)', display: 'grid', placeItems: 'center' }}>
              <Droplets size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--gray-900)' }}>
              Life<span style={{ color: 'var(--red-600)' }}>Link</span>
            </span>
          </div>

          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            {mode === 'login'
              ? 'Sign in to access your dashboard.'
              : 'Join LifeLink and help save lives.'}
          </p>

          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'var(--gray-100)', borderRadius: 'var(--radius-full)', padding: '4px', marginBottom: '1.75rem' }}>
            {(['login', 'register'] as AuthMode[]).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { resetMessages(); setMode(m); }}
                style={{
                  flex: 1, padding: '0.6rem 1rem',
                  borderRadius: 'var(--radius-full)', border: 'none',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? 'var(--gray-900)' : 'var(--gray-500)',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--t-fast)',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'register' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-input" type="text" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-input" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="DONOR">Donor</option>
                    <option value="HOSPITAL">Hospital</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {role === 'DONOR' && (
                  <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <select className="form-select" value={bloodType} onChange={e => setBloodType(e.target.value)} required>
                      <option value="">Select blood type</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" type="text" placeholder="Kathmandu" value={city} onChange={e => setCity(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State / Province</label>
                    <input className="form-input" type="text" placeholder="Bagmati" value={state} onChange={e => setState(e.target.value)} required />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '2.8rem' }} />
                <button type="button" onClick={() => setShowPassword(p => !p)} aria-label="Toggle password" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--gray-400)', padding: 0, cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ paddingRight: '2.8rem' }} />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} aria-label="Toggle confirm password" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--gray-400)', padding: 0, cursor: 'pointer' }}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', fontSize: '0.95rem', justifyContent: 'center' }} disabled={isSubmitting}>
              {isSubmitting ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Please wait...</> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button type="button" onClick={() => { resetMessages(); setMode(mode === 'login' ? 'register' : 'login'); }} style={{ color: 'var(--red-600)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--gray-400)', fontSize: '0.82rem' }}>
              <ArrowLeft size={14} /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
