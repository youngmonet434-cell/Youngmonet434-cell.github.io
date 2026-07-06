import React, { useState, useEffect } from 'react';
import { Smartphone, Mail, Apple, ShieldAlert, Upload, ArrowRight, CheckCircle2, User as UserIcon } from 'lucide-react';
import { loadAppDb, saveAppDb, RESERVED_USERNAMES } from '../mockData';
import { User, Language } from '../types';
import { translations } from '../translations';

interface LoginSignupProps {
  currentLang: Language;
  onLoginSuccess: (user: User) => void;
  onDeviceBanned: () => void;
}

export default function LoginSignup({ currentLang, onLoginSuccess, onDeviceBanned }: LoginSignupProps) {
  const t = translations[currentLang];

  const [authMethod, setAuthMethod] = useState<'phone' | 'email' | 'apple'>('phone');
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1); // 1: Credentials, 2: Verification (SMS/Email), 3: Age Check (ID + Selfie)

  // Input States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number>(20);

  // SMS Verification State
  const [generatedSmsCode, setGeneratedSmsCode] = useState<string>('');
  const [enteredSmsCode, setEnteredSmsCode] = useState('');
  const [smsSentText, setSmsSentText] = useState('');

  // Email verification simulation
  const [isEmailSimActivated, setIsEmailSimActivated] = useState(false);

  // ID and Selfie uploads (Base64 strings or placeholders)
  const [idProof, setIdProof] = useState<string>('');
  const [selfie, setSelfie] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState('');

  // Device ID definition
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    // Generate/retrieve simulated hardware ID
    let currentDevice = localStorage.getItem('ymonet_current_device_id');
    if (!currentDevice) {
      currentDevice = 'device-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('ymonet_current_device_id', currentDevice);
    }
    setDeviceId(currentDevice);

    // Check if device is banned on load
    const db = loadAppDb();
    if (db.bans.some((ban) => ban.deviceId === currentDevice)) {
      onDeviceBanned();
    }
  }, [onDeviceBanned]);

  // Handle Credentials Step
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const db = loadAppDb();

    // Device check
    if (db.bans.some((ban) => ban.deviceId === deviceId)) {
      onDeviceBanned();
      return;
    }

    if (isSignUp) {
      // 1. Reserved Username Check (case-insensitive)
      const sanitizedUsername = username.trim().toLowerCase();
      if (RESERVED_USERNAMES.includes(sanitizedUsername)) {
        setErrorMessage(t.reservedNameError);
        return;
      }

      // 2. Duplicate Account Check (One Account Only: Phone, Email, Device)
      const duplicateUser = db.users.find(
        (u: User) =>
          u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '') ||
          u.email.toLowerCase() === email.toLowerCase() ||
          u.deviceId === deviceId
      );

      if (duplicateUser) {
        setErrorMessage(t.duplicateError);
        return;
      }

      if (authMethod === 'phone') {
        if (!phone || !username) {
          setErrorMessage('Please fill in all details.');
          return;
        }
        // Send simulated SMS Code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedSmsCode(code);
        setSmsSentText(`[SIMULATED SMS] Verification code for ${phone}: ${code}`);
        setStep(2);
      } else if (authMethod === 'email') {
        if (!email || !password || !username) {
          setErrorMessage('Please fill in all details.');
          return;
        }
        setStep(2);
      } else {
        // Apple Sign-In skips to Age check
        setStep(3);
      }
    } else {
      // LOGIN FLOW
      if (authMethod === 'phone') {
        const user = db.users.find((u: User) => u.phone === phone);
        if (!user) {
          setErrorMessage('No user registered with this phone number.');
          return;
        }
        if (user.isBanned) {
          setErrorMessage('This account is permanently banned.');
          return;
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedSmsCode(code);
        setSmsSentText(`[SIMULATED SMS] Verification code for ${phone}: ${code}`);
        setStep(2);
      } else if (authMethod === 'email') {
        const user = db.users.find(
          (u: User) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (!user) {
          setErrorMessage('Incorrect email or password.');
          return;
        }
        if (user.isBanned) {
          setErrorMessage('This account is permanently banned.');
          return;
        }
        onLoginSuccess(user);
      } else {
        // Apple Log-In: Use mr monet or standard user
        const user = db.users.find((u: User) => u.role === 'owner') || db.users[1];
        if (user) onLoginSuccess(user);
      }
    }
  };

  // SMS Code Submission
  const handleVerifySms = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredSmsCode === generatedSmsCode) {
      if (isSignUp) {
        setStep(3); // Go to Age verification
      } else {
        // Logging in
        const db = loadAppDb();
        const user = db.users.find((u: User) => u.phone === phone);
        if (user) onLoginSuccess(user);
      }
    } else {
      setErrorMessage('Invalid SMS code. Please check and try again.');
    }
  };

  // Email link simulation
  const handleVerifyEmailSim = () => {
    setIsEmailSimActivated(true);
    setTimeout(() => {
      setStep(3);
    }, 1200);
  };

  // Age, ID, and Selfie checks
  const handleRegisterComplete = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (age < 18) {
      setErrorMessage(t.underageError);
      return;
    }

    if (!idProof || !selfie) {
      setErrorMessage(t.missingFilesError);
      return;
    }

    // Register User
    const db = loadAppDb();

    const newUser: User = {
      id: 'user-' + Date.now(),
      username: username.trim(),
      email: email.trim().toLowerCase() || `${username.trim().replace(/\s+/g, '')}@ymonet.com`,
      phone: phone || `+1555${Math.floor(1000000 + Math.random() * 9000000)}`,
      avatar: selfie, // Use user's selfie as profile avatar
      age,
      idProofUrl: idProof,
      selfieUrl: selfie,
      isVerified: 'pending', // Starts pending to allow testing Owner approval in Admin!
      isBanned: false,
      role: 'user',
      deviceId,
      followers: [],
      following: ['owner-id'],
      matches: [],
      bio: 'Authentic ymonet user. Clean streams only.',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveAppDb(db);

    alert(t.successReg);
    onLoginSuccess(newUser);
  };

  // Helper to handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto" id="auth-box-root">
      {/* Title */}
      <div className="text-center mb-8" id="auth-title-container">
        <h1 className="text-4xl font-display font-bold tracking-tight text-white mb-2" id="auth-title">
          {t.appName.toUpperCase()}
        </h1>
        <p className="text-xs font-mono text-gold-300 tracking-widest uppercase mb-4" id="auth-tagline">
          {t.tagline}
        </p>
        <div className="inline-block bg-white/5 border border-white/10 text-[10px] font-mono px-3 py-1 rounded-full text-gray-400" id="auth-badge">
          {t.noPayments}
        </div>
      </div>

      <div className="bg-dark-card border border-gold-300/10 rounded-2xl p-6 gold-glow transition-all" id="auth-form-card">
        {/* Step Indicators */}
        {isSignUp && (
          <div className="flex justify-between items-center mb-6 text-[10px] font-mono text-gray-500 uppercase tracking-wider" id="signup-steps-indicators">
            <span className={`${step >= 1 ? 'text-gold-300' : ''}`}>1. Credentials</span>
            <div className="h-px bg-white/10 flex-1 mx-2" />
            <span className={`${step >= 2 ? 'text-gold-300' : ''}`}>2. SMS/Email Link</span>
            <div className="h-px bg-white/10 flex-1 mx-2" />
            <span className={`${step >= 3 ? 'text-gold-300' : ''}`}>3. ID & Age</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex gap-2 items-start bg-red-950/40 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg mb-5" id="auth-error-banner">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Enter Credentials */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="space-y-4" id="credentials-form">
            {/* Auth Methods Selector */}
            <div className="grid grid-cols-3 gap-2 bg-dark-bg p-1 rounded-lg border border-white/5" id="auth-method-selector">
              <button
                type="button"
                id="method-phone"
                onClick={() => { setAuthMethod('phone'); setErrorMessage(''); }}
                className={`flex flex-col items-center gap-1 py-2 rounded text-xs transition cursor-pointer ${authMethod === 'phone' ? 'bg-gold-500/10 text-gold-300 border border-gold-300/20' : 'text-gray-400 hover:text-white'}`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Phone</span>
              </button>
              <button
                type="button"
                id="method-email"
                onClick={() => { setAuthMethod('email'); setErrorMessage(''); }}
                className={`flex flex-col items-center gap-1 py-2 rounded text-xs transition cursor-pointer ${authMethod === 'email' ? 'bg-gold-500/10 text-gold-300 border border-gold-300/20' : 'text-gray-400 hover:text-white'}`}
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
              <button
                type="button"
                id="method-apple"
                onClick={() => { setAuthMethod('apple'); setErrorMessage(''); }}
                className={`flex flex-col items-center gap-1 py-2 rounded text-xs transition cursor-pointer ${authMethod === 'apple' ? 'bg-gold-500/10 text-gold-300 border border-gold-300/20' : 'text-gray-400 hover:text-white'}`}
              >
                <Apple className="w-4 h-4" />
                <span>Apple</span>
              </button>
            </div>

            {/* Fields */}
            {authMethod === 'phone' && (
              <div className="space-y-3" id="phone-fields">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">{t.username}</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        id="signup-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. youngmonet"
                        className="w-full bg-dark-bg border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold-300"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">{t.phone}</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      required
                      id="login-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 0192"
                      className="w-full bg-dark-bg border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {authMethod === 'email' && (
              <div className="space-y-3" id="email-fields">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">{t.username}</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        id="signup-email-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. youngmonet"
                        className="w-full bg-dark-bg border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-gold-300"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">{t.email}</label>
                  <input
                    type="email"
                    required
                    id="login-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">{t.password}</label>
                  <input
                    type="password"
                    required
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-300"
                  />
                </div>
              </div>
            )}

            {authMethod === 'apple' && (
              <div className="text-center py-6 space-y-4" id="apple-login-container">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto" id="apple-icon-wrapper">
                  <Apple className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-400 px-4">
                  Sign in instantly using Apple ID. High-security device tokens will auto-validate your hardware profile.
                </p>
                <button
                  type="submit"
                  id="apple-sign-btn"
                  className="w-full bg-white text-dark-bg hover:bg-gray-200 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Apple className="w-4 h-4 fill-dark-bg" />
                  <span>{isSignUp ? t.signUp : t.signIn} with Apple</span>
                </button>
              </div>
            )}

            {authMethod !== 'apple' && (
              <button
                type="submit"
                id="credential-next-btn"
                className="w-full bg-gold-500 hover:bg-gold-400 text-dark-bg py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{isSignUp ? 'Next Verification' : t.signIn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Toggle Sign Up vs Login */}
            <div className="text-center pt-3 border-t border-white/5 text-xs text-gray-400" id="auth-toggle-wrapper">
              {isSignUp ? (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    id="toggle-signin"
                    onClick={() => { setIsSignUp(false); setStep(1); setErrorMessage(''); }}
                    className="text-gold-300 hover:underline cursor-pointer"
                  >
                    {t.signIn}
                  </button>
                </span>
              ) : (
                <span>
                  New to ymonet?{' '}
                  <button
                    type="button"
                    id="toggle-signup"
                    onClick={() => { setIsSignUp(true); setStep(1); setErrorMessage(''); }}
                    className="text-gold-300 hover:underline cursor-pointer"
                  >
                    {t.signUp}
                  </button>
                </span>
              )}
            </div>
          </form>
        )}

        {/* STEP 2: SMS CODE OR EMAIL ACTIVATION */}
        {step === 2 && (
          <div className="space-y-4" id="verification-step-wrapper">
            {authMethod === 'phone' ? (
              <form onSubmit={handleVerifySms} className="space-y-4" id="sms-verification-form">
                <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider">{t.enterSms}</h3>
                
                {smsSentText && (
                  <div className="bg-gold-900/40 border border-gold-300/10 p-3 rounded-lg text-xs text-gold-300 font-mono text-center leading-relaxed" id="sms-sent-box">
                    {smsSentText}
                  </div>
                )}

                <input
                  type="text"
                  required
                  id="sms-input-code"
                  maxLength={6}
                  value={enteredSmsCode}
                  onChange={(e) => setEnteredSmsCode(e.target.value)}
                  placeholder="------"
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-center text-xl font-mono text-white tracking-widest focus:outline-none focus:border-gold-300"
                />

                <button
                  type="submit"
                  id="submit-sms-code-btn"
                  className="w-full bg-gold-500 hover:bg-gold-400 text-dark-bg py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Verify Code</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4" id="email-verification-sim">
                <div className="w-12 h-12 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto text-gold-400" id="email-icon-wrapper">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-display font-medium text-white">{t.verifyEmailTitle}</h3>
                <p className="text-xs text-gray-400 px-2">{t.verifyEmailDesc}</p>

                {isEmailSimActivated ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/10" id="email-activated-status">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Link Verified. Advancing...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleVerifyEmailSim}
                    id="email-activate-btn"
                    className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-xs py-2 px-4 rounded-lg transition cursor-pointer"
                  >
                    {t.activateEmailBtn}
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              id="back-step-btn"
              className="w-full text-center text-xs text-gray-500 hover:text-white transition mt-2 cursor-pointer"
            >
              ← Go Back
            </button>
          </div>
        )}

        {/* STEP 3: AGE CHECK (ID CARD + SELFIE) */}
        {step === 3 && (
          <form onSubmit={handleRegisterComplete} className="space-y-4" id="age-check-form">
            <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider flex items-center gap-1.5" id="age-check-header">
              <ShieldAlert className="w-4 h-4 text-gold-400" />
              <span>{t.ageCheckTitle}</span>
            </h3>
            <p className="text-xs text-gray-400 leading-normal mb-2" id="age-check-desc">
              {t.ageCheckDesc}
            </p>

            <div className="space-y-4" id="age-inputs-container">
              {/* Age field */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">{t.enterAge}</label>
                <input
                  type="number"
                  required
                  id="signup-age-input"
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-300"
                />
              </div>

              {/* ID Proof File Selector */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">{t.uploadId}</label>
                <div className="relative border border-dashed border-white/10 hover:border-gold-300/30 rounded-lg p-4 text-center cursor-pointer bg-dark-bg/40 hover:bg-dark-bg transition-all" id="id-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    id="id-file-input"
                    onChange={(e) => handleImageUpload(e, setIdProof)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {idProof ? (
                    <div className="flex items-center justify-center gap-2 text-xs text-gold-300" id="id-uploaded-preview">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>ID document ready ({idProof.substring(0, 20)}...)</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-500" id="id-placeholder">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-xs">Drag/Click to upload passport or driver's ID</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie Selector */}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">{t.takeSelfie}</label>
                <div className="relative border border-dashed border-white/10 hover:border-gold-300/30 rounded-lg p-4 text-center cursor-pointer bg-dark-bg/40 hover:bg-dark-bg transition-all" id="selfie-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    id="selfie-file-input"
                    onChange={(e) => handleImageUpload(e, setSelfie)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {selfie ? (
                    <div className="flex flex-col items-center gap-2" id="selfie-uploaded-preview">
                      <img src={selfie} alt="Selfie preview" className="w-12 h-12 rounded-full object-cover border border-gold-300" />
                      <span className="text-xs text-gold-300">Selfie capture ready</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-500" id="selfie-placeholder">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-xs">Drag/Click to upload portrait selfie</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="register-complete-btn"
              className="w-full bg-gold-500 hover:bg-gold-400 text-dark-bg py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{t.registerBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
