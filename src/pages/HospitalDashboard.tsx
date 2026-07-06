import React, { useEffect, useState } from 'react';
import { Activity, Droplets, HeartPulse, ShieldCheck, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const inventory = [
  { bloodType: 'A+', units: 18 },
  { bloodType: 'B+', units: 12 },
  { bloodType: 'O+', units: 24 },
  { bloodType: 'AB+', units: 8 },
];

const pendingRequests = [
  { patient: 'Sita M.', bloodType: 'O+', units: 2, status: 'Urgent' },
  { patient: 'Ram P.', bloodType: 'B+', units: 1, status: 'Requested' },
];

export const HospitalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState('Hospital');

  useEffect(() => {
    setDisplayName(user?.firstName || user?.name || 'Hospital');
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-100)', padding: '2rem 1rem' }}>
      <div className="container">
        <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 20, background: '#f2f2ef', display: 'grid', placeItems: 'center' }}>
              <Droplets size={28} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Hospital dashboard</p>
              <h1 style={{ margin: '0.35rem 0 0', fontSize: '2rem' }}>{displayName}</h1>
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ padding: '0.9rem 1.3rem' }} onClick={() => void logout()}>
            Logout
          </button>
        </header>

        <section className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.95rem' }}>Operational overview</p>
              <h2 style={{ margin: '0.5rem 0 0' }}>Keep your blood inventory healthy</h2>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.1rem', borderRadius: 18, background: '#f7f7f7', border: '1px solid var(--glass-border)' }}>
              <HeartPulse size={18} /> Live request feed
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <ShieldCheck size={20} />
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Preparedness</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>95%</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <ClipboardList size={20} />
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Current requests</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{pendingRequests.length}</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <Activity size={20} />
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Donor matches</p>
            </div>
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>4 active</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.9fr', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0 }}>Blood inventory</h2>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-300)' }}>Monitor units available by group.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem' }}>
              {inventory.map((item) => (
                <div key={item.bloodType} style={{ padding: '1rem', borderRadius: 18, background: '#f7f7f7' }}>
                  <p style={{ margin: 0, color: 'var(--text-300)' }}>{item.bloodType}</p>
                  <p style={{ margin: '0.75rem 0 0', fontSize: '1.45rem', fontWeight: 700 }}>{item.units}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0 }}>Pending requests</h2>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-300)' }}>Requests needing hospital action.</p>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {pendingRequests.map((request) => (
                <div key={request.patient} style={{ padding: '1rem', borderRadius: 16, background: '#f7f7f7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{request.patient}</p>
                    <span style={{ color: request.status === 'Urgent' ? '#b23e3e' : '#111111', fontWeight: 700 }}>{request.status}</span>
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-300)' }}>{request.bloodType} • {request.units} unit(s)</p>
                  <p style={{ margin: '0.6rem 0 0', color: 'var(--text-300)', fontSize: '0.9rem' }}>{request.status === 'Urgent' ? 'Immediate attention required' : 'Standard request'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0 }}>Action center</h2>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-300)' }}>Manage requests and inventory from one place.</p>
            </div>
            <button type="button" className="btn-secondary">Create new request</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary">Update inventory</button>
            <button type="button" className="btn-secondary">Contact donors</button>
            <button type="button" className="btn-secondary">View hospital stats</button>
          </div>
        </div>
      </div>
    </div>
  );
};
