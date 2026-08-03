import React, { useState, useEffect } from 'react';
import {
  Droplet, LayoutDashboard, Package, ClipboardList, Users,
  BarChart3, LogOut, Search, CheckCircle2,
  Clock, Activity, Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type Tab = 'overview' | 'inventory' | 'requests' | 'donors' | 'analytics';

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',   label: 'Overview',       icon: LayoutDashboard },
  { key: 'inventory',  label: 'Blood Inventory', icon: Package },
  { key: 'requests',   label: 'Blood Requests',  icon: ClipboardList },
  { key: 'donors',     label: 'Donation Appts',  icon: Users },
  { key: 'analytics',  label: 'Analytics',       icon: BarChart3 },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    PENDING: 'badge-yellow',
    MATCHED_INVENTORY: 'badge-blue',
    MATCHED_DONOR: 'badge-blue',
    IN_DELIVERY: 'badge-yellow',
    FULFILLED: 'badge-green',
    CANCELLED: 'badge-gray',
    NORMAL: 'badge-gray',
    URGENT: 'badge-yellow',
    CRITICAL: 'badge-red',
    CONFIRMED: 'badge-blue',
    COMPLETED: 'badge-green',
  };
  
  const labelMap: Record<string, string> = {
    PENDING: 'Pending Confirmation',
    MATCHED_INVENTORY: 'Matched (Inventory)',
    MATCHED_DONOR: 'Matched (Donor)',
    IN_DELIVERY: 'In Transit',
    FULFILLED: 'Fulfilled',
    CANCELLED: 'Cancelled',
    CONFIRMED: 'Confirmed Appt',
    COMPLETED: 'Completed Donation',
  };

  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{labelMap[status] ?? status}</span>;
};

export const BloodBankDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tab, setTab]             = useState<Tab>('overview');
  const [reqSearch, setReqSearch] = useState('');
  const [apptSearch, setApptSearch] = useState('');
  const [reqSuccess, setReqSuccess]   = useState('');
  
  const [matchedRequests, setMatchedRequests] = useState<any[]>([]);
  const [appointments, setAppointments]       = useState<any[]>([]);
  const [inventory, setInventory]             = useState<any[]>([]);
  
  // Edit stock state
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editUnits, setEditUnits]     = useState<number>(0);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const name = user?.name || 'Blood Donation Center';

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchMatchedRequests = async () => {
    try {
      const res = await api.get('/blood-requests');
      setMatchedRequests(res.data.data.data);
    } catch (err) {
      console.error('Failed to fetch matched requests', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await api.get('/inventory');
      // Filter system-wide inventory to find only this bank's records
      const filtered = res.data.data.filter((i: any) => i.bloodBank.userId === user?.id);
      
      // Ensure all 8 blood groups have a row representation
      const groups = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
      const mapped = groups.map(g => {
        const match = filtered.find((i: any) => i.bloodType === g);
        return {
          bloodType: g,
          unitsAvailable: match ? match.unitsAvailable : 0,
          id: match ? match.id : null
        };
      });
      setInventory(mapped);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
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

  useEffect(() => {
    fetchMatchedRequests();
    fetchAppointments();
    fetchInventory();
    fetchNotifications();
  }, [tab]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleConfirmInventoryMatch = async (requestId: string) => {
    try {
      await api.post(`/blood-requests/${requestId}/confirm-inventory`);
      setReqSuccess('Match confirmed! Status changed to In Transit.');
      fetchMatchedRequests();
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm match');
    }
  };

  const handleFulfillRequest = async (requestId: string) => {
    try {
      await api.patch(`/blood-requests/${requestId}/status`, { status: 'FULFILLED' });
      setReqSuccess('Request marked delivered and successfully fulfilled!');
      fetchMatchedRequests();
      fetchInventory();
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fulfill request');
    }
  };

  const handleUpdateApptStatus = async (apptId: string, nextStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.patch(`/appointments/${apptId}/status`, { status: nextStatus });
      fetchAppointments();
      fetchInventory();
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleSaveStock = async (bloodType: string) => {
    try {
      await api.put('/inventory', {
        bloodType,
        unitsAvailable: editUnits
      });
      setEditingType(null);
      fetchInventory();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update stock');
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

  const unreadNotifications = notifications.filter(n => !n.read);

  // Filter requests
  const filteredRequests = matchedRequests.filter(r =>
    r.patientName.toLowerCase().includes(reqSearch.toLowerCase()) ||
    r.bloodType.toLowerCase().includes(reqSearch.toLowerCase()) ||
    r.status.toLowerCase().includes(reqSearch.toLowerCase())
  );

  // Filter appointments
  const filteredAppointments = appointments.filter(a =>
    `${a.donor.firstName} ${a.donor.lastName}`.toLowerCase().includes(apptSearch.toLowerCase()) ||
    a.donor.bloodType.toLowerCase().includes(apptSearch.toLowerCase()) ||
    a.status.toLowerCase().includes(apptSearch.toLowerCase())
  );

  const pendingRequests = matchedRequests.filter(r => r.status === 'MATCHED_INVENTORY');
  const transitRequests = matchedRequests.filter(r => r.status === 'IN_DELIVERY');
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');
  const totalUnits = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

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

        {/* Center details card */}
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', margin: '0 0 1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as</p>
          <p style={{ margin: '0.15rem 0 0.4rem', fontWeight: 700, color: 'var(--gray-800)', fontSize: '0.9rem' }}>{name}</p>
          <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Blood Bank Portal</span>
        </div>

        <p className="nav-section-title">Navigation</p>
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={17} /> {label}
            {key === 'requests' && pendingRequests.length > 0 && (
              <span className="badge badge-red" style={{ marginLeft: 'auto', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                {pendingRequests.length}
              </span>
            )}
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
            <p className="page-subtitle">Center Administration Portal · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotifications(s => !s)}
              className="btn btn-secondary" 
              style={{ position: 'relative', padding: '0.6rem', borderRadius: '50%' }}
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

            {/* Notifications Panel */}
            {showNotifications && (
              <div className="card" style={{
                position: 'absolute', top: '100%', right: 0, zIndex: 100,
                width: 320, maxHeight: 400, overflowY: 'auto', marginTop: '0.5rem',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                background: '#fff', textAlign: 'left'
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
          </div>
        </div>

        {reqSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
            <CheckCircle2 size={16} /> <span>{reqSuccess}</span>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="animate-fade-up">
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Units In Stock',        value: totalUnits,                 icon: Package,       color: 'var(--red-600)', bg: 'var(--red-50)' },
                { label: 'Pending Request Claims', value: pendingRequests.length,     icon: ClipboardList, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                { label: 'Active Deliveries',     value: transitRequests.length,     icon: Activity,      color: 'var(--info)',    bg: 'var(--info-bg)' },
                { label: 'Completed Donations',   value: completedAppts.length,      icon: CheckCircle2,  color: 'var(--success)', bg: 'var(--success-bg)' },
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
                    <p style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gray-900)', margin: 0 }}>{c.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick matched requests list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Incoming Blood Requests (Stock Matches)</h3>
                {pendingRequests.length === 0 && transitRequests.length === 0 ? (
                  <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--gray-400)' }}>
                    <ClipboardList size={32} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'inline-block' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No blood request claims assigned.</p>
                  </div>
                ) : (
                  [...pendingRequests, ...transitRequests].map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <span className="blood-pill">{r.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{r.hospital.name}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-500)' }}>Requires {r.unitsRequired} units · Urgency: {r.urgency}</p>
                      </div>
                      <div>
                        {r.status === 'MATCHED_INVENTORY' ? (
                          <button className="btn btn-primary btn-sm" onClick={() => handleConfirmInventoryMatch(r.id)}>Confirm Match</button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleFulfillRequest(r.id)} style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>Mark Delivered</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Status metrics */}
              <div className="card">
                <h3>Appointments Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                  {[
                    { label: 'Pending bookings', val: `${appointments.filter(a => a.status === 'PENDING').length} appts` },
                    { label: 'Confirmed bookings', val: `${appointments.filter(a => a.status === 'CONFIRMED').length} appts` },
                    { label: 'Completed donations', val: `${completedAppts.length} completed` },
                  ].map(m => (
                    <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{m.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-900)' }}>{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── INVENTORY ── */}
        {tab === 'inventory' && (
          <div className="animate-fade-up">
            <h3 style={{ marginBottom: '1.25rem' }}>Stock Management (Units Available)</h3>
            <div className="grid-4" style={{ gap: '1.25rem' }}>
              {inventory.map(item => (
                <div key={item.bloodType} className="card" style={{ textAlign: 'center' }}>
                  <span className="blood-pill blood-pill-lg" style={{ margin: '0 auto 0.75rem' }}>{item.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                  
                  {editingType === item.bloodType ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={editUnits} 
                        onChange={e => setEditUnits(parseInt(e.target.value) || 0)} 
                        style={{ textAlign: 'center', fontSize: '1.2rem', padding: '0.25rem' }} 
                        min={0}
                        max={1000}
                      />
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn btn-primary btn-xs" style={{ flex: 1, padding: '0.3rem', justifyContent: 'center' }} onClick={() => handleSaveStock(item.bloodType)}>Save</button>
                        <button className="btn btn-secondary btn-xs" style={{ flex: 1, padding: '0.3rem', justifyContent: 'center' }} onClick={() => setEditingType(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--red-600)', margin: '0 0 0.5rem' }}>{item.unitsAvailable}</p>
                      <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setEditingType(item.bloodType); setEditUnits(item.unitsAvailable); }}>
                        Edit Stock
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BLOOD REQUESTS ── */}
        {tab === 'requests' && (
          <div className="animate-fade-up">
            <div className="search-box" style={{ marginBottom: '1.25rem' }}>
              <Search size={18} />
              <input className="search-input" placeholder="Search patient, blood type, or status…" value={reqSearch} onChange={e => setReqSearch(e.target.value)} />
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Blood Type</th>
                      <th>Units Required</th>
                      <th>Urgency</th>
                      <th>Required Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>No requests matched to your inventory stock.</td>
                      </tr>
                    ) : (
                      filteredRequests.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.patientName}</td>
                          <td><span className="blood-pill">{r.bloodType.replace('_POS','+').replace('_NEG','-')}</span></td>
                          <td style={{ fontWeight: 700 }}>{r.unitsRequired}</td>
                          <td><StatusBadge status={r.urgency} /></td>
                          <td>{new Date(r.requiredByDate).toLocaleDateString()}</td>
                          <td><StatusBadge status={r.status} /></td>
                          <td>
                            {r.status === 'MATCHED_INVENTORY' && (
                              <button className="btn btn-primary btn-xs" onClick={() => handleConfirmInventoryMatch(r.id)}>Confirm Match</button>
                            )}
                            {r.status === 'IN_DELIVERY' && (
                              <button className="btn btn-primary btn-xs" onClick={() => handleFulfillRequest(r.id)} style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>Mark Delivered</button>
                            )}
                            {r.status === 'FULFILLED' && <span style={{ color: 'var(--success)', fontWeight: 600 }}>Fulfilled</span>}
                            {r.status === 'CANCELLED' && <span style={{ color: 'var(--gray-400)' }}>Cancelled</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS ── */}
        {tab === 'donors' && (
          <div className="animate-fade-up">
            <h3 style={{ marginBottom: '0.75rem' }}>Donation Appointments booked at your center</h3>
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Confirm or complete appointments scheduled by donors.
            </p>
            <div className="search-box" style={{ marginBottom: '1.25rem' }}>
              <Search size={18} />
              <input className="search-input" placeholder="Search donor name, blood type, or status…" value={apptSearch} onChange={e => setApptSearch(e.target.value)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredAppointments.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>
                  <Users size={36} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'inline-block' }} />
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>No matching appointments scheduled</p>
                </div>
              ) : (
                filteredAppointments.map(a => (
                  <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="blood-pill blood-pill-lg">{a.donor.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{a.donor.firstName} {a.donor.lastName}</p>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={12} /> Scheduled: {new Date(a.appointmentDate).toLocaleDateString()} at {a.slot}
                        </p>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                          Phone: {a.donor.phone} 
                          {a.bloodRequest && ` · Linked to request for ${a.bloodRequest.patientName} (${a.bloodRequest.hospital.name})`}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <StatusBadge status={a.status} />
                      {a.status === 'PENDING' && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdateApptStatus(a.id, 'CONFIRMED')}>Confirm</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateApptStatus(a.id, 'CANCELLED')} style={{ color: 'var(--error)' }}>Cancel</button>
                        </>
                      )}
                      {a.status === 'CONFIRMED' && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdateApptStatus(a.id, 'COMPLETED')} style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>Complete Donation</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateApptStatus(a.id, 'CANCELLED')} style={{ color: 'var(--error)' }}>Cancel</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="animate-fade-up">
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="card">
                <h3>Stock Level Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  {inventory.map(item => {
                    const maxCapacity = 100;
                    const pct = Math.min(Math.round((item.unitsAvailable / maxCapacity) * 100), 100);
                    return (
                      <div key={item.bloodType}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <span>{item.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                          <strong>{item.unitsAvailable} units ({pct}%)</strong>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--red-600)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
