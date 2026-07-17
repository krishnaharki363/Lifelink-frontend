import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Droplets, User, Heart, Calendar, Phone,
  MapPin, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, Check
} from 'lucide-react';

type Step = 'personal' | 'health' | 'availability' | 'emergency' | 'consent';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'personal',     label: 'Personal',     icon: User },
  { key: 'health',       label: 'Health',        icon: Heart },
  { key: 'availability', label: 'Availability',  icon: Calendar },
  { key: 'emergency',    label: 'Emergency',     icon: Phone },
  { key: 'consent',      label: 'Consent',       icon: CheckCircle2 },
];

const BLOOD_TYPES = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export const DonorRegistration: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('personal');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Personal
  const [fullName, setFullName]       = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender]           = useState('');
  const [bloodGroup, setBloodGroup]   = useState('');
  const [phone, setPhone]             = useState('');
  const [email, setEmail]             = useState(user?.email || '');
  const [province, setProvince]       = useState('');
  const [district, setDistrict]       = useState('');
  const [municipality, setMunicipality] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Health
  const [weight, setWeight]                   = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [donatedBefore, setDonatedBefore]     = useState('no');
  const [currentlyHealthy, setCurrentlyHealthy] = useState('yes');
  const [onMedication, setOnMedication]       = useState('no');
  const [medicalConditions, setMedicalConditions] = useState('no');
  const [medicalConditionsDetails, setMedicalConditionsDetails] = useState('');

  // Availability
  const [availableToDonate, setAvailableToDonate] = useState('yes');
  const [preferredContactMethod, setPreferredContactMethod] = useState('phone');

  // Emergency
  const [emergencyName, setEmergencyName]             = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone]           = useState('');

  // Consent
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    if (user?.role === 'DONOR') navigate('/donor');
  }, [user, navigate]);

  const stepIndex = STEPS.findIndex(s => s.key === step);

  const canProceed = (): boolean => {
    switch (step) {
      case 'personal':
        return !!(fullName && dateOfBirth && gender && bloodGroup && phone && province && district && municipality && fullAddress && password && confirmPassword);
      case 'health':
        return !!(weight && currentlyHealthy);
      case 'availability':
        return !!preferredContactMethod;
      case 'emergency':
        return true;
      case 'consent':
        return consentAccepted;
    }
  };

  const goNext = () => {
    if (!canProceed()) { setError('Please fill in all required fields.'); return; }
    if (step === 'personal' && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setError('');
    setStep(STEPS[stepIndex + 1].key);
  };

  const goBack = () => {
    setError('');
    setStep(STEPS[stepIndex - 1].key);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAccepted) { setError('You must accept the consent to register.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        fullName, dateOfBirth, gender, bloodGroup, phone,
        email: email || null, province, district, municipality,
        address: fullAddress, password, role: 'DONOR',
        health: {
          weight, lastDonationDate: lastDonationDate || null,
          donatedBefore: donatedBefore === 'yes',
          currentlyHealthy: currentlyHealthy === 'yes',
          onMedication: onMedication === 'yes',
          medicalConditions: medicalConditions === 'yes' ? medicalConditionsDetails : null,
        },
        availability: { availableToDonate: availableToDonate === 'yes', preferredContactMethod },
        emergencyContact: emergencyName
          ? { name: emergencyName, relationship: emergencyRelationship, phone: emergencyPhone }
          : null,
      };
      const response = await api.post('/auth/register', payload);
      const data = response.data?.data ?? response.data;
      if (data?.accessToken && data?.user) {
        login(data.accessToken, data.user);
        setSuccess('Registration successful! Redirecting…');
        setTimeout(() => navigate('/donor'), 1400);
      } else {
        setSuccess('Registration successful! Please sign in.');
        setTimeout(() => navigate('/login'), 1400);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message || e?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--red-600)', display: 'grid', placeItems: 'center' }}>
              <Droplets size={20} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--gray-900)' }}>
              Life<span style={{ color: 'var(--red-600)' }}>Link</span>
            </span>
          </Link>
          <span style={{ color: 'var(--gray-300)', marginLeft: '0.25rem' }}>/</span>
          <span style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Donor Registration</span>
        </div>

        {/* Progress stepper */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done    = i < stepIndex;
              const current = i === stepIndex;
              return (
                <React.Fragment key={s.key}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: '0 0 auto' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center',
                      background: done ? 'var(--success)' : current ? 'var(--red-600)' : 'var(--gray-100)',
                      color: done || current ? '#fff' : 'var(--gray-400)',
                      transition: 'all var(--t-smooth)',
                      fontSize: '0.8rem', fontWeight: 700,
                    }}>
                      {done ? <Check size={16} /> : <Icon size={16} />}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: current ? 700 : 500, color: current ? 'var(--red-600)' : done ? 'var(--success)' : 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < stepIndex ? 'var(--success)' : 'var(--gray-200)', margin: '0 0.4rem', marginBottom: '1.2rem', transition: 'background var(--t-smooth)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form card */}
        <div className="card animate-fade-up">
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>
              {step === 'personal'     && 'Personal Information'}
              {step === 'health'       && 'Health Details'}
              {step === 'availability' && 'Donation Availability'}
              {step === 'emergency'    && 'Emergency Contact'}
              {step === 'consent'      && 'Consent & Submit'}
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', margin: 0 }}>Step {stepIndex + 1} of {STEPS.length}</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /><span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} /><span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ── Step 1: Personal ─────────────────────────── */}
            {step === 'personal' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" type="text" placeholder="Jane Doe" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth *</label>
                    <input className="form-input" type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select className="form-select" value={gender} onChange={e => setGender(e.target.value)} required>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other / Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Blood Group *</label>
                    <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} required>
                      <option value="">Select blood group</option>
                      {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-input" type="tel" placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'grid', gap: '1rem' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.85rem', margin: 0 }}>
                    <MapPin size={14} /> Address Details
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Province *</label>
                      <input className="form-input" type="text" placeholder="Bagmati" value={province} onChange={e => setProvince(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">District *</label>
                      <input className="form-input" type="text" placeholder="Kathmandu" value={district} onChange={e => setDistrict(e.target.value)} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Municipality / City *</label>
                    <input className="form-input" type="text" placeholder="Kathmandu Metropolitan City" value={municipality} onChange={e => setMunicipality(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Address *</label>
                    <textarea className="form-textarea" placeholder="House number, street, ward number…" value={fullAddress} onChange={e => setFullAddress(e.target.value)} style={{ minHeight: 80 }} required />
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input className="form-input" type="password" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input className="form-input" type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Health ───────────────────────────── */}
            {step === 'health' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Weight (kg) *</label>
                    <input className="form-input" type="number" placeholder="65" min="45" max="200" value={weight} onChange={e => setWeight(e.target.value)} required />
                    <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: '0.2rem' }}>Minimum 45 kg required to donate</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Blood Donation Date</label>
                    <input className="form-input" type="date" value={lastDonationDate} onChange={e => setLastDonationDate(e.target.value)} />
                  </div>
                </div>
                {[
                  { label: 'Have you donated blood before? *', val: donatedBefore, set: setDonatedBefore, opts: [['no','No'],['yes','Yes']] },
                  { label: 'Are you currently in good health? *', val: currentlyHealthy, set: setCurrentlyHealthy, opts: [['yes','Yes'],['no','No']] },
                  { label: 'Are you taking any medication? *', val: onMedication, set: setOnMedication, opts: [['no','No'],['yes','Yes']] },
                  { label: 'Do you have any known medical conditions? *', val: medicalConditions, set: setMedicalConditions, opts: [['no','No'],['yes','Yes']] },
                ].map(({ label, val, set, opts }) => (
                  <div key={label} className="form-group">
                    <label className="form-label">{label}</label>
                    <select className="form-select" value={val} onChange={e => set(e.target.value)}>
                      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
                {medicalConditions === 'yes' && (
                  <div className="form-group">
                    <label className="form-label">Please describe your condition(s)</label>
                    <textarea className="form-textarea" placeholder="Briefly describe any ongoing medical conditions…" value={medicalConditionsDetails} onChange={e => setMedicalConditionsDetails(e.target.value)} />
                  </div>
                )}
                <div className="alert alert-info" style={{ marginTop: '0.25rem' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>All health information is kept strictly confidential and used only for donor eligibility assessment.</span>
                </div>
              </div>
            )}

            {/* ── Step 3: Availability ─────────────────────── */}
            {step === 'availability' && (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Are you currently available to donate? *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                    {[['yes','Yes, I\'m available'],['no','Not right now']].map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setAvailableToDonate(v)} style={{
                        padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left',
                        border: `2px solid ${availableToDonate === v ? 'var(--red-500)' : 'var(--border)'}`,
                        background: availableToDonate === v ? 'var(--red-50)' : '#fff',
                        color: availableToDonate === v ? 'var(--red-700)' : 'var(--gray-700)',
                        fontWeight: availableToDonate === v ? 700 : 500,
                        cursor: 'pointer', transition: 'all var(--t-fast)',
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Contact Method *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.25rem' }}>
                    {[['phone','📞 Phone Call'],['sms','💬 SMS'],['email','✉️ Email']].map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setPreferredContactMethod(v)} style={{
                        padding: '0.9rem 0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center',
                        border: `2px solid ${preferredContactMethod === v ? 'var(--red-500)' : 'var(--border)'}`,
                        background: preferredContactMethod === v ? 'var(--red-50)' : '#fff',
                        color: preferredContactMethod === v ? 'var(--red-700)' : 'var(--gray-600)',
                        fontWeight: preferredContactMethod === v ? 700 : 500,
                        cursor: 'pointer', fontSize: '0.9rem', transition: 'all var(--t-fast)',
                      }}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 4: Emergency Contact ─────────────────── */}
            {step === 'emergency' && (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div className="alert alert-warning">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>Optional, but recommended. This person will be contacted in case of any medical emergency during donation.</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Contact Person's Name</label>
                    <input className="form-input" type="text" placeholder="Jane Doe" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <input className="form-input" type="text" placeholder="e.g. Sister, Friend" value={emergencyRelationship} onChange={e => setEmergencyRelationship(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" type="tel" placeholder="9876543210" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} />
                </div>
              </div>
            )}

            {/* ── Step 5: Consent ───────────────────────────── */}
            {step === 'consent' && (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--gray-800)' }}>Donor Consent Statement</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                    <p>By registering as a donor on LifeLink, I confirm that:</p>
                    {[
                      'All information I have provided is truthful and accurate to the best of my knowledge.',
                      'I am voluntarily registering as a blood donor and understand the donation process.',
                      'I consent to LifeLink contacting me when a blood type match is needed in my area.',
                      'I understand that my health information will be kept strictly confidential.',
                      'I acknowledge that final eligibility will be assessed by medical staff at the time of donation.',
                    ].map((point, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--success-bg)', border: '1px solid #a7f3d0', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                          <Check size={11} color="var(--success)" />
                        </div>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <label style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" checked={consentAccepted} onChange={e => setConsentAccepted(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--red-600)', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.92rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>
                    I have read and agree to the consent statement above. I voluntarily register as a blood donor on LifeLink.
                  </span>
                </label>
              </div>
            )}

            {/* ── Navigation buttons ────────────────────────── */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <button type="button" onClick={goBack} disabled={stepIndex === 0} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', opacity: stepIndex === 0 ? 0.4 : 1 }}>
                <ChevronLeft size={16} /> Back
              </button>
              {step !== 'consent' ? (
                <button type="button" onClick={goNext} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting || !consentAccepted} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  {isSubmitting
                    ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Registering…</>
                    : <><CheckCircle2 size={16} /> Submit Registration</>}
                </button>
              )}
            </div>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--gray-400)', fontSize: '0.85rem' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--red-600)', fontWeight: 600 }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};
