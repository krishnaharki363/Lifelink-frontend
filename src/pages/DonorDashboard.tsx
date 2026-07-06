
import React, { useEffect, useState } from 'react';
import { Activity, Bell, Droplets, Edit2, History, Lock, LogOut, Settings, User, Heart, Calendar, MapPin, ClipboardCheck, ArrowRight, Check, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type DashboardTab = 'profile' | 'history' | 'requests' | 'settings' | 'register-donation';

type DonationRecord = {
  date: string;
  hospital: string;
  location: string;
  status: string;
};

type RequestRecord = {
  title: string;
  location: string;
  date: string;
  status: string;
};

type DonorProfile = {
  fullName: string;
  email: string;
  phone: string;
  bloodGroup: string;
  dateOfBirth: string;
  province: string;
  district: string;
  municipality: string;
  address: string;
  status: string;
  availability: string;
  preferredContactMethod: string;
  weight: string;
  donatedBefore: string;
  currentlyHealthy: string;
  onMedication: string;
  medicalConditions: string;
};

const PREDEFINED_BRANCHES = [
  {
    name: 'Itori Branch',
    address: 'Kuta expressway, Ogun state',
    state: 'Ogun',
    map: 'https://maps.google.com/?q=Kuta+expressway,+Ogun+state'
  },
  {
    name: 'Lagos Island Blood Bank',
    address: 'Broad Street, Lagos Island',
    state: 'Lagos',
    map: 'https://maps.google.com/?q=Broad+Street,+Lagos'
  },
  {
    name: 'Kathmandu Central Blood Bank',
    address: 'Red Cross Marg, Kalimati, Kathmandu',
    state: 'Bagmati',
    map: 'https://maps.google.com/?q=Kalimati,+Kathmandu'
  },
  {
    name: 'Pokhara Regional Donor Unit',
    address: 'Siddhartha Highway, Pokhara',
    state: 'Gandaki',
    map: 'https://maps.google.com/?q=Siddhartha+Highway,+Pokhara'
  }
];

export const DonorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [availabilityStatus, setAvailabilityStatus] = useState('Available');
  const [profile, setProfile] = useState<DonorProfile>({
    fullName: 'Donor',
    email: '',
    phone: '',
    bloodGroup: 'O+',
    dateOfBirth: '1990-01-01',
    province: '',
    district: '',
    municipality: '',
    address: '',
    status: 'Pending Verification',
    availability: 'Available',
    preferredContactMethod: 'Phone Call',
    weight: '',
    donatedBefore: 'No',
    currentlyHealthy: 'Yes',
    onMedication: 'No',
    medicalConditions: '',
  });

  const [donationHistory, setDonationHistory] = useState<DonationRecord[]>([
    { date: '2024-06-15', hospital: 'City Blood Bank', location: 'Kathmandu', status: 'Completed' },
    { date: '2024-03-10', hospital: 'Red Cross Center', location: 'Pokhara', status: 'Completed' },
  ]);

  const [donationRequests, setDonationRequests] = useState<RequestRecord[]>([
    { title: 'O+ urgent request', location: 'Central Hospital', date: '2025-06-25', status: 'Pending' },
    { title: 'A- donation needed', location: 'City Clinic', date: '2025-05-18', status: 'Completed' },
  ]);

  // States for Blood Donation Registration Form (inspired by image)
  const [regBranchName, setRegBranchName] = useState('Itori Branch');
  const [regAddress, setRegAddress] = useState('Kuta expressway, Ogun state');
  const [regMap, setRegMap] = useState('https://maps.google.com/?q=Kuta+expressway,+Ogun+state');
  const [regState, setRegState] = useState('Ogun');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDate, setRegDate] = useState('');
  const [regTime, setRegTime] = useState('09:00');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [formError, setFormError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration Success details state
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [lastRegId, setLastRegId] = useState('');

  useEffect(() => {
    const displayName = user?.firstName || user?.name || (user?.email ? user.email.split('@')[0] : 'Donor');
    const uName = user?.username || (user?.email ? user.email.split('@')[0] : 'donor123');
    setProfile((prev) => ({
      ...prev,
      fullName: displayName,
      email: user?.email ?? prev.email,
      bloodGroup: user?.bloodType ?? prev.bloodGroup,
      province: user?.state ?? prev.province,
      district: user?.city ?? prev.district,
    }));

    // Prefill registration fields
    setRegEmail(user?.email || '');
    setRegPhone(user?.phone || '08031234567');
    setRegUsername(uName);
    
    // Set default donation date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRegDate(tomorrow.toISOString().split('T')[0]);
  }, [user]);

  const requestCount = donationRequests.length;
  const pastDonations = donationHistory.length;
  const nextEligible = donationHistory.length ? new Date(donationHistory[0].date).toLocaleDateString() : '—';

  const handleProfileSave = () => {
    setMessage({ type: 'success', text: 'Profile changes saved successfully.' });
    setIsEditing(false);
  };

  const handleAvailabilityUpdate = (status: string) => {
    setAvailabilityStatus(status);
    setProfile((prev) => ({ ...prev, availability: status }));
    setMessage({ type: 'success', text: `Availability updated to ${status}.` });
  };

  const handlePasswordChange = () => {
    setMessage({ type: 'success', text: 'Password update request submitted.' });
    setShowChangePassword(false);
  };

  const renderQuickButtons = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
      <button onClick={() => setActiveTab('profile')} type="button" className="dash-action-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <User size={20} />
          <div>
            <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.92rem' }}>My Profile</p>
            <strong style={{ fontSize: '1.1rem' }}>View details</strong>
          </div>
        </div>
      </button>
      <button onClick={() => setActiveTab('history')} type="button" className="dash-action-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History size={20} />
          <div>
            <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.92rem' }}>Donation History</p>
            <strong style={{ fontSize: '1.1rem' }}>{pastDonations} past donations</strong>
          </div>
        </div>
      </button>
      <button onClick={() => setActiveTab('requests')} type="button" className="dash-action-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Bell size={20} />
          <div>
            <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.92rem' }}>Donation Requests</p>
            <strong style={{ fontSize: '1.1rem' }}>{requestCount} requests</strong>
          </div>
        </div>
      </button>
    </div>
  );

  const renderProfile = () => (
    <div>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.95rem' }}>Profile snapshot</p>
            <h2 style={{ margin: '0.5rem 0 0' }}>Your donor profile</h2>
          </div>
          <button type="button" onClick={() => setIsEditing((prev) => !prev)} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit2 size={16} /> {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div>
            <label>Full Name</label>
            <input type="text" value={profile.fullName} disabled />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={profile.email} disabled />
          </div>
          <div>
            <label>Phone</label>
            <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditing} />
          </div>
          <div>
            <label>Blood Group</label>
            <input type="text" value={profile.bloodGroup} disabled />
          </div>
          <div>
            <label>Location</label>
            <input type="text" value={`${profile.municipality || ''} ${profile.district ? `, ${profile.district}` : ''}`} disabled />
          </div>
          <div>
            <label>Availability</label>
            <input type="text" value={profile.availability} disabled />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <textarea value={profile.address} disabled={!isEditing} style={{ minHeight: '90px' }} />
          </div>
        </div>

        {isEditing && (
          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleProfileSave} className="btn-primary">Save profile</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem' }}>Donation history</h2>
            <p style={{ margin: 0, color: 'var(--text-300)' }}>Track your blood donations and eligibility.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', width: '100%' }}>
            <div className="dashboard-card" style={{ padding: '1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Donations</p>
              <strong style={{ display: 'block', marginTop: '0.5rem', fontSize: '1.5rem' }}>{pastDonations}</strong>
            </div>
            <div className="dashboard-card" style={{ padding: '1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Requests</p>
              <strong style={{ display: 'block', marginTop: '0.5rem', fontSize: '1.5rem' }}>{requestCount}</strong>
            </div>
            <div className="dashboard-card" style={{ padding: '1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Next eligible</p>
              <strong style={{ display: 'block', marginTop: '0.5rem', fontSize: '1.5rem' }}>{nextEligible}</strong>
            </div>
          </div>
        </div>

        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {donationHistory.map((item) => (
            <div key={item.date} className="dashboard-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, color: 'var(--text-300)' }}>{new Date(item.date).toLocaleDateString()}</p>
                <span style={{ color: item.status === 'Completed' ? '#0b6623' : '#b23e3e', fontWeight: 600 }}>{item.status}</span>
              </div>
              <h3 style={{ margin: '0 0 0.35rem' }}>{item.hospital}</h3>
              <p style={{ margin: 0, color: 'var(--text-300)' }}>{item.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem' }}>Donation requests</h2>
            <p style={{ margin: 0, color: 'var(--text-300)' }}>Review your request activity and status.</p>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '14px', border: '1px solid var(--glass-border)', background: '#f7f7f7' }}>
            <Bell size={18} />
            <span>{requestCount} requests made</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
          {donationRequests.map((request) => (
            <div key={request.date + request.title} className="dashboard-card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{request.title}</p>
                <span style={{ color: request.status === 'Completed' ? '#0b6623' : '#d97706', fontWeight: 700 }}>{request.status}</span>
              </div>
              <p style={{ margin: 0, color: 'var(--text-300)' }}>{request.location}</p>
              <p style={{ margin: '0.75rem 0 0', color: 'var(--text-300)', fontSize: '0.9rem' }}>{new Date(request.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="card-grid" style={{ gridTemplateColumns: '1.25fr 0.75fr', gap: '1rem' }}>
      <div className="dashboard-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem' }}>Settings</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <button type="button" onClick={() => setShowChangePassword((prev) => !prev)} className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lock size={18} /> Change Password
          </button>
          {showChangePassword && (
            <div style={{ display: 'grid', gap: '1rem', padding: '1rem', borderRadius: '14px', background: '#f7f7f7' }}>
              <input type="password" placeholder="Current password" />
              <input type="password" placeholder="New password" />
              <input type="password" placeholder="Confirm new password" />
              <button type="button" onClick={handlePasswordChange} className="btn-primary">Update password</button>
            </div>
          )}
          <button type="button" onClick={() => void logout()} className="btn-secondary">Logout</button>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: '1.5rem' }}>
        <h2 style={{ margin: '0 0 1rem' }}>Quick access</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ background: '#f7f7f7', borderRadius: '14px', padding: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--text-300)' }}>Status</p>
            <strong style={{ marginTop: '0.5rem', display: 'block' }}>{profile.status}</strong>
          </div>
          <div style={{ background: '#f7f7f7', borderRadius: '14px', padding: '1rem' }}>
            <p style={{ margin: 0, color: 'var(--text-300)' }}>Preferred contact</p>
            <strong style={{ marginTop: '0.5rem', display: 'block' }}>{profile.preferredContactMethod}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-100)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#f2f2ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={26} color="#111111" />
            </div>
            <div>
              <p style={{ margin: 0, color: 'var(--text-300)', fontSize: '0.95rem' }}>Donor dashboard</p>
              <h1 style={{ margin: '0.4rem 0 0', fontSize: '2rem' }}>Hello, {profile.fullName}</h1>
            </div>
          </div>
          <button type="button" onClick={() => void logout()} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </header>

        <div style={{ marginBottom: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, color: 'var(--text-300)' }}>Dashboard quick actions</p>
                <h2 style={{ margin: '0.5rem 0 0' }}>What would you like to view?</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button type="button" onClick={() => setActiveTab('profile')} className="btn-secondary">My Profile</button>
                <button type="button" onClick={() => setActiveTab('history')} className="btn-secondary">Past Donations</button>
                <button type="button" onClick={() => setActiveTab('requests')} className="btn-secondary">Requests</button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="dashboard-card">
            <p style={{ margin: 0, color: 'var(--text-300)' }}>Total donations</p>
            <strong style={{ fontSize: '1.75rem' }}>{pastDonations}</strong>
          </div>
          <div className="dashboard-card">
            <p style={{ margin: 0, color: 'var(--text-300)' }}>Requests made</p>
            <strong style={{ fontSize: '1.75rem' }}>{requestCount}</strong>
          </div>
          <div className="dashboard-card">
            <p style={{ margin: 0, color: 'var(--text-300)' }}>Availability</p>
            <strong style={{ fontSize: '1.75rem' }}>{availabilityStatus}</strong>
          </div>
        </div>

        {renderQuickButtons()}

        <div>
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'requests' && renderRequests()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};
