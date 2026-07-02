import React, { useState } from 'react';
import { Activity, LogOut, User, History, Bell, Settings, Droplets, Edit2, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type DashboardTab = 'overview' | 'profile' | 'history' | 'requests' | 'settings';

export const DonorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const displayName = user?.firstName || user?.name || (user?.email ? user.email.split('@')[0] : 'Donor');
  const bloodType = user?.bloodType || 'O+';
  const location = [user?.city, user?.state].filter(Boolean).join(', ') || 'Not provided';
  const status = 'Active';
  const donations = 3;
  const lastDonation = '2024-06-15';
  const nextEligible = '2024-09-15';

  const tabs = [
    { key: 'overview', label: 'Dashboard', icon: Activity },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'history', label: 'History', icon: History },
    { key: 'requests', label: 'Requests', icon: Bell },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1.25rem' }}>
      <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6', padding: '1.25rem' }}>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Registration Status</p>
        <strong style={{ fontSize: '1.1rem' }}>{status}</strong>
      </div>
      <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6', padding: '1.25rem' }}>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Blood Type</p>
        <strong style={{ fontSize: '1.1rem' }}>{bloodType}</strong>
      </div>
      <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6', padding: '1.25rem' }}>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Total Donations</p>
        <strong style={{ fontSize: '1.1rem' }}>{donations}</strong>
      </div>
      <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6', padding: '1.25rem' }}>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Next Eligible</p>
        <strong style={{ fontSize: '1.1rem' }}>{new Date(nextEligible).toLocaleDateString()}</strong>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Personal Information</h3>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            style={{ background: '#f7f7f7', border: '1px solid #e6e6e6', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Edit2 size={16} /> {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <p style={{ margin: '0 0 0.3rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Full Name</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{displayName}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.3rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Email</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{user?.email}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.3rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Phone</p>
            <p style={{ margin: 0, fontWeight: 500 }}>Not provided</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.3rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Blood Type</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{bloodType}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.3rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Location</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{location}</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.3rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Last Donation</p>
            <p style={{ margin: 0, fontWeight: 500 }}>{new Date(lastDonation).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6' }}>
        <h3 style={{ margin: '0 0 1.5rem' }}>Quick Stats</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#f7f7f7', padding: '1rem', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 0.3rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Total Lives Helped</p>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{donations * 3}</p>
          </div>
          <div style={{ background: '#f7f7f7', padding: '1rem', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 0.3rem', color: 'var(--text-300)', fontSize: '0.85rem' }}>Member Since</p>
            <p style={{ margin: 0, fontWeight: 500 }}>2024</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6' }}>
      <h3 style={{ margin: '0 0 1.5rem' }}>Donation History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[
          { date: '2024-06-15', hospital: 'City Blood Bank', status: 'Completed' },
          { date: '2024-03-10', hospital: 'Red Cross Center', status: 'Completed' },
          { date: '2023-12-05', hospital: 'Central Hospital', status: 'Completed' },
        ].map((donation) => (
          <div key={donation.date} style={{ border: '1px solid #e6e6e6', padding: '1rem', borderRadius: '10px', background: '#f7f7f7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 0.3rem', fontWeight: 500 }}>{donation.hospital}</p>
                <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.9rem' }}>{new Date(donation.date).toLocaleDateString()}</p>
              </div>
              <span style={{ background: '#111111', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>{donation.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6' }}>
      <h3 style={{ margin: '0 0 1.5rem' }}>Blood Donation Requests</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ border: '1px solid #e6e6e6', padding: '1.25rem', borderRadius: '10px', background: '#f7f7f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <p style={{ margin: '0 0 0.3rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplets size={16} /> Urgent: O+ Blood Needed
              </p>
              <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.9rem' }}>Central Hospital - 2 units needed</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button style={{ flex: 1, padding: '0.6rem', background: '#111111', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Accept</button>
            <button style={{ flex: 1, padding: '0.6rem', background: '#fff', color: '#111111', border: '1px solid #e6e6e6', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Decline</button>
          </div>
        </div>
        <p style={{ color: 'var(--text-300)', textAlign: 'center', padding: '1.5rem 0' }}>No other active requests at the moment.</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6' }}>
        <h3 style={{ margin: '0 0 1.5rem' }}>Account Settings</h3>
        <button
          type="button"
          onClick={() => setShowChangePassword(!showChangePassword)}
          style={{ width: '100%', padding: '0.75rem 1rem', background: '#f7f7f7', border: '1px solid #e6e6e6', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}
        >
          <Lock size={18} /> Change Password
        </button>

        {showChangePassword && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e6e6e6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Current Password</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>New Password</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Confirm New Password</label>
              <input type="password" placeholder="••••••••" style={{ width: '100%' }} />
            </div>
            <button style={{ padding: '0.75rem', background: '#111111', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Update Password</button>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6' }}>
        <h3 style={{ margin: '0 0 1rem' }}>Notification Preferences</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" defaultChecked id="phone-notif" />
            <label htmlFor="phone-notif" style={{ cursor: 'pointer' }}>Receive phone call notifications</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" defaultChecked id="sms-notif" />
            <label htmlFor="sms-notif" style={{ cursor: 'pointer' }}>Receive SMS notifications</label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input type="checkbox" id="email-notif" />
            <label htmlFor="email-notif" style={{ cursor: 'pointer' }}>Receive email notifications</label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', background: '#fff', border: '1px solid #e6e6e6', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f2f2ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} color="#111111" />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.9rem' }}>Donor Dashboard</p>
              <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.5rem' }}>Welcome, {displayName}</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void logout()}
            style={{ border: '1px solid #d9d9d9', background: '#fff', color: '#111111', padding: '0.7rem 1rem', borderRadius: '999px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as DashboardTab)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #e6e6e6',
                  background: activeTab === tab.key ? '#111111' : '#fff',
                  color: activeTab === tab.key ? 'white' : '#111111',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'requests' && renderRequests()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};
