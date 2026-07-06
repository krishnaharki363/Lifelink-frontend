
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type FormStep = 'personal' | 'health' | 'availability' | 'emergency' | 'consent';

export const DonorRegistration: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('personal');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [weight, setWeight] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [donatedBefore, setDonatedBefore] = useState('no');
  const [currentlyHealthy, setCurrentlyHealthy] = useState('yes');
  const [onMedication, setOnMedication] = useState('no');
  const [medicalConditions, setMedicalConditions] = useState('no');
  const [medicalConditionsDetails, setMedicalConditionsDetails] = useState('');

  const [availableToDonate, setAvailableToDonate] = useState('yes');
  const [preferredContactMethod, setPreferredContactMethod] = useState('phone');

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [consentAccepted, setConsentAccepted] = useState(false);

  const steps: { key: FormStep; label: string }[] = [
    { key: 'personal', label: 'Personal' },
    { key: 'health', label: 'Health' },
    { key: 'availability', label: 'Availability' },
    { key: 'emergency', label: 'Emergency' },
    { key: 'consent', label: 'Consent' },
  ];

  useEffect(() => {
    if (user?.role === 'DONOR') {
      navigate('/donor');
    }
  }, [user, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!consentAccepted) {
      setError('You must agree to the consent statement before registering.');
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
        email: email || null,
        province,
        district,
        municipality,
        address: fullAddress,
        password,
        role: 'DONOR',
        status: 'Pending Verification',
        health: {
          weight,
          lastDonationDate: lastDonationDate || null,
          donatedBefore: donatedBefore === 'yes',
          currentlyHealthy: currentlyHealthy === 'yes',
          onMedication: onMedication === 'yes',
          medicalConditions: medicalConditions === 'yes' ? medicalConditionsDetails : null,
        },
        availability: {
          availableToDonate: availableToDonate === 'yes',
          preferredContactMethod,
        },
        emergencyContact: emergencyName
          ? { name: emergencyName, relationship: emergencyRelationship, phone: emergencyPhone }
          : null,
      };

      const response = await api.post('/auth/register', payload);
      const data = response.data?.data ?? response.data;

      if (data?.accessToken && data?.user) {
        login(data.accessToken, data.user);
        setSuccess('Registration successful! Redirecting to your donor dashboard...');
        setTimeout(() => navigate('/donor'), 1400);
        return;
      }

      setSuccess('Registration successful. Redirecting to your donor dashboard...');
      setTimeout(() => navigate('/donor'), 1400);
    } catch (submissionError: any) {
      const message = submissionError?.response?.data?.message || submissionError?.message || 'Failed to register. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'personal':
        return (
          fullName.trim() !== '' &&
          dateOfBirth !== '' &&
          gender !== '' &&
          bloodGroup !== '' &&
          phone.trim() !== '' &&
          province.trim() !== '' &&
          district.trim() !== '' &&
          municipality.trim() !== '' &&
          fullAddress.trim() !== '' &&
          password !== '' &&
          confirmPassword !== '');
      case 'health':
        return weight.trim() !== '' && currentlyHealthy !== '';
      case 'availability':
        return preferredContactMethod !== '';
      case 'emergency':
        return true;
      case 'consent':
        return consentAccepted;
      default:
        return false;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-100)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, color: 'var(--text-300)', fontWeight: 600 }}>Individual Donor Registration</p>
              <h1 style={{ margin: '0.5rem 0 0', fontSize: '2rem' }}>Become a volunteer blood donor</h1>
            </div>
            <div style={{ minWidth: '240px', alignSelf: 'center' }}>
              <p style={{ margin: 0, color: 'var(--text-300)' }}>Complete your registration with health, address, and availability details. Your account will be <strong>Pending Verification</strong> after submission.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ border: '1px solid var(--glass-border)' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.75rem' }}>
              {steps.map((step, index) => (
                <div
                  key={step.key}
                  style={{
                    padding: '0.85rem 0.9rem',
                    borderRadius: '14px',
                    background: currentStep === step.key ? 'var(--primary-500)' : 'var(--bg-200)',
                    color: currentStep === step.key ? '#fff' : 'var(--text-300)',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => setCurrentStep(step.key)}
                >
                  {index + 1}. {step.label}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', borderRadius: '14px', background: '#ffecec', border: '1px solid #f5c2c2' }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', borderRadius: '14px', background: '#e8fff2', border: '1px solid #c5f3da' }}>
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            {currentStep === 'personal' && (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <div>
                  <label>Full Name</label>
                  <input type="text" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Date of Birth</label>
                    <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
                  </div>
                  <div>
                    <label>Gender</label>
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
                    <label>Blood Group</label>
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
                    <label>Phone Number</label>
                    <input type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Province</label>
                    <input type="text" placeholder="Province" value={province} onChange={(e) => setProvince(e.target.value)} required />
                  </div>
                  <div>
                    <label>District</label>
                    <input type="text" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Municipality / City</label>
                    <input type="text" placeholder="Municipality or City" value={municipality} onChange={(e) => setMunicipality(e.target.value)} required />
                  </div>
                  <div>
                    <label>Email Address</label>
                    <input type="email" placeholder="Optional" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label>Full Address</label>
                  <textarea placeholder="House number, street, ward" value={fullAddress} onChange={(e) => setFullAddress(e.target.value)} style={{ minHeight: '90px' }} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Password</label>
                    <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div>
                    <label>Confirm Password</label>
                    <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'health' && (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <h3 style={{ margin: 0 }}>Health Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Weight (kg)</label>
                    <input type="number" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                  </div>
                  <div>
                    <label>Last Blood Donation Date</label>
                    <input type="date" value={lastDonationDate} onChange={(e) => setLastDonationDate(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Have you donated blood before?</label>
                    <select value={donatedBefore} onChange={(e) => setDonatedBefore(e.target.value)}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label>Are you currently healthy?</label>
                    <select value={currentlyHealthy} onChange={(e) => setCurrentlyHealthy(e.target.value)} required>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Are you currently taking any medication?</label>
                    <select value={onMedication} onChange={(e) => setOnMedication(e.target.value)}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label>Any medical conditions?</label>
                    <select value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
                {medicalConditions === 'yes' && (
                  <div>
                    <label>Medical condition details</label>
                    <textarea placeholder="Describe any condition" value={medicalConditionsDetails} onChange={(e) => setMedicalConditionsDetails(e.target.value)} style={{ minHeight: '90px' }} />
                  </div>
                )}
              </div>
            )}

            {currentStep === 'availability' && (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <h3 style={{ margin: 0 }}>Availability</h3>
                <div>
                  <label>Available to Donate</label>
                  <select value={availableToDonate} onChange={(e) => setAvailableToDonate(e.target.value)} required>
                    <option value="yes">Yes</option>
                    <option value="no">Not Right Now</option>
                  </select>
                </div>
                <div>
                  <label>Preferred Contact Method</label>
                  <select value={preferredContactMethod} onChange={(e) => setPreferredContactMethod(e.target.value)} required>
                    <option value="phone">Phone Call</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 'emergency' && (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                <h3 style={{ margin: 0 }}>Emergency Contact</h3>
                <p style={{ margin: 0, color: 'var(--text-300)' }}>Optional, but recommended for urgent communication.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label>Contact Person Name</label>
                    <input type="text" placeholder="Jane Doe" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
                  </div>
                  <div>
                    <label>Relationship</label>
                    <input type="text" placeholder="Sister, Friend" value={emergencyRelationship} onChange={(e) => setEmergencyRelationship(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label>Phone Number</label>
                  <input type="tel" placeholder="9876543210" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                </div>
              </div>
            )}

            {currentStep === 'consent' && (
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <input
                  id="consent-accept"
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  style={{ marginTop: '0.35rem', cursor: 'pointer' }}
                />
                <label htmlFor="consent-accept" style={{ cursor: 'pointer', lineHeight: 1.7 }}>
                  I confirm that the information provided is correct, and I voluntarily register myself as a blood donor. I agree that the organization may contact me when blood matching my blood group is needed.
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => {
                  const currentIndex = steps.findIndex((step) => step.key === currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1].key);
                    setError('');
                  }
                }}
                disabled={currentStep === 'personal'}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '0.95rem',
                  borderRadius: '14px',
                  border: '1px solid var(--glass-border)',
                  background: '#fff',
                  cursor: currentStep === 'personal' ? 'not-allowed' : 'pointer',
                  opacity: currentStep === 'personal' ? 0.65 : 1,
                }}
              >
                Back
              </button>
              {currentStep !== 'consent' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!canProceedToNext()) {
                      setError('Please complete all required fields before continuing.');
                      return;
                    }
                    const currentIndex = steps.findIndex((step) => step.key === currentStep);
                    setCurrentStep(steps[currentIndex + 1].key);
                    setError('');
                  }}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '0.95rem',
                    borderRadius: '14px',
                    background: 'var(--primary-500)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !canProceedToNext()}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '0.95rem',
                    borderRadius: '14px',
                    background: 'var(--primary-500)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Registering...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
