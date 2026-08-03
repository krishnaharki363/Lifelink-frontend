import React, { useState, useEffect } from 'react';
import {
  Droplet, LayoutDashboard, Package, ClipboardList, Users,
  BarChart3, LogOut, Plus, Search, AlertTriangle, CheckCircle2,
  Activity, Phone, MapPin, X, Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type Tab = 'overview' | 'inventory' | 'requests' | 'donors' | 'analytics';

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',   label: 'Overview',       icon: LayoutDashboard },
  { key: 'inventory',  label: 'Blood Inventory', icon: Package },
  { key: 'requests',   label: 'Blood Requests',  icon: ClipboardList },
  { key: 'donors',     label: 'Donor Matching',  icon: Users },
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
    Available: 'badge-green',
    Unavailable: 'badge-gray',
  };
  
  const labelMap: Record<string, string> = {
    PENDING: 'Open / Pending',
    MATCHED_INVENTORY: 'Matched (Stock)',
    MATCHED_DONOR: 'Matched (Donor)',
    IN_DELIVERY: 'In Transit',
    FULFILLED: 'Fulfilled',
    CANCELLED: 'Cancelled',
  };

  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{labelMap[status] ?? status}</span>;
};

type NewReq = { patientName: string; ward: string; bloodType: string; unitsRequired: number; urgency: string; requiredByDate: string; notes: string };
const EMPTY_REQ = (): NewReq => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return {
    patientName: '',
    ward: '',
    bloodType: 'O_POS',
    unitsRequired: 1,
    urgency: 'NORMAL',
    requiredByDate: tomorrow.toISOString().split('T')[0],
    notes: ''
  };
};

export const HospitalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tab, setTab]             = useState<Tab>('overview');
  const [showModal, setShowModal] = useState(false);
  const [newReq, setNewReq]       = useState<NewReq>(EMPTY_REQ());
  const [reqSearch, setReqSearch] = useState('');
  const [donorSearchBlood, setDonorSearchBlood] = useState('O_POS');
  const [donorSearchCity, setDonorSearchCity]   = useState('');
  const [reqSuccess, setReqSuccess]   = useState('');
  const [errorMsg, setErrorMsg]       = useState('');
  
  const [requests, setRequests]       = useState<any[]>([]);
  const [systemInventory, setSystemInventory] = useState<any[]>([]);
  const [matchedDonors, setMatchedDonors]     = useState<any[]>([]);
  const [searchingDonors, setSearchingDonors] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const name = user?.name || 'Hospital Center';

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchRequests = async () => {
    try {
      const res = await api.get('/blood-requests');
      setRequests(res.data.data.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  const fetchSystemInventory = async () => {
    try {
      const res = await api.get('/inventory');
      setSystemInventory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch system inventory', err);
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
    fetchRequests();
    fetchSystemInventory();
    fetchNotifications();
  }, [tab]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqSuccess('');
    setErrorMsg('');
    try {
      const requiredByDateIso = new Date(newReq.requiredByDate).toISOString();
      const payload = {
        ...newReq,
        requiredByDate: requiredByDateIso
      };

      const res = await api.post('/blood-requests', payload);
      const created = res.data.data;
      
      if (created.status === 'MATCHED_INVENTORY') {
        setReqSuccess(`Request created successfully! Automatically MATCHED with inventory at ${created.matchedBloodBank?.name || 'a nearby blood bank'}.`);
      } else {
        setReqSuccess('Request created successfully! Pending matching & alerts sent to donors.');
      }
      
      setNewReq(EMPTY_REQ());
      setShowModal(false);
      fetchRequests();
      fetchNotifications();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to create blood request');
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: 'FULFILLED' | 'CANCELLED') => {
    try {
      await api.patch(`/blood-requests/${id}/status`, { status: nextStatus });
      fetchRequests();
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update request status');
    }
  };

  const handleSearchDonors = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchingDonors(true);
    setMatchedDonors([]);
    try {
      const res = await api.get(`/donors/search?bloodType=${donorSearchBlood}&city=${donorSearchCity}`);
      setMatchedDonors(res.data.data.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Donor search failed');
    } finally {
      setSearchingDonors(false);
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

  // Filter requests locally by search term
  const filteredRequests = requests.filter(r =>
    r.patientName.toLowerCase().includes(reqSearch.toLowerCase()) ||
    r.bloodType.toLowerCase().includes(reqSearch.toLowerCase()) ||
    r.status.toLowerCase().includes(reqSearch.toLowerCase())
  );

  const openRequests = requests.filter(r => r.status === 'PENDING');
  const matchedRequests = requests.filter(r => r.status === 'MATCHED_DONOR' || r.status === 'MATCHED_INVENTORY' || r.status === 'IN_DELIVERY');
  const fulfilledRequests = requests.filter(r => r.status === 'FULFILLED');
  const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status === 'PENDING').length;

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

        {/* Hospital details card */}
        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', margin: '0 0 1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as</p>
          <p style={{ margin: '0.15rem 0 0.4rem', fontWeight: 700, color: 'var(--gray-800)', fontSize: '0.9rem' }}>{name}</p>
          <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Hospital Portal</span>
        </div>

        <p className="nav-section-title">Navigation</p>
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={17} /> {label}
            {key === 'requests' && openRequests.length > 0 && (
              <span className="badge badge-red" style={{ marginLeft: 'auto', padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                {openRequests.length}
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
            <p className="page-subtitle">Medical Center Dashboard · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
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

            {/* Notifications panel popover */}
            {showNotifications && (
              <div className="card" style={{
                position: 'absolute', top: '100%', right: 0, zIndex: 100,
                width: 320, maxHeight: 400, overflowY: 'auto', marginTop: '0.5rem',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                background: '#fff'
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
                      background: n.read ? 'transparent' : 'var(--red-50)',
                      textAlign: 'left'
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

            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> New Request
            </button>
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
                { label: 'Open Requests',      value: openRequests.length,        icon: ClipboardList, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                { label: 'Active Matches',     value: matchedRequests.length,     icon: Activity,      color: 'var(--info)',    bg: 'var(--info-bg)' },
                { label: 'Fulfilled Requests', value: fulfilledRequests.length,   icon: CheckCircle2,  color: 'var(--success)', bg: 'var(--success-bg)' },
                { label: 'Critical Requests',  value: criticalCount,              icon: AlertTriangle, color: 'var(--error)',   bg: 'var(--error-bg)' },
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Active Matches list */}
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Matched Blood Requests (Pending Completion)</h3>
                {matchedRequests.length === 0 ? (
                  <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--gray-400)' }}>
                    <Activity size={32} style={{ marginBottom: '0.5rem', opacity: 0.5, display: 'inline-block' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No active matched requests at this time.</p>
                  </div>
                ) : (
                  matchedRequests.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <span className="blood-pill">{r.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{r.patientName}</p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                          {r.status === 'MATCHED_DONOR' ? (
                            `Donor: ${r.matchedDonor.firstName} ${r.matchedDonor.lastName} (${r.matchedDonor.phone})`
                          ) : (
                            `Stock Match: ${r.matchedBloodBank.name} (${r.matchedBloodBank.phone})`
                          )}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(r.id, 'FULFILLED')} style={{ background: 'var(--success)', borderColor: 'var(--success)' }}>Fulfill</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(r.id, 'CANCELLED')}>Cancel</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* System summary */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0 }}>Analytics Summary</h3>
                {[
                  { label: 'Total requests created', val: `${requests.length} requests` },
                  { label: 'Active matches', val: `${matchedRequests.length} matches` },
                  { label: 'Fulfilled requests', val: `${fulfilledRequests.length} closed` },
                  { label: 'Cancellation rate', val: `${Math.round((requests.filter(r => r.status === 'CANCELLED').length / (requests.length || 1)) * 100)}%` },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>{m.label}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-900)' }}>{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── INVENTORY ── */}
        {tab === 'inventory' && (
          <div className="animate-fade-up">
            <h3 style={{ marginBottom: '1.25rem' }}>System-Wide Donation Centers Blood Inventory (Read-Only)</h3>
            {systemInventory.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>No inventory records available.</p>
            ) : (
              <div className="grid-3" style={{ gap: '1rem' }}>
                {systemInventory.map(inv => (
                  <div key={inv.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--gray-800)' }}>{inv.bloodBank.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-400)' }}><MapPin size={10} /> {inv.bloodBank.address}</p>
                      </div>
                      <span className="blood-pill">{inv.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>Available units:</span>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--red-600)' }}>{inv.unitsAvailable}</strong>
                    </div>
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.7rem', color: 'var(--gray-400)', textAlign: 'right' }}>Last updated: {new Date(inv.lastUpdated).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REQUESTS ── */}
        {tab === 'requests' && (
          <div className="animate-fade-up">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div className="search-box" style={{ flex: 1, minWidth: 240 }}>
                <Search size={18} />
                <input className="search-input" placeholder="Search patient name, blood type, or status…" value={reqSearch} onChange={e => setReqSearch(e.target.value)} />
              </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Blood Type</th>
                      <th>Units</th>
                      <th>Urgency</th>
                      <th>Required By</th>
                      <th>Status</th>
                      <th>Matched With</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>No requests found matching your filter.</td>
                      </tr>
                    ) : (
                      filteredRequests.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.patientName}</td>
                          <td><span className="blood-pill">{r.bloodType.replace('_POS','+').replace('_NEG','-')}</span></td>
                          <td>{r.unitsRequired}</td>
                          <td><StatusBadge status={r.urgency} /></td>
                          <td>{new Date(r.requiredByDate).toLocaleDateString()}</td>
                          <td><StatusBadge status={r.status} /></td>
                          <td>
                            {r.status === 'MATCHED_DONOR' && r.matchedDonor && (
                              <div style={{ fontSize: '0.8rem' }}>
                                <strong>{r.matchedDonor.firstName} {r.matchedDonor.lastName}</strong>
                                <br/><span style={{ color: 'var(--gray-400)' }}>{r.matchedDonor.phone}</span>
                              </div>
                            )}
                            {r.status === 'MATCHED_INVENTORY' && r.matchedBloodBank && (
                              <div style={{ fontSize: '0.8rem' }}>
                                <strong>{r.matchedBloodBank.name}</strong>
                                <br/><span style={{ color: 'var(--gray-400)' }}>{r.matchedBloodBank.phone}</span>
                              </div>
                            )}
                            {r.status === 'PENDING' && <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>Searching…</span>}
                            {r.status === 'CANCELLED' && <span style={{ color: 'var(--gray-300)' }}>—</span>}
                            {r.status === 'FULFILLED' && <span style={{ color: 'var(--success)', fontWeight: 600 }}>Completed</span>}
                          </td>
                          <td>
                            {r.status !== 'FULFILLED' && r.status !== 'CANCELLED' ? (
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button className="btn btn-primary btn-xs" onClick={() => handleUpdateStatus(r.id, 'FULFILLED')} style={{ padding: '0.25rem 0.5rem', background: 'var(--success)', borderColor: 'var(--success)' }}>Fulfill</button>
                                <button className="btn btn-secondary btn-xs" onClick={() => handleUpdateStatus(r.id, 'CANCELLED')} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--gray-300)' }}>Closed</span>
                            )}
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

        {/* ── DONORS (Donor Matching Search) ── */}
        {tab === 'donors' && (
          <div className="animate-fade-up">
            <form className="card" onSubmit={handleSearchDonors} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Search Compatible Registered Donors</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label">Blood Type</label>
                  <select className="form-input" value={donorSearchBlood} onChange={e => setDonorSearchBlood(e.target.value)}>
                    {['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'].map(bt => (
                      <option key={bt} value={bt}>{bt.replace('_POS','+').replace('_NEG','-')}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City / Location</label>
                  <input className="form-input" placeholder="Kathmandu, Lalitpur, Pokhara…" value={donorSearchCity} onChange={e => setDonorSearchCity(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.5rem' }} disabled={searchingDonors}>
                  <Search size={16} /> {searchingDonors ? 'Searching…' : 'Find Donors'}
                </button>
              </div>
            </form>

            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Blood Type</th>
                      <th>Location</th>
                      <th>Contact Number</th>
                      <th>Availability</th>
                      <th>Last Donation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matchedDonors.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>
                          {searchingDonors ? 'Searching compatible donors…' : 'No compatible active donors found. Try modifying your search parameters.'}
                        </td>
                      </tr>
                    ) : (
                      matchedDonors.map(d => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>{d.firstName} {d.lastName}</td>
                          <td><span className="blood-pill">{d.bloodType.replace('_POS','+').replace('_NEG','-')}</span></td>
                          <td>{d.city || d.district || d.province || 'Nepal'}</td>
                          <td>
                            <a href={`tel:${d.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--red-600)', textDecoration: 'none', fontWeight: 600 }}>
                              <Phone size={12} /> {d.phone}
                            </a>
                          </td>
                          <td>
                            <span className={`badge ${d.availableToDonate ? 'badge-green' : 'badge-gray'}`}>
                              {d.availableToDonate ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--gray-500)' }}>
                            {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'Never'}
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

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="animate-fade-up">
            <div className="grid-2" style={{ gap: '1.25rem' }}>
              <div className="card">
                <h3>Request Outcomes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  {[
                    { label: 'Open requests',        value: openRequests.length,      total: requests.length },
                    { label: 'Matched requests',      value: matchedRequests.length,   total: requests.length },
                    { label: 'Fulfilled requests',    value: fulfilledRequests.length, total: requests.length },
                  ].map(item => {
                    const pct = Math.round((item.value / (item.total || 1)) * 100);
                    return (
                      <div key={item.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <span>{item.label}</span>
                          <strong>{item.value} ({pct}%)</strong>
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

        {/* ── NEW REQUEST MODAL ── */}
        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
            <div className="card animate-fade-up" style={{ width: '100%', maxWidth: 520, margin: '1rem', position: 'relative' }}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                <X size={20} />
              </button>
              <h2 style={{ marginBottom: '1.5rem' }}>Create Urgent Blood Request</h2>
              
              {errorMsg && (
                <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                  <AlertTriangle size={16} /> <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateRequest} style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Patient Name</label>
                  <input className="form-input" value={newReq.patientName} onChange={e => setNewReq(prev => ({ ...prev, patientName: e.target.value }))} placeholder="Enter patient's full name" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Blood Type</label>
                    <select className="form-input" value={newReq.bloodType} onChange={e => setNewReq(prev => ({ ...prev, bloodType: e.target.value }))}>
                      {['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG'].map(bt => (
                        <option key={bt} value={bt}>{bt.replace('_POS','+').replace('_NEG','-')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Units Needed</label>
                    <input className="form-input" type="number" min={1} max={20} value={newReq.unitsRequired} onChange={e => setNewReq(prev => ({ ...prev, unitsRequired: parseInt(e.target.value) || 1 }))} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Urgency</label>
                    <select className="form-input" value={newReq.urgency} onChange={e => setNewReq(prev => ({ ...prev, urgency: e.target.value }))}>
                      <option value="NORMAL">Normal (within 48h)</option>
                      <option value="URGENT">Urgent (within 12h)</option>
                      <option value="CRITICAL">Critical (Immediate)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Required By</label>
                    <input className="form-input" type="date" min={new Date().toISOString().split('T')[0]} value={newReq.requiredByDate} onChange={e => setNewReq(prev => ({ ...prev, requiredByDate: e.target.value }))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ward / Bed / Notes</label>
                  <textarea className="form-textarea" value={newReq.notes} onChange={e => setNewReq(prev => ({ ...prev, notes: e.target.value }))} placeholder="e.g. ICU Bed 4. Pre-op transfusion preparation." style={{ minHeight: 70 }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.85rem' }}>
                  Post Blood Request
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
