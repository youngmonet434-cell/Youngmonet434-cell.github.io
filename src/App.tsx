import { useState, useEffect } from 'react';
import { loadAppDb, saveAppDb } from './mockData';
import { User, Language } from './types';
import { translations } from './translations';

// Components
import LanguageSwitcher from './components/LanguageSwitcher';
import TesterPanel from './components/TesterPanel';
import LoginSignup from './components/LoginSignup';
import AdminDashboard from './components/AdminDashboard';
import WalletView from './components/WalletView';
import UserProfile from './components/UserProfile';
import LiveStreamList from './components/LiveStreamList';
import LiveStreamRoom from './components/LiveStreamRoom';

// Icons
import { ShieldCheck, User as UserIcon, Wallet as WalletIcon, Radio, ShieldAlert, LogOut, Globe, AlertOctagon, Smartphone } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation states: 'home' | 'profile' | 'wallet' | 'admin'
  const [currentNav, setCurrentNav] = useState<'home' | 'profile' | 'wallet' | 'admin'>('home');
  
  // Viewing details of another user profile
  const [profileViewUser, setProfileViewUser] = useState<User | null>(null);

  // Active Live Room
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Device status state
  const [isDeviceBanned, setIsDeviceBanned] = useState<boolean>(false);
  const [banReason, setBanReason] = useState<string>('');

  // Counter to force deep re-renders on local storage shifts
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const t = translations[currentLang];

  // Load and check credentials
  const refreshDbState = () => {
    const db = loadAppDb();
    
    // Check if device is banned
    const currentDeviceId = localStorage.getItem('ymonet_current_device_id') || 'simulated-device-id-123';
    const banRecord = db.bans.find((b) => b.deviceId === currentDeviceId);
    if (banRecord) {
      setIsDeviceBanned(true);
      setBanReason(banRecord.reason);
      setCurrentUser(null);
      return;
    }

    // Refresh current user data (if logged in)
    if (currentUser) {
      const updatedUser = db.users.find((u: User) => u.id === currentUser.id);
      if (updatedUser) {
        if (updatedUser.isBanned) {
          setCurrentUser(null);
          alert('This account has been banned due to security violations.');
        } else {
          setCurrentUser(updatedUser);
        }
      }
    }
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    refreshDbState();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentNav('home');
    refreshDbState();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfileViewUser(null);
    setActiveRoomId(null);
    refreshDbState();
  };

  // Navigating to profile view
  const handleViewProfile = (username: string) => {
    const db = loadAppDb();
    const found = db.users.find((u: User) => u.username === username);
    if (found) {
      setProfileViewUser(found);
      setCurrentNav('profile');
      setActiveRoomId(null);
    }
  };

  // Switch tabs
  const handleNavChange = (nav: 'home' | 'profile' | 'wallet' | 'admin') => {
    if (nav === 'profile') {
      setProfileViewUser(currentUser); // Default to self profile
    } else {
      setProfileViewUser(null);
    }
    setCurrentNav(nav);
    setActiveRoomId(null);
  };

  // DEVICE BANNED SCREEN
  if (isDeviceBanned) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center selection:bg-red-500/20" id="banned-lock-screen">
        <div className="max-w-md w-full bg-dark-card border border-red-500/25 p-8 rounded-2xl space-y-6 shadow-2xl" id="banned-lock-card">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 animate-pulse" id="banned-icon-wrapper">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>

          <div className="space-y-2" id="banned-texts">
            <h1 className="text-xl font-display font-bold text-red-500 tracking-wider uppercase">
              {t.deviceBannedScreenTitle}
            </h1>
            <p className="text-xs text-gray-500 font-mono">ID: {localStorage.getItem('ymonet_current_device_id') || 'simulated-device-id-123'}</p>
          </div>

          <div className="bg-red-950/20 border border-red-500/10 p-4 rounded-lg text-xs text-red-400 text-left font-mono leading-relaxed" id="ban-reason-box">
            <span className="text-gray-500 block mb-1">SECURITY VIOLATION:</span>
            <span>{banReason || t.bannedDeviceError}</span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            {t.deviceBannedScreenDesc}
          </p>

          <div className="pt-4 border-t border-white/5" id="tester-panel-banned-unlock">
            <p className="text-[10px] text-gray-600 mb-2">DEVELOPER REMINDER: Use the reset button below to unlock your device for testing.</p>
            <button
              onClick={() => {
                localStorage.clear();
                setIsDeviceBanned(false);
                setBanReason('');
                refreshDbState();
              }}
              className="bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white font-mono text-xs py-2 px-4 rounded-lg transition"
            >
              Reset Database & Bypass Device Ban
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col justify-between selection:bg-gold-500/20" id="ymonet-app-viewport" key={refreshKey}>
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-dark-bg/95 border-b border-gold-300/10 backdrop-blur-md" id="header-navbar">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4" id="header-wrapper">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none" id="header-logo-container" onClick={() => handleNavChange('home')}>
            <h1 className="text-2xl font-display font-black tracking-tight text-white flex items-center gap-1.5" id="app-headline">
              <span>{t.appName.toUpperCase()}</span>
            </h1>
          </div>

          {/* Navigation links (if logged in) */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-mono uppercase tracking-wider" id="header-nav">
              <button
                id="nav-btn-home"
                onClick={() => handleNavChange('home')}
                className={`px-4 py-2 rounded-lg transition cursor-pointer ${currentNav === 'home' && !activeRoomId ? 'text-gold-300 bg-white/5 font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                Streams
              </button>
              <button
                id="nav-btn-profile"
                onClick={() => handleNavChange('profile')}
                className={`px-4 py-2 rounded-lg transition cursor-pointer ${currentNav === 'profile' ? 'text-gold-300 bg-white/5 font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                Profile
              </button>
              <button
                id="nav-btn-wallet"
                onClick={() => handleNavChange('wallet')}
                className={`px-4 py-2 rounded-lg transition cursor-pointer ${currentNav === 'wallet' ? 'text-gold-300 bg-white/5 font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                Wallet
              </button>
              {currentUser.role === 'owner' && (
                <button
                  id="nav-btn-admin"
                  onClick={() => handleNavChange('admin')}
                  className={`px-4 py-2 rounded-lg border border-gold-300/20 text-gold-300 hover:bg-gold-500/10 transition cursor-pointer ${currentNav === 'admin' ? 'bg-gold-500/15 font-semibold' : ''}`}
                >
                  Admin Panel
                </button>
              )}
            </nav>
          )}

          {/* Right Header Controls (Language, Session info) */}
          <div className="flex items-center gap-3" id="header-controls">
            <LanguageSwitcher currentLang={currentLang} onLanguageChange={setCurrentLang} />

            {currentUser && (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10" id="header-session-info">
                <div className="hidden sm:flex flex-col items-end text-right select-none" id="session-user-meta">
                  <span className="text-xs font-semibold text-white flex items-center gap-1">
                    <span>@{currentUser.username}</span>
                    {currentUser.isVerified === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-gold-300" />}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{currentUser.isVerified}</span>
                </div>

                <button
                  onClick={handleLogout}
                  id="header-logout-btn"
                  className="bg-white/5 hover:bg-white/10 border border-white/5 p-2 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6" id="main-content">
        {currentUser ? (
          /* AUTHENTICATED USER VIEWS */
          <div className="space-y-6" id="auth-content-container">
            {/* Live stream room view (active overlays other states) */}
            {activeRoomId ? (
              <LiveStreamRoom
                currentLang={currentLang}
                roomId={activeRoomId}
                currentUser={currentUser}
                onLeave={() => {
                  setActiveRoomId(null);
                  refreshDbState();
                }}
                onAutoBanTriggered={(reason) => {
                  setIsDeviceBanned(true);
                  setBanReason(reason);
                  setCurrentUser(null);
                  refreshDbState();
                }}
                onRefresh={refreshDbState}
              />
            ) : (
              /* TAB ROUTING */
              <div id="tab-outlet">
                {currentNav === 'home' && (
                  <LiveStreamList
                    currentLang={currentLang}
                    currentUser={currentUser}
                    onJoinRoom={(id) => setActiveRoomId(id)}
                    onRefresh={refreshDbState}
                  />
                )}

                {currentNav === 'profile' && (
                  <UserProfile
                    currentLang={currentLang}
                    targetUser={profileViewUser || currentUser}
                    currentUser={currentUser}
                    onRefresh={refreshDbState}
                  />
                )}

                {currentNav === 'wallet' && (
                  <WalletView currentLang={currentLang} />
                )}

                {currentNav === 'admin' && currentUser.role === 'owner' && (
                  <AdminDashboard currentLang={currentLang} onRefresh={refreshDbState} />
                )}
              </div>
            )}
          </div>
        ) : (
          /* ANONYMOUS GUEST VIEW: LOGIN / SIGNUP */
          <div className="py-8" id="guest-content-container">
            <LoginSignup
              currentLang={currentLang}
              onLoginSuccess={handleLoginSuccess}
              onDeviceBanned={() => {
                const db = loadAppDb();
                const currentDeviceId = localStorage.getItem('ymonet_current_device_id') || 'simulated-device-id-123';
                const record = db.bans.find((b) => b.deviceId === currentDeviceId);
                setIsDeviceBanned(true);
                setBanReason(record?.reason || 'Hardware blacklist triggered.');
              }}
            />
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION (only if logged in) */}
      {currentUser && (
        <div className="md:hidden sticky bottom-0 z-40 bg-dark-card/95 border-t border-gold-300/10 backdrop-blur-md py-2.5 px-4 flex justify-around text-[10px] font-mono text-gray-500 uppercase tracking-widest select-none" id="mobile-nav-bar">
          <button
            onClick={() => handleNavChange('home')}
            id="mobile-nav-streams"
            className={`flex flex-col items-center gap-1 cursor-pointer ${currentNav === 'home' && !activeRoomId ? 'text-gold-300' : 'text-gray-500'}`}
          >
            <Radio className="w-4 h-4" />
            <span>Streams</span>
          </button>
          <button
            onClick={() => handleNavChange('profile')}
            id="mobile-nav-profile"
            className={`flex flex-col items-center gap-1 cursor-pointer ${currentNav === 'profile' ? 'text-gold-300' : 'text-gray-500'}`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => handleNavChange('wallet')}
            id="mobile-nav-wallet"
            className={`flex flex-col items-center gap-1 cursor-pointer ${currentNav === 'wallet' ? 'text-gold-300' : 'text-gray-500'}`}
          >
            <WalletIcon className="w-4 h-4" />
            <span>Wallet</span>
          </button>
          {currentUser.role === 'owner' && (
            <button
              onClick={() => handleNavChange('admin')}
              id="mobile-nav-admin"
              className={`flex flex-col items-center gap-1 cursor-pointer ${currentNav === 'admin' ? 'text-gold-300' : 'text-gray-500'}`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
        </div>
      )}

      {/* SANDBOX DEVELOPMENT TESTER DIAGNOSTICS */}
      <footer className="w-full max-w-7xl mx-auto px-4 pb-8" id="sandbox-diagnostics-footer">
        <TesterPanel
          currentLang={currentLang}
          currentUser={currentUser}
          onSetUser={setCurrentUser}
          onRefresh={refreshDbState}
        />
      </footer>
    </div>
  );
}
