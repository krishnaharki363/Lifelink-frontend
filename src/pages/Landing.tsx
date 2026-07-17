import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets, Heart, Shield, Clock, Users, Building2,
  ChevronRight, Phone, Mail, MapPin,
  ArrowRight, Activity, Star, TrendingUp, Zap
} from 'lucide-react';

const BLOOD_COMPATIBILITY: Record<string, { donate: string[]; receive: string[] }> = {
  'O-':  { donate: ['O-','O+','A-','A+','B-','B+','AB-','AB+'], receive: ['O-'] },
  'O+':  { donate: ['O+','A+','B+','AB+'],                       receive: ['O-','O+'] },
  'A-':  { donate: ['A-','A+','AB-','AB+'],                      receive: ['O-','A-'] },
  'A+':  { donate: ['A+','AB+'],                                  receive: ['O-','O+','A-','A+'] },
  'B-':  { donate: ['B-','B+','AB-','AB+'],                      receive: ['O-','B-'] },
  'B+':  { donate: ['B+','AB+'],                                  receive: ['O-','O+','B-','B+'] },
  'AB-': { donate: ['AB-','AB+'],                                 receive: ['O-','A-','B-','AB-'] },
  'AB+': { donate: ['AB+'],                                       receive: ['O-','O+','A-','A+','B-','B+','AB-','AB+'] },
};

const BLOOD_TYPES = ['O-','O+','A-','A+','B-','B+','AB-','AB+'];

const STATS = [
  { value: '12,400+', label: 'Registered Donors',   icon: Users,     color: 'var(--red-600)' },
  { value: '87',      label: 'Partner Hospitals',   icon: Building2, color: 'var(--info)' },
  { value: '4,200+',  label: 'Lives Saved',         icon: Heart,     color: 'var(--success)' },
  { value: '98%',     label: 'Match Success Rate',  icon: TrendingUp,color: 'var(--warning)' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Matching',
    desc: 'Our algorithm connects the right donor to the right patient in minutes, not hours.',
    color: 'var(--warning)',
    bg: 'var(--warning-bg)',
  },
  {
    icon: Shield,
    title: 'Verified Network',
    desc: 'Every donor and hospital is verified by our team before going live on the platform.',
    color: 'var(--info)',
    bg: 'var(--info-bg)',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    desc: 'Blood emergencies don\'t keep office hours. Our platform is always on.',
    color: 'var(--success)',
    bg: 'var(--success-bg)',
  },
  {
    icon: Activity,
    title: 'Live Inventory',
    desc: 'Hospitals see real-time blood stock levels across all partner blood banks.',
    color: 'var(--red-600)',
    bg: 'var(--red-50)',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Register as a Donor', desc: 'Create your free account, fill in your health profile, and get verified in 24 hours.' },
  { step: '02', title: 'Get Matched',          desc: 'When a hospital near you needs your blood type, you receive an instant notification.' },
  { step: '03', title: 'Donate & Save Lives',  desc: 'Visit the designated center, donate, and track your impact on your dashboard.' },
];

const TESTIMONIALS = [
  { name: 'Dr. Priya Sharma',  role: 'Head of Surgery, Kathmandu General', text: 'LifeLink cut our blood sourcing time from 6 hours to under 45 minutes. It\'s genuinely life-saving technology.', rating: 5 },
  { name: 'Rajan Thapa',       role: 'Blood Donor since 2022',              text: 'I\'ve donated 7 times through LifeLink. The app makes scheduling effortless and I can see exactly who I\'ve helped.', rating: 5 },
  { name: 'Sushma Adhikari',   role: 'Hospital Admin, City Clinic',         text: 'Managing our blood inventory used to be a nightmare. LifeLink gives us complete visibility and control.', rating: 5 },
];

export const Landing: React.FC = () => {
  const [selectedBlood, setSelectedBlood] = useState<string>('');

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'var(--red-600)',
              display: 'grid', placeItems: 'center',
            }}>
              <Droplets size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--gray-900)' }}>
              Life<span style={{ color: 'var(--red-600)' }}>Link</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Become a Donor</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #fff 0%, var(--red-50) 50%, #fff5f5 100%)',
        padding: '5rem 1.5rem 6rem',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 400, height: 400, borderRadius: '50%', background: 'rgba(232,25,44,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(232,25,44,0.04)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--red-50)', border: '1px solid var(--red-200)', borderRadius: 'var(--radius-full)', padding: '0.35rem 1rem', marginBottom: '1.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red-500)', display: 'inline-block' }} className="animate-pulse" />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--red-700)' }}>Over 4,200 lives saved this year</span>
          </div>

          <h1 className="animate-fade-up" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem', animationDelay: '60ms' }}>
            Every Drop Counts.<br />
            <span style={{ color: 'var(--red-600)' }}>Connect. Donate. Save.</span>
          </h1>

          <p className="animate-fade-up" style={{ fontSize: '1.15rem', color: 'var(--gray-500)', maxWidth: '580px', margin: '0 auto 2.5rem', lineHeight: 1.7, animationDelay: '120ms' }}>
            LifeLink bridges blood donors with hospitals in real-time. Whether you're giving or searching — we make it fast, safe, and reliable.
          </p>

          <div className="animate-fade-up" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '180ms' }}>
            <Link to="/register" className="btn btn-primary btn-xl" style={{ gap: '0.6rem' }}>
              Register as Donor <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-xl">
              Hospital / Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────────────────────────── */}
      <section style={{ background: 'var(--gray-900)', padding: '2.5rem 1.5rem' }}>
        <div className="container grid-4" style={{ gap: '0' }}>
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{
                textAlign: 'center', padding: '1rem',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
              }}>
                <Icon size={22} color={s.color} style={{ margin: '0 auto 0.6rem' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.4rem' }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--red-600)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Why LifeLink</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1rem' }}>Built for the moments that matter most</h2>
            <p style={{ color: 'var(--gray-500)', maxWidth: '520px', margin: '0 auto', fontSize: '1.05rem' }}>A platform designed around urgency, trust, and transparency.</p>
          </div>
          <div className="grid-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: f.bg, display: 'grid', placeItems: 'center', margin: '0 auto 1.25rem' }}>
                    <Icon size={26} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.6rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-page)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--red-600)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Process</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>Three steps to save a life</h2>
          </div>
          <div className="grid-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900,
                  color: i === 0 ? 'var(--red-600)' : 'var(--gray-200)',
                  lineHeight: 1, flexShrink: 0, minWidth: '3rem',
                }}>
                  {step.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.92rem', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blood type compatibility finder ─────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--gray-900)' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <Droplets size={36} color="var(--red-400)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', marginBottom: '0.75rem' }}>Blood Type Compatibility</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem' }}>Select your blood type to see who you can donate to and receive from.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                onClick={() => setSelectedBlood(bt === selectedBlood ? '' : bt)}
                style={{
                  width: 60, height: 60, borderRadius: '50%',
                  border: selectedBlood === bt ? '3px solid var(--red-400)' : '2px solid rgba(255,255,255,0.15)',
                  background: selectedBlood === bt ? 'var(--red-600)' : 'rgba(255,255,255,0.05)',
                  color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all var(--t-fast)',
                  transform: selectedBlood === bt ? 'scale(1.12)' : 'scale(1)',
                }}
              >
                {bt}
              </button>
            ))}
          </div>

          {selectedBlood && BLOOD_COMPATIBILITY[selectedBlood] && (
            <div className="animate-scale-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <p style={{ color: 'var(--red-400)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Can Donate To</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {BLOOD_COMPATIBILITY[selectedBlood].donate.map(bt => (
                    <span key={bt} className="blood-pill" style={{ width: 'auto', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>{bt}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <p style={{ color: 'rgba(99,102,241,1)', fontWeight: 700, marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Can Receive From</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {BLOOD_COMPATIBILITY[selectedBlood].receive.map(bt => (
                    <span key={bt} style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-full)', padding: '0.3rem 0.75rem', fontSize: '0.85rem', fontWeight: 700 }}>{bt}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--red-600)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Testimonials</p>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)' }}>Trusted by donors and hospitals</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="var(--warning)" color="var(--warning)" />
                  ))}
                </div>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '1.25rem' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--red-100)', color: 'var(--red-700)',
                    display: 'grid', placeItems: 'center',
                    fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1rem',
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)', margin: 0 }}>{t.name}</p>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.8rem', margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, var(--red-700) 0%, var(--red-600) 60%, var(--red-500) 100%)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <Heart size={40} color="rgba(255,255,255,0.7)" fill="rgba(255,255,255,0.3)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1rem' }}>Ready to make a difference?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Join over 12,000 registered donors. Registration takes less than 5 minutes and your first donation could save up to 3 lives.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: '#fff', color: 'var(--red-700)',
              padding: '0.9rem 2rem', borderRadius: 'var(--radius-full)',
              fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              textDecoration: 'none',
              transition: 'transform var(--t-fast)',
            }}>
              Register Now <ChevronRight size={18} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.4)',
              padding: '0.9rem 2rem', borderRadius: 'var(--radius-full)',
              fontWeight: 600, fontSize: '1rem',
              textDecoration: 'none',
              backdropFilter: 'blur(8px)',
            }}>
              Hospital Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer style={{ background: 'var(--gray-900)', padding: '3rem 1.5rem 2rem', color: 'rgba(255,255,255,0.5)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'var(--red-600)', display: 'grid', placeItems: 'center' }}>
                  <Droplets size={18} color="#fff" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>Life<span style={{ color: 'var(--red-400)' }}>Link</span></span>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, maxWidth: '280px' }}>Connecting blood donors with hospitals to save lives across Nepal and beyond.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> +977-1-4XXXXXX</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> support@lifelink.np</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> Kathmandu, Nepal</span>
              </div>
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Platform</p>
              {['Donor Registration','Hospital Portal','Admin Dashboard','Blood Inventory'].map(l => (
                <p key={l} style={{ marginBottom: '0.6rem', fontSize: '0.875rem' }}>{l}</p>
              ))}
            </div>
            <div>
              <p style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>Resources</p>
              {['Eligibility Guide','Donation FAQ','Blood Types 101','Contact Us'].map(l => (
                <p key={l} style={{ marginBottom: '0.6rem', fontSize: '0.875rem' }}>{l}</p>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem' }}>
            <span>© {new Date().getFullYear()} LifeLink. All rights reserved.</span>
            <span>Built with ❤️ to save lives</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
