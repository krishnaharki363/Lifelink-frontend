import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type FormStep = 'personal' | 'health' | 'availability' | 'emergency' | 'consent';

export const DonorRegistration: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Personal Information
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [email] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Health Information
  const [weight, setWeight] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('no');
  const [medicalConditionsDetails, setMedicalConditionsDetails] = useState('');
  const [onMedication, setOnMedication] = useState('no');
  const [recentSurgery, setRecentSurgery] = useState('no');
  const [currentlyHealthy, setCurrentlyHealthy] = useState('yes');

  // Availability
  const [availableNow, setAvailableNow] = useState('no');
  const [preferredCenter, setPreferredCenter] = useState('');
  const [preferredContact, setPreferredContact] = useState('phone');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Consent
  const [consentAccuracy, setConsentAccuracy] = useState(false);
  const [consentContact, setConsentContact] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [wantToDonateNow, setWantToDonateNow] = useState(false);

  const steps: { key: FormStep; label: string }[] = [
    { key: 'personal', label: 'Personal' },
    { key: 'health', label: 'Health' },
    { key: 'availability', label: 'Availability' },
    { key: 'emergency', label: 'Emergency' },
    { key: 'consent', label: 'Consent' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!consentAccuracy || !consentContact || !consentPrivacy) {
      setError('Please agree to all consent terms to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName,
        dateOfBirth,
        gender,
        bloodGroup,
        phone,
        email,
        address,
        city,
        weight,
        lastDonationDate: lastDonationDate || null,
        medicalConditions: medicalConditions === 'yes' ? medicalConditionsDetails : null,
        onMedication: onMedication === 'yes',
        recentSurgery: recentSurgery === 'yes',
        currentlyHealthy: currentlyHealthy === 'yes',
        availableNow: availableNow === 'yes',
        preferredCenter,
        preferredContact,
        emergencyContact: emergencyName
          ? { name: emergencyName, relationship: emergencyRelationship, phone: emergencyPhone }
          : null,
        wantToDonateNow,
      };

      await api.post('/donor/complete-profile', payload);
      setSuccess('Registration completed successfully! Your profile is now pending approval.');
      // Redirect to dashboard after a delay
      setTimeout(() => {
        window.location.href = '/donor';
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'personal':
        return fullName && dateOfBirth && gender && bloodGroup && phone && address && city;
      case 'health':
        return weight && currentlyHealthy;
      case 'availability':
        return preferredContact;
      case 'emergency':
        return true; // Emergency contact is optional
      case 'consent':
        return consentAccuracy && consentContact && consentPrivacy;
      default:
        return false;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Progress Indicator */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {steps.map((step) => (
              <button
                key={step.key}
                type="button"
                onClick={() => setCurrentStep(step.key)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #e6e6e6',
                  background: currentStep === step.key ? '#111111' : '#fff',
                  color: currentStep === step.key ? 'white' : '#111111',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-panel" style={{ background: '#fff', border: '1px solid #e6e6e6' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>
            {currentStep === 'personal' && 'Personal Information'}
            {currentStep === 'health' && 'Health Information'}
            {currentStep === 'availability' && 'Availability'}
            {currentStep === 'emergency' && 'Emergency Contact'}
            {currentStep === 'consent' && 'Consent & Agreement'}
          </h2>

          {error && (
            <div style={{ background: '#f7f7f7', color: '#111111', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #e6e6e6', display: 'flex', gap: '0.75rem' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ background: '#f7f7f7', color: '#111111', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #e6e6e6', display: 'flex', gap: '0.75rem' }}>
              <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Personal Information */}
            {currentStep === 'personal' && (
              <>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                  <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date of Birth</label>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Blood Group</label>
                    <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required>
                      <option value="">Select blood group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
                    <input type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Address</label>
                  <input type="text" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>City/District</label>
                  <input type="text" placeholder="Kathmandu" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
              </>
            )}

            {/* Health Information */}
            {currentStep === 'health' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Weight (kg)</label>
                    <input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Last Blood Donation</label>
                    <input type="date" value={lastDonationDate} onChange={(e) => setLastDonationDate(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Any major medical conditions?</label>
                  <select value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                {medicalConditions === 'yes' && (
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Please specify</label>
                    <textarea placeholder="Describe your medical condition" value={medicalConditionsDetails} onChange={(e) => setMedicalConditionsDetails(e.target.value)} style={{ minHeight: '80px' }} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Currently taking medication?</label>
                  <select value={onMedication} onChange={(e) => setOnMedication(e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Had surgery recently?</label>
                  <select value={recentSurgery} onChange={(e) => setRecentSurgery(e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Currently feeling healthy?</label>
                  <select value={currentlyHealthy} onChange={(e) => setCurrentlyHealthy(e.target.value)} required>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </>
            )}

            {/* Availability */}
            {currentStep === 'availability' && (
              <>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Available to donate now?</label>
                  <select value={availableNow} onChange={(e) => setAvailableNow(e.target.value)}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Preferred donation center (optional)</label>
                  <input type="text" placeholder="e.g. Red Cross Center, City Hospital" value={preferredCenter} onChange={(e) => setPreferredCenter(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Preferred contact method</label>
                  <select value={preferredContact} onChange={(e) => setPreferredContact(e.target.value)} required>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </>
            )}

            {/* Emergency Contact */}
            {currentStep === 'emergency' && (
              <>
                <p style={{ color: 'var(--text-300)', fontSize: '0.9rem', marginBottom: '1rem' }}>Emergency contact information is optional but recommended.</p>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Emergency Contact Name</label>
                  <input type="text" placeholder="Jane Doe" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Relationship</label>
                  <input type="text" placeholder="e.g. Sister, Mother, Friend" value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Phone Number</label>
                  <input type="tel" placeholder="9876543210" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                </div>
              </>
            )}

            {/* Consent */}
            {currentStep === 'consent' && (
              <>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    id="consent1"
                    checked={consentAccuracy}
                    onChange={(e) => setConsentAccuracy(e.target.checked)}
                    style={{ marginTop: '0.3rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="consent1" style={{ cursor: 'pointer', flex: 1 }}>
                    I confirm that the information provided is accurate and complete.
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    id="consent2"
                    checked={consentContact}
                    onChange={(e) => setConsentContact(e.target.checked)}
                    style={{ marginTop: '0.3rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="consent2" style={{ cursor: 'pointer', flex: 1 }}>
                    I agree to be contacted by the organization when blood is needed.
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <input
                    type="checkbox"
                    id="consent3"
                    checked={consentPrivacy}
                    onChange={(e) => setConsentPrivacy(e.target.checked)}
                    style={{ marginTop: '0.3rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="consent3" style={{ cursor: 'pointer', flex: 1 }}>
                    I agree to the privacy policy and terms of service.
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e6e6e6' }}>
                  <input
                    type="checkbox"
                    id="donate-now"
                    checked={wantToDonateNow}
                    onChange={(e) => setWantToDonateNow(e.target.checked)}
                    style={{ marginTop: '0.3rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="donate-now" style={{ cursor: 'pointer', flex: 1 }}>
                    <strong>I want to donate blood now and request to be contacted</strong>
                  </label>
                </div>
              </>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  const currentIdx = steps.findIndex((s) => s.key === currentStep);
                  if (currentIdx > 0) {
                    setCurrentStep(steps[currentIdx - 1].key);
                    setError('');
                  }
                }}
                disabled={currentStep === 'personal'}
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  borderRadius: '10px',
                  border: '1px solid #e6e6e6',
                  background: '#fff',
                  cursor: currentStep === 'personal' ? 'not-allowed' : 'pointer',
                  opacity: currentStep === 'personal' ? 0.5 : 1,
                }}
              >
                Back
              </button>
              {currentStep !== 'consent' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (canProceedToNext()) {
                      const currentIdx = steps.findIndex((s) => s.key === currentStep);
                      setCurrentStep(steps[currentIdx + 1].key);
                      setError('');
                    } else {
                      setError('Please fill in all required fields before proceeding.');
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '10px',
                    background: '#111111',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '0.8rem',
                    borderRadius: '10px',
                    background: '#111111',
                    color: 'white',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Completing...' : 'Complete Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
