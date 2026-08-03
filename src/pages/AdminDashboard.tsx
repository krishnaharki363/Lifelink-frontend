import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Building2, Droplets, BarChart3,
  LogOut, Droplet, ShieldCheck, Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type Tab = 'overview' | 'donors' | 'hospitals' | 'requests' | 'analytics';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    // Donor statuses
    Verified: 'badge-green',
    Pending: 'badge-yellow',
    Suspended: 'badge-gray',
    // Hospital statuses
    Active: 'badge-green',
    Inactive: 'badge-gray',
    // Request statuses
    PENDING: 'badge-yellow',
    MATCHED_INVENTORY: 'badge-blue',
    MATCHED_DONOR: 'badge-blue',
    IN_DELIVERY: 'badge-yellow',
    FULFILLED: 'badge-green',
    CANCELLED: 'badge-gray',
    // Urgency statuses
    NORMAL: 'badge-gray',
    URGENT: 'badge-yellow',
    CRITICAL: 'badge-red',
  };

  const labelMap: Record<string, string> = {
    PENDING: 'Pending Match',
    MATCHED_INVENTORY: 'Matched (Stock)',
    MATCHED_DONOR: 'Matched (Donor)',
    IN_DELIVERY: 'In Transit',
    FULFILLED: 'Fulfilled',
    CANCELLED: 'Cancelled',
  };

  return <span className={`badge ${map[status] ?? 'badge-gray'}`}>{labelMap[status] ?? status}</span>;
};

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
  const [requestSearch, setRequestSearch] = useState('');
  const name = user?.firstName || user?.name || 'Admin';

  // API State
  const [metrics, setMetrics] = useState<any>({
    users: { total: 0, byRole: {} },
    activeBloodRequests: 0,
    totalBloodUnitsAvailable: 0
  });
  const [activity, setActivity] = useState<any>({ recentRequests: [], recentUsers: [] });
  const [bloodStock, setBloodStock] = useState<any[]>([]);
  const [donorsList, setDonorsList] = useState<any[]>([]);
  const [hospitalsList, setHospitalsList] = useState<any[]>([]);
  const [requestsList, setRequestsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ─── Fetching Data ─────────────────────────────────────────────────────────

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [metRes, actRes, stockRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/activity'),
        api.get('/admin/inventory')
      ]);
      setMetrics(metRes.data.data);
      setActivity(actRes.data.data);
      setBloodStock(stockRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabDetails = async () => {
    setLoading(true);
    try {
      if (tab === 'donors') {
        const res = await api.get('/admin/donors');
        setDonorsList(res.data.data);
      } else if (tab === 'hospitals') {
        const res = await api.get('/admin/hospitals');
        setHospitalsList(res.data.data);
      } else if (tab === 'requests') {
        const res = await api.get('/admin/requests');
        setRequestsList(res.data.data);
      } else if (tab === 'analytics') {
        const res = await api.get('/admin/inventory');
        setBloodStock(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'overview') {
      fetchOverviewData();
    } else {
      fetchTabDetails();
    }
  }, [tab]);

  // Filters
  const filteredDonors = donorsList.filter(d =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(donorSearch.toLowerCase()) ||
    d.bloodType.includes(donorSearch.toUpperCase()) ||
    d.city.toLowerCase().includes(donorSearch.toLowerCase())
  );

  const filteredHospitals = hospitalsList.filter(h =>
    h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    h.city.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  const filteredRequests = requestsList.filter(r =>
    r.patientName.toLowerCase().includes(requestSearch.toLowerCase()) ||
    r.bloodType.includes(requestSearch.toUpperCase()) ||
    r.status.toLowerCase().includes(requestSearch.toLowerCase())
  );

  // Grouped active users calculations
  const totalDonors = metrics.users.byRole['DONOR'] || 0;
  const totalHospitals = metrics.users.byRole['HOSPITAL'] || 0;
  const totalBanks = metrics.users.byRole['BLOOD_BANK'] || 0;

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

        <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', margin: '0 0 1.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>Administrator</p>
          <p style={{ margin: '0.15rem 0 0.4rem', fontWeight: 700, color: 'var(--gray-800)', fontSize: '0.9rem' }}>{name}</p>
          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>System Admin</span>
        </div>

        <p className="nav-section-title">Management</p>
        {NAV.map(({ key, label, icon: Icon }) => (
          <button key={key} className={`nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <Icon size={17} className="nav-icon" /> {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <button className="nav-item" onClick={() => void logout()} style={{ color: 'var(--error)' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dash-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h1 className="page-title">{NAV.find(n => n.key === tab)?.label}</h1>
            <p className="page-subtitle">LifeLink Aggregate Command Hub · {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {loading && (
          <div style={{ padding: '1rem 0', color: 'var(--red-600)', fontWeight: 600 }}>Syncing database data…</div>
        )}

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="animate-fade-up">
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Donors',       value: totalDonors,                 icon: Users,           color: 'var(--red-600)', bg: 'var(--red-50)' },
                { label: 'Total Hospitals',    value: totalHospitals,              icon: Building2,       color: 'var(--info)',    bg: 'var(--info-bg)' },
                { label: 'Open Blood Requests',value: metrics.activeBloodRequests, icon: Droplets,        color: 'var(--warning)', bg: 'var(--warning-bg)' },
                { label: 'Global Stock Units', value: metrics.totalBloodUnitsAvailable, icon: ShieldCheck, color: 'var(--success)', bg: 'var(--success-bg)' },
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
                    <p style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--gray-900)', margin: 0 }}>{c.value}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem' }}>
              {/* Recent Activity feed */}
              <div className="card">
                <h3 style={{ marginBottom: '1.25rem' }}>Recent Platform Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activity.recentRequests.length === 0 && activity.recentUsers.length === 0 ? (
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem', textAlign: 'center' }}>No recent activity records</p>
                  ) : (
                    <>
                      {activity.recentRequests.slice(0, 4).map((r: any) => (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--red-50)', color: 'var(--red-600)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <Droplet size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>Request for {r.bloodType.replace('_POS','+').replace('_NEG','-')} from {r.hospital.name}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-400)' }}>Status: {r.status} · {new Date(r.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {activity.recentUsers.slice(0, 4).map((u: any) => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--info-bg)', color: 'var(--info)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <Users size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>New User Registered: {u.email}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--gray-400)' }}>Role: {u.role} · Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* System details */}
              <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Registered Profiles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Donors registered</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--gray-900)' }}>{totalDonors} profiles</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Hospitals active</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--gray-900)' }}>{totalHospitals} medical centers</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Blood banks</span>
                    <strong style={{ fontSize: '0.85rem', color: 'var(--gray-900)' }}>{totalBanks} centers</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DONORS TABLE ── */}
        {tab === 'donors' && (
          <div className="animate-fade-up">
            <div className="search-box" style={{ marginBottom: '1.25rem' }}>
              <Search size={18} />
              <input className="search-input" placeholder="Search by name, blood type, or location…" value={donorSearch} onChange={e => setDonorSearch(e.target.value)} />
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Donor Name</th>
                      <th>Blood Type</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Last Donation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonors.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>No donors registered in system.</td>
                      </tr>
                    ) : (
                      filteredDonors.map(d => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>{d.firstName} {d.lastName}</td>
                          <td><span className="blood-pill">{d.bloodType.replace('_POS','+').replace('_NEG','-')}</span></td>
                          <td>{d.user.email}</td>
                          <td>{d.phone}</td>
                          <td>{d.city || d.district || d.province || 'Nepal'}</td>
                          <td><StatusBadge status={d.user.isActive ? 'Verified' : 'Suspended'} /></td>
                          <td>{d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'Never'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── HOSPITALS TABLE ── */}
        {tab === 'hospitals' && (
          <div className="animate-fade-up">
            <div className="search-box" style={{ marginBottom: '1.25rem' }}>
              <Search size={18} />
              <input className="search-input" placeholder="Search hospitals by name or location…" value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} />
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Hospital Name</th>
                      <th>License Number</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Requests Created</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHospitals.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>No hospitals registered.</td>
                      </tr>
                    ) : (
                      filteredHospitals.map(h => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 600 }}>{h.name}</td>
                          <td style={{ fontFamily: 'monospace' }}>{h.licenseNumber}</td>
                          <td>{h.user.email}</td>
                          <td>{h.phone}</td>
                          <td>{h.address}</td>
                          <td>{h.bloodRequests.length}</td>
                          <td><StatusBadge status={h.user.isActive ? 'Active' : 'Inactive'} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── BLOOD REQUESTS TABLE ── */}
        {tab === 'requests' && (
          <div className="animate-fade-up">
            <div className="search-box" style={{ marginBottom: '1.25rem' }}>
              <Search size={18} />
              <input className="search-input" placeholder="Search requests by patient, blood type, or status…" value={requestSearch} onChange={e => setRequestSearch(e.target.value)} />
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Hospital</th>
                      <th>Patient Name</th>
                      <th>Blood Type</th>
                      <th>Units</th>
                      <th>Urgency</th>
                      <th>Required By</th>
                      <th>Status</th>
                      <th>Matched Partner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--gray-400)' }}>No blood requests registered in the platform.</td>
                      </tr>
                    ) : (
                      filteredRequests.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 600 }}>{r.hospital.name}</td>
                          <td>{r.patientName}</td>
                          <td><span className="blood-pill">{r.bloodType.replace('_POS','+').replace('_NEG','-')}</span></td>
                          <td>{r.unitsRequired}</td>
                          <td><StatusBadge status={r.urgency} /></td>
                          <td>{new Date(r.requiredByDate).toLocaleDateString()}</td>
                          <td><StatusBadge status={r.status} /></td>
                          <td>
                            {r.matchedDonor && (
                              <span style={{ fontSize: '0.85rem' }}>Donor: {r.matchedDonor.firstName} {r.matchedDonor.lastName}</span>
                            )}
                            {r.matchedBloodBank && (
                              <span style={{ fontSize: '0.85rem' }}>Bank: {r.matchedBloodBank.name}</span>
                            )}
                            {!r.matchedDonor && !r.matchedBloodBank && (
                              <span style={{ color: 'var(--gray-300)' }}>—</span>
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

        {/* ── ANALYTICS STOCK CHART ── */}
        {tab === 'analytics' && (
          <div className="animate-fade-up">
            <div className="card">
              <h3>Global Aggregated Blood Stock (System Total Units)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.25rem' }}>
                {bloodStock.length === 0 ? (
                  <p style={{ color: 'var(--gray-400)', fontSize: '0.9rem' }}>No stock inventory available in system.</p>
                ) : (
                  bloodStock.map(stock => {
                    const maxVal = Math.max(...bloodStock.map((s: any) => s.totalUnits || 0), 100);
                    const pct = Math.round((stock.totalUnits / maxVal) * 100);
                    return (
                      <div key={stock.bloodType}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                          <span>{stock.bloodType.replace('_POS','+').replace('_NEG','-')}</span>
                          <strong>{stock.totalUnits} units ({pct}%)</strong>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--red-600)' }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
