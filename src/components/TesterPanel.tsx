import { ShieldAlert, RotateCcw, AlertTriangle, Check, UserCheck, Smartphone } from 'lucide-react';
import { loadAppDb, saveAppDb } from '../mockData';
import { User, Language } from '../types';
import { translations } from '../translations';

interface TesterPanelProps {
  currentLang: Language;
  currentUser: User | null;
  onSetUser: (user: User | null) => void;
  onRefresh: () => void;
}

export default function TesterPanel({ currentLang, currentUser, onSetUser, onRefresh }: TesterPanelProps) {
  const t = translations[currentLang];

  const handleLoginAsOwner = () => {
    const db = loadAppDb();
    let owner = db.users.find((u: User) => u.role === 'owner');
    if (!owner) {
      owner = {
        id: 'owner-id',
        username: 'mr monet',
        email: 'youngmonet434@gmail.com',
        phone: '+15550192837',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        age: 29,
        isVerified: 'verified',
        isBanned: false,
        role: 'owner',
        deviceId: 'device-owner',
        followers: ['user-1'],
        following: [],
        matches: [],
        createdAt: new Date().toISOString()
      };
      db.users.push(owner);
      saveAppDb(db);
    }
    // Ensure owner is not banned or unverified
    owner.isBanned = false;
    owner.isVerified = 'verified';
    const idx = db.users.findIndex((u: User) => u.id === owner.id);
    if (idx !== -1) db.users[idx] = owner;
    saveAppDb(db);

    onSetUser(owner);
    onRefresh();
  };

  const handleResetData = () => {
    localStorage.removeItem('ymonet_users');
    localStorage.removeItem('ymonet_rooms');
    localStorage.removeItem('ymonet_reports');
    localStorage.removeItem('ymonet_bans');
    localStorage.removeItem('ymonet_current_device_id');
    onSetUser(null);
    onRefresh();
    alert('Local Storage Database completely reset to starting defaults!');
  };

  const handleSimulateReport = () => {
    const db = loadAppDb();
    const newReport = {
      id: `report-${Date.now()}`,
      reporterId: 'user-3',
      reporterName: 'paris_chic',
      reportedUserId: 'user-1',
      reportedUsername: 'dj_monet_vibes',
      reason: 'Testing: Simulated spam report.',
      type: 'profile' as const,
      content: 'Simulated profile violation for testing.',
      createdAt: new Date().toISOString(),
      status: 'pending' as const
    };
    db.reports.push(newReport);
    saveAppDb(db);
    onRefresh();
    alert('Simulated profile report created. Switch to mr monet to see it!');
  };

  const db = loadAppDb();
  const currentDeviceId = localStorage.getItem('ymonet_current_device_id') || 'simulated-device-id-123';
  const isCurrentDeviceBanned = db.bans.some((b) => b.deviceId === currentDeviceId);

  return (
    <div className="bg-dark-card/90 border-t border-gold-300/20 p-4 mt-8 rounded-xl glass-panel text-xs" id="tester-panel-root">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5" id="tester-panel-header">
        <div className="flex items-center gap-1.5 text-gold-300 font-display font-medium uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-gold-400" />
          <span>{t.simulationPanel}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-mono text-[10px]">
          <Smartphone className="w-3.5 h-3.5" />
          <span>ID: {currentDeviceId.substring(0, 8)}... {isCurrentDeviceBanned ? '❌ BANNED' : '✅ CLEAN'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="tester-panel-body">
        {/* Quick Toggles */}
        <div className="flex flex-col gap-2" id="quick-actions-section">
          <span className="text-gray-400 font-medium">Quick Actions</span>
          <button
            onClick={handleLoginAsOwner}
            className="flex items-center justify-center gap-2 bg-gold-500 text-dark-bg font-semibold py-2 px-3 rounded-lg hover:bg-gold-400 transition cursor-pointer"
            id="login-owner-btn"
          >
            <UserCheck className="w-4 h-4" />
            <span>Login as Owner (mr monet)</span>
          </button>
          
          <button
            onClick={handleResetData}
            className="flex items-center justify-center gap-2 bg-red-950/40 text-red-400 hover:bg-red-950/60 border border-red-500/20 py-2 px-3 rounded-lg transition cursor-pointer"
            id="reset-db-btn"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Database & Cache</span>
          </button>
        </div>

        {/* Safety Simulation */}
        <div className="flex flex-col gap-2" id="safety-simulation-section">
          <span className="text-gray-400 font-medium">Simulate Events</span>
          <button
            onClick={handleSimulateReport}
            className="flex items-center justify-center gap-2 bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10 py-2 px-3 rounded-lg transition cursor-pointer"
            id="simulate-report-btn"
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Add Simulated Violation Report</span>
          </button>

          <div className="bg-dark-bg/60 p-2 rounded border border-white/5 text-[10px] text-gray-400 leading-normal" id="simulation-tips">
            <span className="text-gold-300 font-medium block mb-1">💡 Auto-Ban Triggers (Hate/NSFW)</span>
            Write <span className="text-red-400 font-mono">trash</span> or <span className="text-red-400 font-mono">hate</span> in live room chat to trigger an automatic account + device ban.
          </div>
        </div>

        {/* Diagnostic Status */}
        <div className="flex flex-col gap-2 bg-dark-bg/40 p-2.5 rounded-lg border border-gold-300/5 text-gray-400" id="diagnostic-status-section">
          <span className="text-gray-400 font-medium mb-1">Platform Stats</span>
          <div className="flex justify-between items-center" id="stat-registered-users">
            <span>Registered Users:</span>
            <span className="text-white font-mono">{db.users.length}</span>
          </div>
          <div className="flex justify-between items-center" id="stat-active-streams">
            <span>Active Streams:</span>
            <span className="text-gold-300 font-mono">{db.rooms.length}</span>
          </div>
          <div className="flex justify-between items-center" id="stat-active-reports">
            <span>Active Reports:</span>
            <span className="text-amber-500 font-mono">{db.reports.filter((r: any) => r.status === 'pending').length}</span>
          </div>
          <div className="flex justify-between items-center" id="stat-banned-devices">
            <span>Banned Devices:</span>
            <span className="text-red-400 font-mono">{db.bans.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
