import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Building2, Droplets, BarChart3,
  LogOut, Droplet, ShieldCheck, Clock, CheckCircle,
  TrendingUp, AlertTriangle, Search, Filter, MoreHorizontal,
  Eye, Ban, CheckCircle2, Bell, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'overview' | 'donors' | 'hospitals' | 'requests' | 'analytics';

/* ── Mock data ─────────────────────────────────────────────────── */
const DONORS = [
  { id: 1, name: 'Ramesh Kumar',    blood: 'O+',  city: 'Kathmandu', status: 'Verified',  lastDonation: '2025-04-10', donations: 5 },
  { id: 2, name: 'Sita Sharma',     blood: 'A-',  city: 'Pokhara',   status: 'Pending',   lastDonation: '—',          donations: 0 },
  { id: 3, name: 'Bijay Thapa',     blood: 'B+',  city: 'Lalitpur',  status: 'Verified',  lastDonation: '2025-01-22', donations: 3 },
  { id: 4, name: 'Anita Gurung',    blood: 'AB+', city: 'Biratnagar',status: 'Suspended', lastDonation: '2024-09-05', donations: 2 },
  { id: 5, name: 'Prakash Adhikari',blood: 'O-',  city: 'Kathmandu', status: 'Pending',   lastDonation: '—',          donations: 0 },
  { id: 6, name: 'Maya Rai',        blood: 'A+',  city: 'Dharan',    status: 'Verified',  lastDonation: '2025-03-15', donations: 7 },
];

const HOSPITALS = [
  { id: 1, name: 'Kathmandu General Hospital', city: 'Kathmandu', contact: '+977-1-4411551', status: 'Active',   requests: 14, joined: '2023-06-01' },
  { id: 2, name: 'Patan Hospital',             city: 'Lalitpur',  contact: '+977-1-4522266', status: 'Active',   requests: 9,  joined: '2023-08-15' },
  { id: 3, name: 'BP Koirala Institute',       city: 'Dharan',    contact: '+977-25-525555', status: 'Inactive', requests: 3,  joined: '2024-01-20' },
  { id: 4, name: 'City Clinic',                city: 'Pokhara',   contact: '+977-61-465544', status: 'Active',   requests: 6,  joined: '2024-03-10' },
];

const REQUESTS = [
  { id: 'REQ-001', hospital: 'Kathmandu General', blood: 'O+',  units: 3, urgency: 'Critical', status: 'Open',     date: '2025-07-17' },
  { id: 'REQ-002', hospital: 'Patan Hospital',    blood: 'A-',  units: 2, urgency: 'Urgent',   status: 'Matched',  date: '2025-07-16' },
  { id: 'REQ-003', hospital: 'City Clinic',       blood: 'B+',  units: 1, urgency: 'Normal',   status: 'Fulfilled',date: '2025-07-15' },
  { id: 'REQ-004', hospital: 'Patan Hospital',    blood: 'AB-', units: 4, urgency: 'Critical', status: 'Open',     date: '2025-07-17' },
  { id: 'REQ-005', hospital: 'BP Koirala',        blood: 'O-',  units: 2, urgency: 'Urgent',   status: 'Matched',  date: '2025-07-14' },
];

const ACTIVITY = [
  { icon: CheckCircle2, text: 'Ramesh Kumar verified as donor',          time: '2h ago',  color: 'var(--success)' },
  { icon: Building2,    text: 'City Clinic updated contact details',     time: '5h ago',  color: 'var(--info)' },
  { icon: Droplet,      text: 'REQ-001: O+ matched to Kathmandu General',time: '1d ago',  color: 'var(--red-600)' },
  { icon: AlertTriangle,text: 'Anita Gurung account suspended',          time: '2d ago',  color: 'var(--warning)' },
  { icon: Users,        text: '3 new donor registrations pending review',time: '3d ago',  color: 'var(--info)' },
];

const BLOOD_STOCK = [
  { type: 'A+', units: 42, pct: 84 }, { type: 'A-', units: 8,  pct: 16 },
  { type: 'B+', units: 35, pct: 70 }, { type: 'B-', units: 5,  pct: 10 },
  { type: 'O+', units: 58, pct: 100},  { type: 'O-', units: 12, pct: 24 },
  { type: 'AB+',units: 20, pct: 40 }, { type: 'AB-',units: 3,  pct: 6  },
];

/* ── Helpers ───────────────────────────────────────────────────── */
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Verified: 'badge-green', Pending: 'badge-yellow', Suspended: 'badge-gray',
    Active: 'badge-green', Inactive: 'badge-gray',
    Open: 'badge-red', Matched: 'badge-blue', Fulfilled: 'badge-green',
    Critical: 'badge-red', Urgent: 'badge-yellow', Normal: 'badge-gray',
  };
  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status}</span>;
};

/* ── Sidebar nav definition ────────────────────────────────────── */
const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { key: 'donors',     label: 'Donors',         icon: Users },
  { key: 'hospitals',  label: 'Hospitals',      icon: Building2 },
  { key: 'requests',   label: 'Blood Requests', icon: Droplets },
  { key: 'analytics',  label: 'Analytics',      icon: BarChart3 },
];

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [donorSearch, setDonorSearch] = useState('');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const name = user?.firstName || user?.name || 'Admin';

  const filteredDonors   = DONORS.filter(d => d.name.toLowerCase().includes(donorSearch.toLowerCase()) || d.blood.includes(donorSearch));
  const filteredHospitals = HOSPITALS.filter(h => h.name.toLowerCase().includes(hospitalSearch.toLowerCase()));

  return (
    <div className="dash-layout">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--red-600)', display: 'grid', placeItems: 'center' }}>
            <Droplet size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--gray-900)' }}>
            Life<span style={{ color: 'var(--red-600)' }}>Link</span>
          </span>
        </div>

        <p className="nav-section-title">Management</p>
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={17} className="nav-icon" /> {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.85rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red-100)', color: 'var(--red-700)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>
              {name.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-400)' }}>Administrator</p>
            </div>
          </div>
          <button className="nav-item" onClick={() => void logout()} style={{ color: 'var(--error)' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="dash-main">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h1 className="page-title">
              {NAV.find(n => n.key === tab)?.label}
            </h1>
            <p className="page-subtitle">Welcome back, {name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-ghost btn-sm"><Bell size={16} /></button>
            <button className="btn btn-ghost btn-sm"><Settings size={16} /></button>
          </div>
        </div>

        {/* ── OVERVIEW ──────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="animate-fade-up">
            {/* KPI cards */}
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Donors',         value: '1,248', delta: '+12 this week', icon: Users,       color: 'var(--red-600)',  bg: 'var(--red-50)' },
                { label: 'Active Hospitals',      value: '34',    delta: '3 inactive',   icon: Building2,   color: 'var(--info)',     bg: 'var(--info-bg)' },
                { label: 'Open Requests',         value: '22',    delta: '5 critical',   icon: Droplets,    color: 'var(--warning)',  bg: 'var(--warning-bg)' },
                { label: 'Pending Verifications', value: '16',    delta: 'needs review', icon: ShieldCheck, color: 'var(--success)',  bg: 'var(--success-bg)' },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div className="icon-box-lg" style={{ background: c.bg, color: c.color, borderRadius: 'var(--radius-lg)', display: 'grid', placeItems: 'center', width: 44, height: 44 }}>
                        <Icon size={20} />
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)', fontWeight: 600 }}>{c.label}</span>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gray-900)', margin: '0 0 0.25rem' }}>{c.value}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', margin: 0 }}>{c.delta}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
              {/* Activity feed */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0 }}>Recent Activity</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Last 7 days</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {ACTIVITY.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', padding: '0.85rem 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-100)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <Icon size={15} color={a.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--gray-700)', fontWeight: 500 }}>{a.text}</p>
                          <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--gray-400)' }}>{a.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blood stock */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0 }}>Blood Stock</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>All banks</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {BLOOD_STOCK.map(b => (
                    <div key={b.type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{b.type}</span>
                        <span style={{ fontSize: '0.8rem', color: b.units < 10 ? 'var(--error)' : 'var(--gray-500)' }}>{b.units} units</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${b.pct}%`, background: b.pct < 20 ? 'var(--error)' : b.pct < 40 ? 'var(--warning)' : 'var(--red-600)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DONORS ────────────────────────────────────────── */}
        {tab === 'donors' && (
          <div className="animate-fade-up">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input className="form-input" placeholder="Search by name or blood type…" value={donorSearch} onChange={e => setDonorSearch(e.target.value)} style={{ paddingLeft: '2.4rem' }} />
              </div>
              <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filter</button>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Donor</th><th>Blood</th><th>City</th>
                      <th>Status</th><th>Last Donation</th><th>Total</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.map(d => (
                      <tr key={d.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red-100)', color: 'var(--red-700)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.78rem' }}>
                              {d.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.name}</span>
                          </div>
                        </td>
                        <td><span className="blood-pill">{d.blood}</span></td>
                        <td style={{ color: 'var(--gray-500)' }}>{d.city}</td>
                        <td><StatusBadge status={d.status} /></td>
                        <td style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{d.lastDonation}</td>
                        <td style={{ fontWeight: 700 }}>{d.donations}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button className="btn btn-ghost btn-sm" title="View"><Eye size={14} /></button>
                            {d.status === 'Pending' && <button className="btn btn-ghost btn-sm" title="Approve" style={{ color: 'var(--success)' }}><CheckCircle size={14} /></button>}
                            {d.status !== 'Suspended' && <button className="btn btn-ghost btn-sm" title="Suspend" style={{ color: 'var(--error)' }}><Ban size={14} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── HOSPITALS ─────────────────────────────────────── */}
        {tab === 'hospitals' && (
          <div className="animate-fade-up">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input className="form-input" placeholder="Search hospitals…" value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} style={{ paddingLeft: '2.4rem' }} />
              </div>
              <button className="btn btn-primary btn-sm">+ Add Hospital</button>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Hospital</th><th>City</th><th>Contact</th><th>Status</th><th>Requests</th><th>Joined</th><th></th></tr>
                  </thead>
                  <tbody>
                    {filteredHospitals.map(h => (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 600 }}>{h.name}</td>
                        <td style={{ color: 'var(--gray-500)' }}>{h.city}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{h.contact}</td>
                        <td><StatusBadge status={h.status} /></td>
                        <td style={{ fontWeight: 700 }}>{h.requests}</td>
                        <td style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{h.joined}</td>
                        <td><button className="btn btn-ghost btn-sm"><MoreHorizontal size={15} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── REQUESTS ──────────────────────────────────────── */}
        {tab === 'requests' && (
          <div className="animate-fade-up">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Open',      count: REQUESTS.filter(r => r.status === 'Open').length,      color: 'var(--red-600)',  bg: 'var(--red-50)' },
                { label: 'Matched',   count: REQUESTS.filter(r => r.status === 'Matched').length,   color: 'var(--info)',     bg: 'var(--info-bg)' },
                { label: 'Fulfilled', count: REQUESTS.filter(r => r.status === 'Fulfilled').length, color: 'var(--success)',  bg: 'var(--success-bg)' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color, margin: '0 0 0.25rem' }}>{s.count}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-500)' }}>{s.label} Requests</p>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Hospital</th><th>Blood</th><th>Units</th><th>Urgency</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {REQUESTS.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--gray-400)' }}>{r.id}</td>
                        <td style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.hospital}</td>
                        <td><span className="blood-pill">{r.blood}</span></td>
                        <td style={{ fontWeight: 700 }}>{r.units}</td>
                        <td><StatusBadge status={r.urgency} /></td>
                        <td><StatusBadge status={r.status} /></td>
                        <td style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{r.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ─────────────────────────────────────── */}
        {tab === 'analytics' && (
          <div className="animate-fade-up">
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Donations This Month',  value: '248',   icon: TrendingUp,  color: 'var(--success)' },
                { label: 'Avg Response Time',      value: '42 min',icon: Clock,       color: 'var(--info)' },
                { label: 'Fulfillment Rate',       value: '91%',   icon: CheckCircle2,color: 'var(--red-600)' },
                { label: 'Critical Alerts',        value: '3',     icon: AlertTriangle,color:'var(--warning)' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <Icon size={18} color={s.color} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color, margin: 0 }}>{s.value}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Blood Type Distribution</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {BLOOD_STOCK.map(b => (
                    <div key={b.type} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', borderRadius: 'var(--radius-md)', background: 'var(--gray-50)' }}>
                      <span className="blood-pill">{b.type}</span>
                      <div style={{ flex: 1 }}>
                        <div className="progress-bar" style={{ marginBottom: '0.2rem' }}>
                          <div className="progress-fill" style={{ width: `${b.pct}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{b.units} units</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Platform Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { label: 'Donors registered this month', value: '89',   pct: 72 },
                    { label: 'Requests fulfilled this month', value: '64',  pct: 91 },
                    { label: 'Average donations per donor',   value: '3.2', pct: 64 },
                    { label: 'Hospital onboarding rate',      value: '78%', pct: 78 },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{m.label}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.value}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
