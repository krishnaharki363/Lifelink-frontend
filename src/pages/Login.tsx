import React, { useState } from 'react';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type AuthMode = 'login' | 'register';

const getErrorMessage = (error: any) => {
  const data = error?.response?.data;
  const validationErrors = Array.isArray(data?.errors)
    ? data.errors.map((item: any) => item?.message || item?.msg || item?.field).filter(Boolean)
    : [];
  const message = data?.message || data?.error || data?.detail;

  if (validationErrors.length > 0) {
    return validationErrors.join(' • ');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (error?.response?.status === 401) {
    return 'Invalid email or password. Please try again.';
  }

  return 'Unable to complete the request. Please try again.';
};

const redirectByRole = (user: any) => {
  if (user?.role === 'ADMIN') {
    window.location.href = '/admin';
  } else if (user?.role === 'HOSPITAL') {
    window.location.href = '/hospital';
  } else if (user?.role === 'DONOR') {
    window.location.href = '/donor';
  } else {
    window.location.href = '/';
  }
};

export const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('DONOR');
  const [bloodType, setBloodType] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

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
        : {
            firstName,
            lastName,
            email,
            password,
            role,
            bloodType,
            dateOfBirth,
            phone,
            city,
            state,
          };

      const response = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
      const data = response.data?.data ?? response.data;

      if (mode === 'login') {
        const { accessToken, user } = data;
        login(accessToken, user);
        redirectByRole(user);
        return;
      }

      if (data?.accessToken && data?.user) {
        login(data.accessToken, data.user);
        redirectByRole(data.user);
      } else {
        setSuccess('Registration was successful. Please sign in with your new credentials.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '1rem', background: '#f5f5f3' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', background: '#fff', border: '1px solid #e6e6e6', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Activity size={48} color="#111111" style={{ marginBottom: '1rem' }} />
          <h2 style={{ marginBottom: '0.35rem' }}>Welcome to LifeLink</h2>
          <p style={{ color: 'var(--text-300)' }}>
            {mode === 'login' ? 'Sign in to access your dashboard' : 'Create a new account to get started'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f5f5f3', borderRadius: '999px', padding: '0.25rem' }}>
          <button
            type="button"
            onClick={() => {
              resetMessages();
              setMode('login');
            }}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              borderRadius: '999px',
              border: 'none',
              background: mode === 'login' ? '#111111' : 'transparent',
              color: mode === 'login' ? 'white' : '#111111',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              resetMessages();
              setMode('register');
            }}
            style={{
              flex: 1,
              padding: '0.7rem 1rem',
              borderRadius: '999px',
              border: 'none',
              background: mode === 'register' ? '#111111' : 'transparent',
              color: mode === 'register' ? 'white' : '#111111',
              cursor: 'pointer',
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ background: '#f7f7f7', color: '#111111', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #e6e6e6', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: '#f7f7f7', color: '#111111', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #e6e6e6', fontSize: '0.875rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {mode === 'register' && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label htmlFor="firstName" style={{ fontSize: '0.875rem', fontWeight: 500 }}>First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label htmlFor="lastName" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="role" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Account Type</label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="DONOR">Donor</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="bloodType" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Blood Type</label>
                <select id="bloodType" value={bloodType} onChange={(e) => setBloodType(e.target.value)} required>
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="dateOfBirth" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="phone" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label htmlFor="city" style={{ fontSize: '0.875rem', fontWeight: 500 }}>City</label>
                  <input
                    type="text"
                    id="city"
                    placeholder="Kathmandu"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <label htmlFor="state" style={{ fontSize: '0.875rem', fontWeight: 500 }}>State</label>
                  <input
                    type="text"
                    id="state"
                    placeholder="Bagmati"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', paddingRight: '2.8rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', color: '#111111', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="confirmPassword" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', color: '#111111', padding: 0 }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }} disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
