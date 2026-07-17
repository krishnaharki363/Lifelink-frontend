import React, { useEffect, useState } from 'react';
import {
  Droplet, LayoutDashboard, History, Bell, Settings,
  LogOut, Heart, Calendar, MapPin, Clock, CheckCircle2,
  AlertCircle, Edit3, Lock, ChevronRight, Award, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'overview' | 'history' | 'requests' | 'schedule' | 'settings';

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',  label: 'Overview',        icon: LayoutDashboard },
  { key: 'history',   label: 'Donation History', icon: History },
  { key: 'requests',  label: 'Requests',         icon: Bell },
  { key: 'schedule',  label: 'Schedule Donation',icon: Calendar },
  { key: 'settings',  label: 'Settings',         icon: Settings },
];

const HISTORY = [
  { id: 1, date: '2025-04-10', hospital: 'City Blood Bank',   location: 'Kathmandu', units: 1, status: 'Completed', badge: 'badge-green' },
  { id: 2, date: '2025-01-22', hospital: 'Red Cross Center',  location: 'Pokhara',   units: 1, status: 'Completed', badge: 'badge-green' },
  { id: 3, date: '2024-09-05', hospital: 'Patan Hospital',    location: 'Lalitpur',  units: 1, status: 'Completed', badge: 'badge-green' },
  { id: 4, date: '2024-06-14', hospital: 'Kathmandu General', location: 'Kathmandu', units: 1, status: 'Completed', badge: 'badge-green' },
];

const REQUESTS = [
  { id: 'REQ-042', hospital: 'Kathmandu General', blood: 'O+', urgency: 'Critical', date: '2025-07-17', status: 'Pending',  statusBadge: 'badge-yellow' },
  { id: 'REQ-031', hospital: 'City Clinic',       blood: 'O+', urgency: 'Urgent',   date: '2025-07-12', status: 'Accepted', statusBadge: 'badge-blue'   },
  { id: 'REQ-018', hospital: 'Patan Hospital',    blood: 'O+', urgency: 'Normal',   date: '2025-06-28', status: 'Completed',statusBadge: 'badge-green'  },
];

const CENTERS = [
  { name: 'Kathmandu Central Blood Bank', address: 'Red Cross Marg, Kalimati', city: 'Kathmandu', slots: ['09:00', '11:00', '14:00', '16:00'] },
  { name: 'Pokhara Regional Donor Unit',  address: 'Siddhartha Highway',       city: 'Pokhara',   slots: ['08:30', '10:30', '13:30'] },
  { name: 'Patan Hospital Blood Center',  address: 'Lagankhel, Lalitpur',      city: 'Lalitpur',  slots: ['09:00', '12:00', '15:00'] },
];

export const DonorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tab, setTab]                   = useState<Tab>('overview');
  const [availability, setAvailability] = useState<'Available' | 'Unavailable'>('Available');
  const [isEditing, setIsEditing]       = useState(false);
  const [showPwForm, setShowPwForm]     = useState(false);
  const [scheduleCenter, setScheduleCenter] = useState(CENTERS[0].name);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleSlot, setScheduleSlot] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  // Profile editable fields
  const [phone, setPhone]   = useState(user?.phone || '');
  const [city, setCity]     = useState(user?.city  || '');
  const [address, setAddress] = useState('');

  const name      = user?.firstName || user?.name || (user?.email?.split('@')[0] ?? 'Donor');
  const bloodType = user?.bloodType || 'O+';
  const nextEligible = HISTORY.length
    ? (() => { const d = new Date(HISTORY[0].date); d.setDate(d.getDate() + 84); return d.toLocaleDateString(); })()
    : 'Eligible now';

  useEffect(() => { setPhone(user?.phone || ''); setCity(user?.city || ''); }, [user]);

  const selectedCenter = CENTERS.find(c => c.name === scheduleCenter) ?? CENTERS[0];

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleDate || !scheduleSlot) return;
    setScheduleSuccess(`Donation scheduled at ${scheduleCenter} on ${scheduleDate} at ${scheduleSlot}.`);
    setScheduleDate(''); setScheduleSlot('');
  };

  return (
    <div className="dash-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--red-600)', display: 'grid', placeItems: 'center' }}>
            <Droplet size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--gray-900)' }}>
            Life<span style={{ color: 'var(--red-600)' }}>Link</span>
          </span>
        </div>

        {/* donor card */}
        <div style={{ background: 'linear-gradient(135deg, var(--red-600), var(--red-800))', borderRadius: 'var(--radius-lg)', padding: '1rem', margin: '0 0 1rem', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
              {name.charAt(0)}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>{name}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.7 }}>Verified Donor</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>Blood type</span>
            <span style={{ fontWeight: 900, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>{bloodType}</span>
          </div>
        </div>

        <p className="nav-section-title">Donor Portal</p>
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={17} /> {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <button className="nav-item" onClick={() => void logout()} style={{ color: 'var(--error)' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h1 className="page-title">{NAV.find(n => n.key === tab)?.label}</h1>
            <p className="page-subtitle">Hello, {name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setAvailability(a => a === 'Available' ? 'Unavailable' : 'Available')}
              className={`badge ${availability === 'Available' ? 'badge-green' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: availability === 'Available' ? 'var(--success)' : 'var(--gray-400)', display: 'inline-block', marginRight: 4 }} />
              {availability}
            </button>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="animate-fade-up">
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Donations', value: HISTORY.length, icon: Heart,        color: 'var(--red-600)', bg: 'var(--red-50)' },
                { label: 'Lives Saved',     value: HISTORY.length * 3, icon: Award,    color: 'var(--success)', bg: 'var(--success-bg)' },
                { label: 'Open Requests',   value: REQUESTS.filter(r => r.status === 'Pending').length, icon: Bell, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                { label: 'Next Eligible',   value: nextEligible,   icon: Calendar,     color: 'var(--info)',    bg: 'var(--info-bg)', small: true },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: c.bg, display: 'grid', placeItems: 'center' }}>
                        <Icon size={18} color={c.color} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)', fontWeight: 600 }}>{c.label}</span>
                    </div>
                    <p style={{ fontSize: (c as { small?: boolean }).small ? '1.1rem' : '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gray-900)', margin: 0, lineHeight: 1.1 }}>
                      {String(c.value)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Donation badge / impact card */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Recent Donations</h3>
                {HISTORY.slice(0, 3).map((h, i) => (
                  <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: i < 2 ? '1px solid var(--gray-100)' : 'none' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--red-50)', display: 'grid', placeItems: 'center' }}>
                      <Droplet size={18} color="var(--red-600)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{h.hospital}</p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-400)' }}>{h.location} · {new Date(h.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${h.badge}`}>{h.status}</span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem', color: 'var(--red-600)' }} onClick={() => setTab('history')}>
                  View full history <ChevronRight size={14} />
                </button>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Your Impact</h3>
                {[
                  { label: 'Units donated', val: `${HISTORY.length} units` },
                  { label: 'Estimated lives saved', val: `${HISTORY.length * 3} people` },
                  { label: 'Donation streak', val: '4 donations' },
                  { label: 'Donor since', val: '2024' },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{m.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-900)' }}>{m.val}</span>
                  </div>
                ))}
                <button className="btn btn-primary btn-sm" style={{ marginTop: 'auto', justifyContent: 'center' }} onClick={() => setTab('schedule')}>
                  <Calendar size={14} /> Schedule Donation
                </button>
              </div>
            </div>

            {/* Active requests preview */}
            {REQUESTS.filter(r => r.status === 'Pending').length > 0 && (
              <div className="card" style={{ borderLeft: '4px solid var(--red-500)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <AlertCircle size={18} color="var(--red-600)" />
                  <h3 style={{ margin: 0, color: 'var(--red-700)' }}>You have pending donation requests</h3>
                </div>
                {REQUESTS.filter(r => r.status === 'Pending').map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--red-50)', borderRadius: 'var(--radius-md)', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="blood-pill">{r.blood}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{r.hospital}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-500)' }}>{r.urgency} · {r.date}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm">Accept</button>
                      <button className="btn btn-secondary btn-sm">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <div className="animate-fade-up">
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Donations', value: HISTORY.length, color: 'var(--red-600)' },
                { label: 'Units Donated',   value: HISTORY.length, color: 'var(--info)' },
                { label: 'Lives Helped',    value: HISTORY.length * 3, color: 'var(--success)' },
              ].map(s => (
                <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color, margin: '0 0 0.3rem' }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-500)' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Center / Hospital</th><th>Location</th><th>Units</th><th>Status</th></tr></thead>
                  <tbody>
                    {HISTORY.map(h => (
                      <tr key={h.id}>
                        <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td style={{ fontWeight: 600 }}>{h.hospital}</td>
                        <td style={{ color: 'var(--gray-500)' }}><span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={13} />{h.location}</span></td>
                        <td style={{ fontWeight: 700 }}>{h.units}</td>
                        <td><span className={`badge ${h.badge}`}><CheckCircle2 size={11} />{h.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── REQUESTS ── */}
        {tab === 'requests' && (
          <div className="animate-fade-up">
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Hospitals near you that need your blood type (<strong>{bloodType}</strong>).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {REQUESTS.map(r => (
                <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="blood-pill blood-pill-lg">{r.blood}</span>
                    <div>
                      <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.95rem' }}>{r.hospital}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${r.urgency === 'Critical' ? 'badge-red' : r.urgency === 'Urgent' ? 'badge-yellow' : 'badge-gray'}`}>{r.urgency}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} />{r.date}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--gray-400)' }}>{r.id}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge ${r.statusBadge}`}>{r.status}</span>
                    {r.status === 'Pending' && (
                      <>
                        <button className="btn btn-primary btn-sm">Accept</button>
                        <button className="btn btn-secondary btn-sm">Decline</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {tab === 'schedule' && (
          <div className="animate-fade-up" style={{ maxWidth: 640 }}>
            <div className="card" style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, var(--red-50), #fff)', borderColor: 'var(--red-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={20} color="var(--red-600)" />
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--red-700)' }}>You are eligible to donate!</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-500)' }}>Next eligible date: {nextEligible}</p>
                </div>
              </div>
            </div>

            {scheduleSuccess && (
              <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} /><span>{scheduleSuccess}</span>
              </div>
            )}

            <form className="card" onSubmit={handleSchedule}>
              <h3 style={{ marginBottom: '1.5rem' }}>Book a Donation Appointment</h3>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Donation Center</label>
                  {CENTERS.map(c => (
                    <div key={c.name} onClick={() => { setScheduleCenter(c.name); setScheduleSlot(''); }} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.9rem 1rem', marginBottom: '0.5rem',
                      border: `2px solid ${scheduleCenter === c.name ? 'var(--red-500)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      background: scheduleCenter === c.name ? 'var(--red-50)' : '#fff',
                      cursor: 'pointer', transition: 'all var(--t-fast)',
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: scheduleCenter === c.name ? 'var(--red-700)' : 'var(--gray-800)' }}>{c.name}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} />{c.address}, {c.city}</p>
                      </div>
                      {scheduleCenter === c.name && <CheckCircle2 size={18} color="var(--red-600)" />}
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Date</label>
                  <input className="form-input" type="date" value={scheduleDate} min={new Date().toISOString().split('T')[0]}
                    onChange={e => { setScheduleDate(e.target.value); setScheduleSlot(''); }} required />
                </div>

                {scheduleDate && (
                  <div className="form-group">
                    <label className="form-label">Available Time Slots</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedCenter.slots.map(slot => (
                        <button key={slot} type="button" onClick={() => setScheduleSlot(slot)} style={{
                          padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)',
                          border: `2px solid ${scheduleSlot === slot ? 'var(--red-500)' : 'var(--border)'}`,
                          background: scheduleSlot === slot ? 'var(--red-600)' : '#fff',
                          color: scheduleSlot === slot ? '#fff' : 'var(--gray-700)',
                          fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                          transition: 'all var(--t-fast)',
                        }}>{slot}</button>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={!scheduleDate || !scheduleSlot} style={{ justifyContent: 'center', padding: '0.85rem' }}>
                  <Calendar size={16} /> Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div className="animate-fade-up" style={{ maxWidth: 640 }}>
            {/* Profile edit */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Profile Information</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(e => !e)}>
                  <Edit3 size={14} /> {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={name} disabled />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <input className="form-input" value={bloodType} disabled />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={user?.email || ''} disabled />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} disabled={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={city} onChange={e => setCity(e.target.value)} disabled={!isEditing} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-textarea" value={address} onChange={e => setAddress(e.target.value)} disabled={!isEditing} style={{ minHeight: 72 }} />
                </div>
                {isEditing && (
                  <button className="btn btn-primary btn-sm" onClick={() => setIsEditing(false)} style={{ justifyContent: 'center' }}>
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Availability toggle */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Availability</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {(['Available', 'Unavailable'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setAvailability(s)} style={{
                    flex: 1, padding: '0.75rem',
                    border: `2px solid ${availability === s ? (s === 'Available' ? 'var(--success)' : 'var(--gray-400)') : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    background: availability === s ? (s === 'Available' ? 'var(--success-bg)' : 'var(--gray-100)') : '#fff',
                    color: availability === s ? (s === 'Available' ? 'var(--success)' : 'var(--gray-600)') : 'var(--gray-500)',
                    fontWeight: 600, cursor: 'pointer', transition: 'all var(--t-fast)',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Change password */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showPwForm ? '1.25rem' : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Lock size={18} color="var(--gray-500)" />
                  <h3 style={{ margin: 0 }}>Change Password</h3>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowPwForm(p => !p)}>
                  {showPwForm ? 'Cancel' : 'Change'}
                </button>
              </div>
              {showPwForm && (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  <input className="form-input" type="password" placeholder="Current password" />
                  <input className="form-input" type="password" placeholder="New password" />
                  <input className="form-input" type="password" placeholder="Confirm new password" />
                  <button className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>Update Password</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
