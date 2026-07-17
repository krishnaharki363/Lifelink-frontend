import React, { useState } from 'react';
import {
  Droplet, LayoutDashboard, Package, ClipboardList, Users,
  BarChart3, LogOut, Plus, Search, AlertTriangle, CheckCircle2,
  Clock, TrendingUp, Activity, Phone, Mail, MapPin, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'overview' | 'inventory' | 'requests' | 'donors' | 'analytics';

const NAV: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',   label: 'Overview',       icon: LayoutDashboard },
  { key: 'inventory',  label: 'Blood Inventory', icon: Package },
  { key: 'requests',   label: 'Blood Requests',  icon: ClipboardList },
  { key: 'donors',     label: 'Donor Matching',  icon: Users },
  { key: 'analytics',  label: 'Analytics',       icon: BarChart3 },
];

/* ── Mock data ─────────────────────────────────────────────────── */
const INVENTORY = [
  { type: 'A+',  units: 18, capacity: 50, expiringSoon: 2 },
  { type: 'A-',  units: 4,  capacity: 20, expiringSoon: 0 },
  { type: 'B+',  units: 12, capacity: 40, expiringSoon: 1 },
  { type: 'B-',  units: 3,  capacity: 15, expiringSoon: 0 },
  { type: 'O+',  units: 28, capacity: 60, expiringSoon: 4 },
  { type: 'O-',  units: 6,  capacity: 25, expiringSoon: 0 },
  { type: 'AB+', units: 9,  capacity: 20, expiringSoon: 1 },
  { type: 'AB-', units: 2,  capacity: 10, expiringSoon: 0 },
];

const REQUESTS = [
  { id: 'REQ-001', patient: 'Sita Maharjan', ward: 'Surgery',    blood: 'O+',  units: 3, urgency: 'Critical', status: 'Open',      date: '2025-07-17', notes: 'Pre-op transfusion required' },
  { id: 'REQ-002', patient: 'Ram Prasad',    ward: 'ICU',        blood: 'B+',  units: 1, urgency: 'Urgent',   status: 'Matched',   date: '2025-07-16', notes: '' },
  { id: 'REQ-003', patient: 'Kamala Devi',   ward: 'Maternity',  blood: 'A-',  units: 2, urgency: 'Normal',   status: 'Fulfilled', date: '2025-07-15', notes: '' },
  { id: 'REQ-004', patient: 'Bikash Thapa',  ward: 'Emergency',  blood: 'AB-', units: 4, urgency: 'Critical', status: 'Open',      date: '2025-07-17', notes: 'Trauma case' },
  { id: 'REQ-005', patient: 'Sunita Rai',    ward: 'Oncology',   blood: 'O-',  units: 2, urgency: 'Urgent',   status: 'Open',      date: '2025-07-16', notes: 'Chemo prep' },
];

const MATCHED_DONORS = [
  { id: 1, name: 'Ramesh Kumar',    blood: 'O+', city: 'Kathmandu', phone: '+977-9841234567', status: 'Contacted',  lastDonation: '2025-04-10' },
  { id: 2, name: 'Maya Rai',        blood: 'O+', city: 'Lalitpur',  phone: '+977-9867891234', status: 'Available',  lastDonation: '2024-12-05' },
  { id: 3, name: 'Suresh Gurung',   blood: 'B+', city: 'Kathmandu', phone: '+977-9851112233', status: 'Available',  lastDonation: '2025-01-20' },
  { id: 4, name: 'Anita Shrestha',  blood: 'A-', city: 'Pokhara',   phone: '+977-9803334455', status: 'Unavailable',lastDonation: '2025-06-01' },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Open: 'badge-red', Matched: 'badge-blue', Fulfilled: 'badge-green',
    Critical: 'badge-red', Urgent: 'badge-yellow', Normal: 'badge-gray',
    Available: 'badge-green', Contacted: 'badge-blue', Unavailable: 'badge-gray',
  };
  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{status}</span>;
};

/* ── New Request modal ─────────────────────────────────────────── */
type NewReq = { patient: string; ward: string; blood: string; units: string; urgency: string; notes: string };
const EMPTY_REQ: NewReq = { patient: '', ward: '', blood: '', units: '1', urgency: 'Urgent', notes: '' };

export const HospitalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tab, setTab]             = useState<Tab>('overview');
  const [showModal, setShowModal] = useState(false);
  const [newReq, setNewReq]       = useState<NewReq>(EMPTY_REQ);
  const [reqSearch, setReqSearch] = useState('');
  const [donorSearch, setDonorSearch] = useState('');
  const [reqSuccess, setReqSuccess]   = useState('');

  const name = user?.firstName || user?.name || 'Hospital';

  const filteredRequests = REQUESTS.filter(r =>
    r.patient.toLowerCase().includes(reqSearch.toLowerCase()) ||
    r.blood.includes(reqSearch) ||
    r.ward.toLowerCase().includes(reqSearch.toLowerCase())
  );
  const filteredDonors = MATCHED_DONORS.filter(d =>
    d.name.toLowerCase().includes(donorSearch.toLowerCase()) ||
    d.blood.includes(donorSearch)
  );

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setReqSuccess(`Request created for ${newReq.patient} (${newReq.blood}, ${newReq.units} unit(s)).`);
    setShowModal(false);
    setNewReq(EMPTY_REQ);
  };

  const criticalCount = REQUESTS.filter(r => r.urgency === 'Critical' && r.status === 'Open').length;
  const totalUnits    = INVENTORY.reduce((s, i) => s + i.units, 0);
  const lowStock      = INVENTORY.filter(i => i.units / i.capacity < 0.2);

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

        {criticalCount > 0 && (
          <div style={{ background: 'var(--red-50)', border: '1px solid var(--red-200)', borderRadius: 'var(--radius-md)', padding: '0.7rem 0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertTriangle size={14} color="var(--red-600)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--red-700)', fontWeight: 600 }}>{criticalCount} critical request{criticalCount > 1 ? 's' : ''} open</span>
          </div>
        )}

        <p className="nav-section-title">Hospital Portal</p>
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={17} /> {label}
            {key === 'requests' && REQUESTS.filter(r => r.status === 'Open').length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--red-600)', color: '#fff', borderRadius: 'var(--radius-full)', padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
                {REQUESTS.filter(r => r.status === 'Open').length}
              </span>
            )}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <div style={{ padding: '0.6rem 0.85rem', marginBottom: '0.5rem' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--gray-900)' }}>{name}</p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-400)' }}>Hospital Account</p>
          </div>
          <button className="nav-item" onClick={() => void logout()} style={{ color: 'var(--error)' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="dash-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">{NAV.find(n => n.key === tab)?.label}</h1>
            <p className="page-subtitle">{name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          {(tab === 'requests' || tab === 'overview') && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={15} /> New Request
            </button>
          )}
        </div>

        {reqSuccess && (
          <div className="alert alert-success animate-fade-up" style={{ marginBottom: '1.25rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} /><span>{reqSuccess}</span>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="animate-fade-up">
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Blood Units',  value: totalUnits,                                               icon: Package,       color: 'var(--red-600)', bg: 'var(--red-50)' },
                { label: 'Open Requests',      value: REQUESTS.filter(r => r.status === 'Open').length,        icon: ClipboardList, color: 'var(--warning)', bg: 'var(--warning-bg)' },
                { label: 'Critical Alerts',    value: criticalCount,                                            icon: AlertTriangle, color: 'var(--error)',   bg: 'var(--error-bg)' },
                { label: 'Matched Donors',     value: MATCHED_DONORS.filter(d => d.status === 'Available').length, icon: Users,    color: 'var(--success)', bg: 'var(--success-bg)' },
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
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gray-900)', margin: 0 }}>{c.value}</p>
                  </div>
                );
              })}
            </div>

            {lowStock.length > 0 && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span><strong>Low stock alert:</strong> {lowStock.map(s => `${s.type} (${s.units} units)`).join(', ')} — consider requesting restocking.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>
              {/* Inventory summary */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0 }}>Blood Inventory</h3>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-600)' }} onClick={() => setTab('inventory')}>View all →</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {INVENTORY.map(i => {
                    const pct = Math.round((i.units / i.capacity) * 100);
                    const color = pct < 20 ? 'var(--error)' : pct < 40 ? 'var(--warning)' : 'var(--red-600)';
                    return (
                      <div key={i.type} style={{ padding: '0.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: pct < 20 ? '1px solid #fecaca' : '1px solid var(--gray-100)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span className="blood-pill" style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>{i.type}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{i.units}</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        {i.expiringSoon > 0 && <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: 'var(--warning)' }}>⚠ {i.expiringSoon} expiring soon</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent requests */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0 }}>Recent Requests</h3>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-600)' }} onClick={() => setTab('requests')}>View all →</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {REQUESTS.slice(0, 4).map((r, i) => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0', borderBottom: i < 3 ? '1px solid var(--gray-100)' : 'none' }}>
                      <span className="blood-pill">{r.blood}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.patient}</p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-400)' }}>{r.ward} · {r.units} unit(s)</p>
                      </div>
                      <StatusBadge status={r.status} />
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
            {lowStock.length > 0 && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>Critical low stock: {lowStock.map(s => `${s.type} (${s.units} units)`).join(', ')}</span>
              </div>
            )}
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {INVENTORY.map(i => {
                const pct   = Math.round((i.units / i.capacity) * 100);
                const color = pct < 20 ? 'var(--error)' : pct < 40 ? 'var(--warning)' : 'var(--success)';
                const bg    = pct < 20 ? 'var(--error-bg)' : pct < 40 ? 'var(--warning-bg)' : 'var(--success-bg)';
                return (
                  <div key={i.type} className="card" style={{ textAlign: 'center', border: pct < 20 ? '2px solid #fecaca' : '1px solid var(--border)' }}>
                    <span className="blood-pill blood-pill-lg" style={{ margin: '0 auto 1rem' }}>{i.type}</span>
                    <p style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)', color, margin: '0 0 0.25rem' }}>{i.units}</p>
                    <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: 'var(--gray-400)' }}>of {i.capacity} units capacity</p>
                    <div className="progress-bar" style={{ marginBottom: '0.5rem' }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', background: bg, color, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>{pct}% full</span>
                      {i.expiringSoon > 0 && <span style={{ fontSize: '0.72rem', color: 'var(--warning)' }}>⚠ {i.expiringSoon} expiring</span>}
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '0.85rem' }}>
                      Update Stock
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REQUESTS ── */}
        {tab === 'requests' && (
          <div className="animate-fade-up">
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input className="form-input" placeholder="Search patient, blood type, ward…" value={reqSearch} onChange={e => setReqSearch(e.target.value)} style={{ paddingLeft: '2.4rem' }} />
              </div>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Patient</th><th>Ward</th><th>Blood</th><th>Units</th><th>Urgency</th><th>Status</th><th>Date</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--gray-400)' }}>{r.id}</td>
                        <td style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.patient}</td>
                        <td style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>{r.ward}</td>
                        <td><span className="blood-pill">{r.blood}</span></td>
                        <td style={{ fontWeight: 700 }}>{r.units}</td>
                        <td><StatusBadge status={r.urgency} /></td>
                        <td><StatusBadge status={r.status} /></td>
                        <td style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>{r.date}</td>
                        <td style={{ color: 'var(--gray-400)', fontSize: '0.82rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── DONORS ── */}
        {tab === 'donors' && (
          <div className="animate-fade-up">
            <p style={{ color: 'var(--gray-500)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              Donors matched to your open blood requests based on blood type and proximity.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input className="form-input" placeholder="Search donor or blood type…" value={donorSearch} onChange={e => setDonorSearch(e.target.value)} style={{ paddingLeft: '2.4rem' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredDonors.map(d => (
                <div key={d.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', padding: '1.1rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--red-100)', color: 'var(--red-700)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{d.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                        <span className="blood-pill" style={{ width: 'auto', padding: '0.2rem 0.6rem', fontSize: '0.72rem' }}>{d.blood}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={11} />{d.city}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={11} />Last: {d.lastDonation}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <StatusBadge status={d.status} />
                    {d.status === 'Available' && (
                      <>
                        <a href={`tel:${d.phone}`} className="btn btn-secondary btn-sm"><Phone size={13} /> Call</a>
                        <button className="btn btn-primary btn-sm"><Mail size={13} /> Notify</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="animate-fade-up">
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Requests This Month',  value: '28',   icon: ClipboardList, color: 'var(--red-600)' },
                { label: 'Fulfillment Rate',      value: '89%',  icon: CheckCircle2,  color: 'var(--success)' },
                { label: 'Avg Fulfillment Time',  value: '38min',icon: Clock,         color: 'var(--info)' },
                { label: 'Donor Response Rate',   value: '74%',  icon: TrendingUp,    color: 'var(--warning)' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                      <Icon size={17} color={s.color} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600 }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color, margin: 0 }}>{s.value}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Inventory Health</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {INVENTORY.map(i => {
                    const pct = Math.round((i.units / i.capacity) * 100);
                    return (
                      <div key={i.type}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="blood-pill" style={{ width: 'auto', padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}>{i.type}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)' }}>{i.units} / {i.capacity} units</span>
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: pct < 20 ? 'var(--error)' : pct < 40 ? 'var(--warning)' : 'var(--success)' }}>{pct}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: pct < 20 ? 'var(--error)' : pct < 40 ? 'var(--warning)' : 'var(--success)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Request Breakdown</h3>
                {[
                  { label: 'Open requests',        value: REQUESTS.filter(r => r.status === 'Open').length,      total: REQUESTS.length },
                  { label: 'Matched requests',      value: REQUESTS.filter(r => r.status === 'Matched').length,   total: REQUESTS.length },
                  { label: 'Fulfilled this month',  value: REQUESTS.filter(r => r.status === 'Fulfilled').length, total: REQUESTS.length },
                  { label: 'Critical priority',     value: criticalCount,                                          total: REQUESTS.length },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{m.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{m.value}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.round((m.value / m.total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', marginTop: '0.5rem' }}>
                  <Activity size={16} color="var(--success)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>Hospital preparedness: 89%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── New Request Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1rem' }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>New Blood Request</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleNewRequest} style={{ display: 'grid', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Patient Name *</label>
                <input className="form-input" placeholder="Full name" value={newReq.patient} onChange={e => setNewReq({ ...newReq, patient: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Ward / Department *</label>
                  <input className="form-input" placeholder="e.g. ICU, Surgery" value={newReq.ward} onChange={e => setNewReq({ ...newReq, ward: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Type Required *</label>
                  <select className="form-select" value={newReq.blood} onChange={e => setNewReq({ ...newReq, blood: e.target.value })} required>
                    <option value="">Select type</option>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Units Needed *</label>
                  <input className="form-input" type="number" min="1" max="20" value={newReq.units} onChange={e => setNewReq({ ...newReq, units: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Urgency Level *</label>
                  <select className="form-select" value={newReq.urgency} onChange={e => setNewReq({ ...newReq, urgency: e.target.value })}>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-textarea" placeholder="Any important details…" value={newReq.notes} onChange={e => setNewReq({ ...newReq, notes: e.target.value })} style={{ minHeight: 72 }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
