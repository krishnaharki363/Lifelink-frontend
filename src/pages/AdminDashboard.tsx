import React, { useEffect, useState } from 'react';
import { Activity, BarChart3, Layers, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const summaryCards = [
  { title: 'Total Donors', value: '1,248', icon: UserPlus },
  { title: 'Pending Verifications', value: '16', icon: ShieldCheck },
  { title: 'Active Hospitals', value: '34', icon: Layers },
  { title: 'Open Requests', value: '22', icon: Activity },
];

const recentActivity = [
  { title: 'New donor verified', description: 'Ramesh K. was approved as a donor.', time: '2 hours ago' },
  { title: 'Hospital profile updated', description: 'City Clinic updated their contact details.', time: '6 hours ago' },
  { title: 'Request assigned', description: '3 units of O+ were assigned to Kathmandu General.', time: '1 day ago' },
];

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState('Admin');

  useEffect(() => {
    setDisplayName(user?.firstName || user?.name || 'Admin');
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-100)', padding: '2rem 1rem' }}>
      <div className="container">
        <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 20, background: '#f2f2ef', display: 'grid', placeItems: 'center' }}>
              <BarChart3 size={28} />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Admin dashboard</p>
              <h1 style={{ margin: '0.35rem 0 0', fontSize: '2rem' }}>Welcome back, {displayName}</h1>
            </div>
          </div>
          <button type="button" className="btn-primary" style={{ padding: '0.9rem 1.3rem' }} onClick={() => void logout()}>
            Logout
          </button>
        </header>

        <section className="glass-panel" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.95rem' }}>Overview</p>
              <h2 style={{ margin: '0.5rem 0 0' }}>Platform health at a glance</h2>
            </div>
            <button type="button" className="btn-secondary" style={{ padding: '0.85rem 1.2rem', borderRadius: 18, background: '#fff', border: '1px solid var(--glass-border)' }}>
              Review all alerts
            </button>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(17, 17, 17, 0.06)', display: 'grid', placeItems: 'center' }}>
                    <Icon size={20} />
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-300)' }}>{card.title}</p>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{card.value}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0 }}>Recent activity</h2>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--text-300)' }}>Latest platform events and actions.</p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-300)' }}>
                <ShieldCheck size={18} /> Security updates
              </div>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {recentActivity.map((activity) => (
                <div key={activity.title} style={{ padding: '1rem', borderRadius: 16, background: '#f7f7f7' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{activity.title}</p>
                  <p style={{ margin: '0.5rem 0 0', color: 'var(--text-300)' }}>{activity.description}</p>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: 'var(--text-300)' }}>{activity.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Quick actions</h2>
            <div style={{ display: 'grid', gap: '0.85rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn-secondary">Manage donors</button>
              <button type="button" className="btn-secondary">Review verifications</button>
              <button type="button" className="btn-secondary">Hospital operations</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
