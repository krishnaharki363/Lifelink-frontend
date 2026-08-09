import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Clock, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';

export const PendingVerification: React.FC = () => {
  const { user, logout } = useAuth();
  const rejected = user?.verificationStatus === 'REJECTED';

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-page)', padding: '1.5rem' }}>
      <div className="card" style={{ maxWidth: 520, textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 1.25rem', background: rejected ? 'var(--gray-100)' : 'var(--warning-bg)', display: 'grid', placeItems: 'center' }}>
          {rejected ? <Building2 size={28} color="var(--gray-500)" /> : <Clock size={28} color="var(--warning)" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Droplets size={20} color="var(--red-600)" />
          <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Life<span style={{ color: 'var(--red-600)' }}>Link</span></strong>
        </div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>{rejected ? 'Verification was not approved' : 'Verification is in progress'}</h1>
        <p style={{ color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {rejected
            ? 'Your organization account could not be approved. Please contact the LifeLink administrator for next steps.'
            : 'Your organization account was created successfully. An administrator must verify your license before you can manage requests, inventory, or appointments.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-secondary">Back to home</Link>
          <button className="btn btn-primary" onClick={() => void logout()}>Sign out</button>
        </div>
      </div>
    </div>
  );
};
