import React, { useEffect, useState } from 'react';
import {
  Droplet, LayoutDashboard, History, Bell, Settings,
  LogOut, Heart, Calendar, MapPin, Clock, CheckCircle2,
  AlertCircle, Edit3, Lock, ChevronRight, Award, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type Tab = 'overview' | 'history' | 'requests' | 'schedule' | 'settings';

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',  label: 'Overview',        icon: LayoutDashboard },
  { key: 'history',   label: 'Donation History', icon: History },
  { key: 'requests',  label: 'Requests',         icon: Bell },
  { key: 'schedule',  label: 'Schedule Donation',icon: Calendar },
  { key: 'settings',  label: 'Settings',         icon: Settings },
];

const DEFAULT_SLOTS = ['09:00', '11:00', '14:00', '16:00'];

export const DonorDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [tab, setTab]                   = useState<Tab>('overview');
  const [availability, setAvailability] = useState<'Available' | 'Unavailable'>('Available');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditing, setIsEditing]       = useState(false);
  const [showPwForm, setShowPwForm]     = useState(false);
  
  const [bloodBanks, setBloodBanks]     = useState<any[]>([]);
  const [scheduleCenter, setScheduleCenter] = useState<string>('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleSlot, setScheduleSlot] = useState('');
  const [scheduleRequestId, setScheduleRequestId] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');
  const [scheduleError, setScheduleError]     = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile editable fields
  const [phone, setPhone]   = useState(user?.phone || '');
  const [city, setCity]     = useState(user?.city  || '');
  const [address, setAddress] = useState(user?.address || '');

  const name      = user?.firstName || user?.name || (user?.email?.split('@')[0] ?? 'Donor');
  const bloodType = user?.bloodType || 'O+';

  // State for donation history (appointments and direct matches)
  const [history, setHistory] = useState<any[]>([]);
  
  // State for blood requests
  const [requests, setRequests] = useState<any[]>([]);
  const [declinedRequestIds, setDeclinedRequestIds] = useState<string[]>([]);
  

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const completedDonations = history.filter(h => h.status === 'Completed');

  // Next eligible date calculation
  const nextEligible = completedDonations.length
    ? (() => { const d = new Date(completedDonations[0].date); d.setDate(d.getDate() + 84); return d.toLocaleDateString(); })()
    : 'Eligible now';

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchProfile = async () => {
    try {
      const res = await api.get('/donors/profile');
      const data = res.data.data;
      setPhone(data.phone || '');
      setCity(data.city || '');
      setAddress(data.address || '');
      setAvailability(data.availableToDonate ? 'Available' : 'Unavailable');
      setNotificationsEnabled(data.notificationsEnabled);
      updateUser({
        phone: data.phone,
        city: data.city,
        address: data.address,
        availability: data.availableToDonate ? 'Available' : 'Unavailable',
        notificationsEnabled: data.notificationsEnabled
      });
    } catch (err) {
      console.error('Failed to fetch donor profile', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const fetchBloodBanks = async () => {
    try {
      const res = await api.get('/blood-banks');
      setBloodBanks(res.data.data);
      if (res.data.data.length > 0) {
        setScheduleCenter(res.data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch blood banks', err);
    }
  };

  const fetchRequestsAndHistory = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch pending requests matching blood type
      const btEnum = bloodType.replace('+', '_POS').replace('-', '_NEG');
      const reqsRes = await api.get(`/blood-requests?bloodType=${btEnum}&status=PENDING`);
      setRequests(reqsRes.data.data.data);

      // 2. Fetch appointments
      const apptRes = await api.get('/appointments');
      const appointmentsList = apptRes.data.data.map((appt: any) => ({
        id: appt.id,
        date: appt.appointmentDate,
        hospital: appt.bloodBank.name,
        location: appt.bloodBank.address,
        units: 1,
        status: appt.status === 'COMPLETED' ? 'Completed' : appt.status === 'CANCELLED' ? 'Cancelled' : appt.status === 'CONFIRMED' ? 'Confirmed' : 'Pending',
        badge: appt.status === 'COMPLETED' ? 'badge-green' : appt.status === 'CANCELLED' ? 'badge-gray' : 'badge-yellow',
        type: 'appointment'
      }));

      // 3. Fetch all requests to extract matched direct requests
      const allReqsRes = await api.get('/blood-requests');
      const matchedRequestsList = allReqsRes.data.data.data
        .filter((r: any) => r.matchedDonorId && r.hospital)
        .map((r: any) => ({
          id: r.id,
          date: r.createdAt,
          hospital: r.hospital.name,
          location: r.hospital.address,
          units: r.unitsRequired,
          status: r.status === 'FULFILLED' ? 'Completed' : r.status === 'CANCELLED' ? 'Cancelled' : 'Accepted Match',
          badge: r.status === 'FULFILLED' ? 'badge-green' : r.status === 'CANCELLED' ? 'badge-gray' : 'badge-yellow',
          type: 'request'
        }));

      // Combine and sort by date desc
      const combined = [...appointmentsList, ...matchedRequestsList].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setHistory(combined);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync dashboard data with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
    fetchBloodBanks();
  }, []);

  useEffect(() => {
    fetchRequestsAndHistory();
  }, [tab]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.post(`/blood-requests/${requestId}/accept`);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      fetchRequestsAndHistory();
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept blood request');
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    // Decline locally for this session
    setDeclinedRequestIds(prev => [...prev, requestId]);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleCenter || !scheduleDate || !scheduleSlot) return;
    setScheduleSuccess('');
    setScheduleError('');

    try {
      const payload: any = {
        bloodBankId: scheduleCenter,
        appointmentDate: scheduleDate,
        slot: scheduleSlot,
      };
      if (scheduleRequestId) {
        payload.bloodRequestId = scheduleRequestId;
      }

      await api.post('/appointments', payload);
      const centerName = bloodBanks.find(b => b.id === scheduleCenter)?.name || 'selected center';
      setScheduleSuccess(`Donation scheduled at ${centerName} on ${scheduleDate} at ${scheduleSlot}.`);
      setScheduleDate('');
      setScheduleSlot('');
      setScheduleRequestId('');
      fetchRequestsAndHistory();
      fetchNotifications();
    } catch (err: any) {
      setScheduleError(err.response?.data?.message || 'Failed to schedule appointment');
    }
  };

  const saveProfileChanges = async () => {
    try {
      await api.put('/donors/profile', {
        phone,
        city,
        address,
        availableToDonate: availability === 'Available',
        notificationsEnabled,
      });
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save changes');
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvailabilityToggle = async () => {
    const nextAvail = availability === 'Available' ? 'Unavailable' : 'Available';
    setAvailability(nextAvail);
    try {
      await api.put('/donors/profile', {
        availableToDonate: nextAvail === 'Available',
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };


  const myMatchedRequests = history.filter(h => h.type === 'request' && h.status === 'Accepted Match');
  const unreadNotifications = notifications.filter(n => !n.read);

  // Filter requests locally for declines
  const visibleRequests = requests.filter(r => !declinedRequestIds.includes(r.id));

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
              {loading ? '...' : name.charAt(0)}
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
        {/* Header bar with Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h1 className="page-title">{NAV.find(n => n.key === tab)?.label}</h1>
            <p className="page-subtitle">Hello, {name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', position: 'relative' }}>
            {/* Notification bell button */}
            <button 
              onClick={() => setShowNotifications(s => !s)}
              className="btn btn-secondary btn-sm" 
              style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%' }}
            >
              <Bell size={18} />
              {unreadNotifications.length > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  background: 'var(--error)', color: '#fff', fontSize: '0.65rem',
                  fontWeight: 'bold', width: 16, height: 16, borderRadius: '50%',
                  display: 'grid', placeItems: 'center'
                }}>{unreadNotifications.length}</span>
              )}
            </button>

            {/* Notifications panel popover */}
            {showNotifications && (
              <div className="card" style={{
                position: 'absolute', top: '100%', right: 0, zIndex: 100,
                width: 320, maxHeight: 400, overflowY: 'auto', marginTop: '0.5rem',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0 }}>Notifications</h4>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.75rem' }} onClick={() => setShowNotifications(false)}>Close</button>
                </div>
                {notifications.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-400)', textAlign: 'center', padding: '1rem 0' }}>No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '0.6rem 0.5rem', borderBottom: '1px solid var(--gray-100)',
                      display: 'flex', flexDirection: 'column', gap: '0.2rem',
                      background: n.read ? 'transparent' : 'var(--red-50)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: n.read ? 600 : 700, color: 'var(--gray-800)' }}>{n.title}</span>
                        {!n.read && (
                          <button 
                            onClick={() => handleMarkNotificationRead(n.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--red-600)', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{n.message}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>{new Date(n.createdAt).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            <button
              onClick={handleAvailabilityToggle}
              className={`badge ${availability === 'Available' ? 'badge-green' : 'badge-gray'}`}
              style={{ cursor: 'pointer', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: availability === 'Available' ? 'var(--success)' : 'var(--gray-400)', display: 'inline-block', marginRight: 4 }} />
              {availability}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={16} /> <span>{errorMsg}</span>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="animate-fade-up">
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Donations', value: completedDonations.length, icon: Heart,        color: 'var(--red-600)', bg: 'var(--red-50)' },
                { label: 'Lives Saved',     value: completedDonations.length * 3, icon: Award,    color: 'var(--success)', bg: 'var(--success-bg)' },
                { label: 'Open Requests',   value: visibleRequests.length, icon: Bell, color: 'var(--warning)', bg: 'var(--warning-bg)' },
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
                {history.length === 0 ? (
                  <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--gray-400)' }}>
                    <Heart size={32} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'inline-block' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No donations recorded yet.</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.7 }}>Accept a request to register your first donation!</p>
                  </div>
                ) : (
                  history.slice(0, 3).map((h, i) => (
                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: i < history.slice(0, 3).length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--red-50)', display: 'grid', placeItems: 'center' }}>
                        <Droplet size={18} color="var(--red-600)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{h.hospital}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-400)' }}>{h.location} · {new Date(h.date).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge ${h.badge}`}>{h.status}</span>
                    </div>
                  ))
                )}
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem', color: 'var(--red-600)' }} onClick={() => setTab('history')}>
                  View full history <ChevronRight size={14} />
                </button>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Your Impact</h3>
                {[
                  { label: 'Units donated', val: `${completedDonations.length} units` },
                  { label: 'Estimated lives saved', val: `${completedDonations.length * 3} people` },
                  { label: 'Donation streak', val: `${completedDonations.length} donations` },
                  { label: 'Donor since', val: '2026' },
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
            {visibleRequests.length > 0 && (
              <div className="card" style={{ borderLeft: '4px solid var(--red-500)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <AlertCircle size={18} color="var(--red-600)" />
                  <h3 style={{ margin: 0, color: 'var(--red-700)' }}>You have pending donation requests</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {visibleRequests.slice(0, 3).map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--red-50)', borderRadius: 'var(--radius-md)', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="blood-pill">{r.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{r.hospital.name}</p>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-500)' }}>{r.urgency} · {new Date(r.requiredByDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(r.id)}>Accept</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleDeclineRequest(r.id)}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <div className="animate-fade-up">
            <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Donations', value: completedDonations.length, color: 'var(--red-600)' },
                { label: 'Units Donated',   value: completedDonations.length, color: 'var(--info)' },
                { label: 'Lives Helped',    value: completedDonations.length * 3, color: 'var(--success)' },
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
                  <thead><tr><th>Date</th><th>Type</th><th>Center / Hospital</th><th>Location</th><th>Units</th><th>Status</th></tr></thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>
                          <History size={36} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'inline-block' }} />
                          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>No donation history found</p>
                          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>Your completed donations will appear here.</p>
                        </td>
                      </tr>
                    ) : (
                      history.map(h => (
                        <tr key={h.id}>
                          <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                          <td style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)' }}>{h.type === 'appointment' ? 'Appointment' : 'Direct Match'}</td>
                          <td style={{ fontWeight: 600 }}>{h.hospital}</td>
                          <td style={{ color: 'var(--gray-500)' }}><span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={13} />{h.location}</span></td>
                          <td style={{ fontWeight: 700 }}>{h.units}</td>
                          <td><span className={`badge ${h.badge}`}>{h.status}</span></td>
                        </tr>
                      ))
                    )}
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
              {visibleRequests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>
                  <Bell size={36} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'inline-block' }} />
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>No matching requests found</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>We will notify you when a patient requires your blood type.</p>
                </div>
              ) : (
                visibleRequests.map(r => (
                  <div key={r.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="blood-pill blood-pill-lg">{r.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                      <div>
                        <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.95rem' }}>{r.hospital.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span className={`badge ${r.urgency === 'CRITICAL' ? 'badge-red' : r.urgency === 'URGENT' ? 'badge-yellow' : 'badge-gray'}`}>{r.urgency}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} />Needed by: {new Date(r.requiredByDate).toLocaleDateString()}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--gray-400)' }}>{r.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAcceptRequest(r.id)}>Accept Request</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDeclineRequest(r.id)}>Decline</button>
                    </div>
                  </div>
                ))
              )}
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

            {scheduleError && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} /><span>{scheduleError}</span>
              </div>
            )}

            <form className="card" onSubmit={handleSchedule}>
              <h3 style={{ marginBottom: '1.5rem' }}>Book a Donation Appointment</h3>
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Donation Center</label>
                  {bloodBanks.length === 0 ? (
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>No donation centers registered</p>
                  ) : (
                    bloodBanks.map(c => (
                      <div key={c.id} onClick={() => { setScheduleCenter(c.id); setScheduleSlot(''); }} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.9rem 1rem', marginBottom: '0.5rem',
                        border: `2px solid ${scheduleCenter === c.id ? 'var(--red-500)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        background: scheduleCenter === c.id ? 'var(--red-50)' : '#fff',
                        cursor: 'pointer', transition: 'all var(--t-fast)',
                      }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem', color: scheduleCenter === c.id ? 'var(--red-700)' : 'var(--gray-800)' }}>{c.name}</p>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} />{c.address}</p>
                        </div>
                        {scheduleCenter === c.id && <CheckCircle2 size={18} color="var(--red-600)" />}
                      </div>
                    ))
                  )}
                </div>

                {myMatchedRequests.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Link to Blood Request (Optional)</label>
                    <select 
                      className="form-select"
                      value={scheduleRequestId}
                      onChange={e => setScheduleRequestId(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                    >
                      <option value="">-- None (Open Donation) --</option>
                      {myMatchedRequests.map(r => (
                        <option key={r.id} value={r.id}>
                          For: {r.hospital} (ID: {r.id.slice(0, 8)})
                        </option>
                      ))}
                    </select>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                      Select this if you accepted a direct blood request and want to complete it at this blood bank.
                    </p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Preferred Date</label>
                  <input className="form-input" type="date" value={scheduleDate} min={new Date().toISOString().split('T')[0]}
                    onChange={e => { setScheduleDate(e.target.value); setScheduleSlot(''); }} required />
                </div>

                {scheduleDate && (
                  <div className="form-group">
                    <label className="form-label">Available Time Slots</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {DEFAULT_SLOTS.map(slot => (
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
                  <button className="btn btn-primary btn-sm" onClick={saveProfileChanges} style={{ justifyContent: 'center' }}>
                    Save Changes
                  </button>
                )}
              </div>
            </div>

            {/* Availability & Notification settings */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Availability & Notifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '0.5rem' }}>Availability Status</label>
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

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem' }}>Match Notifications</h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-400)' }}>Receive instant notifications when hospitals request matching blood.</p>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={notificationsEnabled}
                      onChange={e => setNotificationsEnabled(e.target.checked)}
                      style={{ width: 20, height: 20, cursor: 'pointer', accentColor: 'var(--red-600)' }}
                    />
                  </label>
                </div>

                <button className="btn btn-primary btn-sm" onClick={saveProfileChanges} style={{ justifyContent: 'center' }}>
                  Save Availability & Preferences
                </button>
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
