import { useState } from 'react';
import { loadAppDb, saveAppDb } from '../mockData';
import { User, Report, DeviceBan, Language } from '../types';
import { translations } from '../translations';
import { ShieldAlert, Users, CheckSquare, Trash2, Check, X, Smartphone, AlertOctagon } from 'lucide-react';

interface AdminDashboardProps {
  currentLang: Language;
  onRefresh: () => void;
}

export default function AdminDashboard({ currentLang, onRefresh }: AdminDashboardProps) {
  const t = translations[currentLang];
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'verifications'>('reports');

  const db = loadAppDb();

  // Ban User
  const handleBanUser = (userId: string) => {
    const data = loadAppDb();
    const userIdx = data.users.findIndex((u: User) => u.id === userId);
    if (userIdx !== -1) {
      const isCurrentlyBanned = data.users[userIdx].isBanned;
      data.users[userIdx].isBanned = !isCurrentlyBanned;
      
      // Update any corresponding report status
      if (!isCurrentlyBanned) {
        data.reports = data.reports.map((r: Report) => 
          r.reportedUserId === userId ? { ...r, status: 'banned' } : r
        );
      }
      
      saveAppDb(data);
      onRefresh();
      alert(`User account ${data.users[userIdx].username} ${isCurrentlyBanned ? 'UNBANNED' : 'BANNED'}.`);
    }
  };

  // Device Ban / Unban
  const handleDeviceBan = (deviceId: string) => {
    const data = loadAppDb();
    const banIdx = data.bans.findIndex((b: DeviceBan) => b.deviceId === deviceId);

    if (banIdx !== -1) {
      // Unban device
      data.bans.splice(banIdx, 1);
      saveAppDb(data);
      onRefresh();
      alert(`Device ${deviceId} has been unbanned.`);
    } else {
      // Ban device
      const newBan: DeviceBan = {
        deviceId,
        reason: 'Violated platform safe rules. Blacklisted by Owner.',
        bannedAt: new Date().toISOString()
      };
      data.bans.push(newBan);

      // Also ban any user linked to this device ID
      data.users = data.users.map((u: User) => 
        u.deviceId === deviceId ? { ...u, isBanned: true } : u
      );

      saveAppDb(data);
      onRefresh();
      alert(`Device ${deviceId} has been permanently blacklisted. All associated accounts are now restricted.`);
    }
  };

  // Handle Verification Application (Approve / Reject)
  const handleVerification = (userId: string, status: 'verified' | 'rejected') => {
    const data = loadAppDb();
    const userIdx = data.users.findIndex((u: User) => u.id === userId);
    if (userIdx !== -1) {
      data.users[userIdx].isVerified = status;
      saveAppDb(data);
      onRefresh();
      alert(`Verification request for ${data.users[userIdx].username} has been ${status === 'verified' ? 'APPROVED 🎉' : 'REJECTED ❌'}.`);
    }
  };

  // Dismiss report
  const handleDismissReport = (reportId: string) => {
    const data = loadAppDb();
    data.reports = data.reports.map((r: Report) => 
      r.id === reportId ? { ...r, status: 'dismissed' as const } : r
    );
    saveAppDb(data);
    onRefresh();
    alert('Report dismissed.');
  };

  const pendingReports = db.reports.filter((r: Report) => r.status === 'pending');
  const pendingVerifications = db.users.filter((u: User) => u.isVerified === 'pending');

  return (
    <div className="w-full space-y-6" id="admin-dashboard-container">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gold-300/10 pb-4 gap-2" id="admin-header">
        <div>
          <h2 className="text-xl font-display font-semibold text-white tracking-wide uppercase flex items-center gap-2" id="admin-title">
            <ShieldAlert className="w-5 h-5 text-gold-400 animate-pulse" />
            <span>{t.ownerAdminTitle}</span>
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-0.5">Control panel reserved for Owner "mr monet"</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-dark-bg p-1 rounded-lg border border-white/5 text-xs font-mono" id="admin-tabs">
          <button
            id="tab-reports"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition cursor-pointer ${activeTab === 'reports' ? 'bg-gold-500 text-dark-bg font-medium' : 'text-gray-400 hover:text-white'}`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{t.reportsTab} ({pendingReports.length})</span>
          </button>
          <button
            id="tab-users"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition cursor-pointer ${activeTab === 'users' ? 'bg-gold-500 text-dark-bg font-medium' : 'text-gray-400 hover:text-white'}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.usersTab}</span>
          </button>
          <button
            id="tab-verifications"
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition cursor-pointer ${activeTab === 'verifications' ? 'bg-gold-500 text-dark-bg font-medium' : 'text-gray-400 hover:text-white'}`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>{t.pendingVerifications} ({pendingVerifications.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div id="admin-tab-content">
        {/* TAB 1: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4" id="reports-tab-body">
            {pendingReports.length === 0 ? (
              <div className="text-center py-12 bg-dark-card/50 border border-white/5 rounded-xl text-gray-500 text-sm" id="empty-reports">
                {t.noReports}
              </div>
            ) : (
              pendingReports.map((report: Report) => (
                <div key={report.id} className="bg-dark-card border border-red-500/10 rounded-xl p-5 space-y-3" id={`report-card-${report.id}`}>
                  <div className="flex justify-between items-start" id="report-card-header">
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-red-950/40 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                        {report.type.toUpperCase()} FLAG
                      </span>
                      <h4 className="text-sm font-semibold text-white mt-2">
                        Reported: <span className="text-gold-300 font-mono">@{report.reportedUsername}</span>
                      </h4>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(report.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="bg-dark-bg/60 p-3 rounded border border-white/5 text-xs text-gray-300" id="report-reason-box">
                    <p className="font-mono text-[10px] text-gray-500 mb-1">REASON:</p>
                    <p className="leading-relaxed">{report.reason}</p>
                    {report.content && (
                      <div className="mt-2 pt-2 border-t border-white/5" id="report-content-box">
                        <span className="font-mono text-[10px] text-red-400 block mb-1">VIOLATING CHAT CONTENT:</span>
                        <p className="font-mono text-xs text-red-200 italic">"{report.content}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-t border-white/5 pt-3" id="report-footer">
                    <div className="text-gray-500 text-[10px]" id="reporter-info">
                      Reported by: <span className="text-gray-300">@{report.reporterName}</span>
                    </div>

                    <div className="flex gap-2" id="report-actions-wrapper">
                      <button
                        onClick={() => handleDismissReport(report.id)}
                        id={`dismiss-report-${report.id}`}
                        className="bg-white/5 text-gray-400 hover:text-white px-3 py-1.5 rounded text-xs transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleBanUser(report.reportedUserId)}
                        id={`ban-user-${report.reportedUserId}`}
                        className="bg-red-950/40 border border-red-500/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded text-xs transition cursor-pointer"
                      >
                        {t.banUserBtn}
                      </button>
                      <button
                        onClick={() => {
                          const targetUser = db.users.find((u) => u.id === report.reportedUserId);
                          if (targetUser) handleDeviceBan(targetUser.deviceId);
                        }}
                        id={`ban-device-${report.reportedUserId}`}
                        className="bg-red-500 text-dark-bg font-semibold px-3 py-1.5 rounded text-xs hover:bg-red-400 transition cursor-pointer"
                      >
                        {t.banDeviceBtn}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: USERS & DEVICES */}
        {activeTab === 'users' && (
          <div className="bg-dark-card border border-white/5 rounded-xl overflow-hidden" id="users-tab-body">
            <div className="overflow-x-auto" id="users-table-container">
              <table className="w-full text-left text-xs border-collapse" id="users-table">
                <thead>
                  <tr className="bg-dark-bg/60 border-b border-white/5 text-gray-500 font-mono text-[10px] uppercase tracking-wider" id="users-table-header">
                    <th className="p-4">User</th>
                    <th className="p-4">Device ID</th>
                    <th className="p-4">Age / Verification</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5" id="users-table-body">
                  {db.users.map((user: User) => {
                    const isDeviceBanned = db.bans.some((b) => b.deviceId === user.deviceId);
                    return (
                      <tr key={user.id} className="hover:bg-white/[0.01]" id={`user-row-${user.id}`}>
                        <td className="p-4 flex items-center gap-3">
                          <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>@{user.username}</span>
                              {user.role === 'owner' && <span className="bg-gold-500 text-dark-bg font-mono text-[8px] font-bold px-1 py-0.2 rounded">OWNER</span>}
                            </div>
                            <div className="text-gray-500 text-[10px] font-mono">{user.email}</div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-gray-400">
                          <div className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-gray-500" />
                            <span>{user.deviceId.substring(0, 12)}...</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-200">{user.age} yrs old</div>
                          <div className="mt-0.5">
                            {user.isVerified === 'verified' && <span className="text-[10px] text-emerald-400 font-mono">Verified Premium</span>}
                            {user.isVerified === 'pending' && <span className="text-[10px] text-amber-500 font-mono">Pending ID review</span>}
                            {user.isVerified === 'unverified' && <span className="text-[10px] text-gray-500 font-mono">Unverified</span>}
                            {user.isVerified === 'rejected' && <span className="text-[10px] text-red-400 font-mono">Verification Rejected</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {user.role !== 'owner' && (
                            <div className="flex justify-end gap-2" id={`user-row-actions-${user.id}`}>
                              {/* Account Ban Button */}
                              <button
                                onClick={() => handleBanUser(user.id)}
                                id={`row-ban-user-${user.id}`}
                                className={`px-2 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                                  user.isBanned
                                    ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/20'
                                    : 'bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/40'
                                }`}
                              >
                                {user.isBanned ? 'Unban Account' : 'Ban Account'}
                              </button>

                              {/* Device Ban Button */}
                              <button
                                onClick={() => handleDeviceBan(user.deviceId)}
                                id={`row-ban-device-${user.id}`}
                                className={`px-2 py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                                  isDeviceBanned
                                    ? 'bg-emerald-500 text-dark-bg font-semibold'
                                    : 'bg-red-500 text-dark-bg font-semibold hover:bg-red-400'
                                }`}
                              >
                                {isDeviceBanned ? 'Unban Device' : 'Ban Device'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VERIFICATIONS */}
        {activeTab === 'verifications' && (
          <div className="space-y-4" id="verifications-tab-body">
            {pendingVerifications.length === 0 ? (
              <div className="text-center py-12 bg-dark-card/50 border border-white/5 rounded-xl text-gray-500 text-sm" id="empty-verifications">
                {t.noVerifications}
              </div>
            ) : (
              pendingVerifications.map((user: User) => (
                <div key={user.id} className="bg-dark-card border border-gold-300/10 rounded-xl p-5" id={`verification-card-${user.id}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="verification-grid">
                    {/* User Profile column */}
                    <div className="flex flex-col gap-3 border-r border-white/5 pr-4" id="verifier-profile-col">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover border border-gold-300" />
                        <div>
                          <h4 className="text-base font-semibold text-white">@{user.username}</h4>
                          <span className="text-xs text-gray-400 font-mono">{user.email}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 text-xs text-gray-400 mt-2" id="verifier-meta">
                        <div>
                          <span className="font-mono text-gray-500 uppercase text-[10px]">Age:</span>{' '}
                          <span className="text-white font-semibold">{user.age} Years Old</span>
                        </div>
                        <div>
                          <span className="font-mono text-gray-500 uppercase text-[10px]">Registered phone:</span>{' '}
                          <span className="text-white font-mono">{user.phone}</span>
                        </div>
                        <div>
                          <span className="font-mono text-gray-500 uppercase text-[10px]">Device ID:</span>{' '}
                          <span className="text-gray-300 font-mono text-[10px]">{user.deviceId}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4" id="verifier-action-buttons">
                        <button
                          onClick={() => handleVerification(user.id, 'verified')}
                          id={`approve-ver-${user.id}`}
                          className="flex-1 bg-emerald-500 text-dark-bg font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:bg-emerald-400 transition cursor-pointer text-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>{t.approveBtn}</span>
                        </button>
                        <button
                          onClick={() => handleVerification(user.id, 'rejected')}
                          id={`reject-ver-${user.id}`}
                          className="flex-1 bg-red-950/40 border border-red-500/20 hover:bg-red-900/40 text-red-400 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer text-xs"
                        >
                          <X className="w-4 h-4" />
                          <span>{t.rejectBtn}</span>
                        </button>
                      </div>
                    </div>

                    {/* ID Proof Display */}
                    <div className="flex flex-col gap-1" id="verifier-id-proof-col">
                      <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Submited ID Document</span>
                      {user.idProofUrl ? (
                        <img
                          src={user.idProofUrl}
                          alt="ID Proof Doc"
                          className="w-full h-36 object-cover rounded-lg border border-white/10 mt-1"
                        />
                      ) : (
                        <div className="w-full h-36 bg-dark-bg border border-dashed border-white/10 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                          No document provided
                        </div>
                      )}
                    </div>

                    {/* Selfie Portrait Display */}
                    <div className="flex flex-col gap-1" id="verifier-selfie-col">
                      <span className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Submitted Live Selfie</span>
                      {user.selfieUrl ? (
                        <img
                          src={user.selfieUrl}
                          alt="Live Selfie Portrait"
                          className="w-full h-36 object-cover rounded-lg border border-white/10 mt-1"
                        />
                      ) : (
                        <div className="w-full h-36 bg-dark-bg border border-dashed border-white/10 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                          No selfie provided
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
