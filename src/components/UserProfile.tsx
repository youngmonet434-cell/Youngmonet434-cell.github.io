import React, { useState } from 'react';
import { loadAppDb, saveAppDb } from '../mockData';
import { User, Report, Language } from '../types';
import { translations } from '../translations';
import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle, UserPlus, UserMinus, Heart, HeartOff, Ban, Upload } from 'lucide-react';

interface UserProfileProps {
  currentLang: Language;
  targetUser: User;
  currentUser: User;
  onRefresh: () => void;
}

export default function UserProfile({ currentLang, targetUser, currentUser, onRefresh }: UserProfileProps) {
  const t = translations[currentLang];
  const isSelf = targetUser.id === currentUser.id;

  // Local interaction states
  const [isApplying, setIsApplying] = useState(false);
  const [idDoc, setIdDoc] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);

  const db = loadAppDb();

  // Handle Apply for Verification
  const handleApplyForVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idDoc) {
      alert('Please upload an ID card document to apply.');
      return;
    }

    const data = loadAppDb();
    const userIdx = data.users.findIndex((u: User) => u.id === currentUser.id);
    if (userIdx !== -1) {
      data.users[userIdx].isVerified = 'pending';
      data.users[userIdx].idProofUrl = idDoc;
      saveAppDb(data);
      setIsApplying(false);
      onRefresh();
      alert('Verification application submitted! You can now log in as Owner (mr monet) to approve/reject.');
    }
  };

  // Follow / Unfollow Toggle
  const handleFollowToggle = () => {
    const data = loadAppDb();
    const targetIdx = data.users.findIndex((u: User) => u.id === targetUser.id);
    const selfIdx = data.users.findIndex((u: User) => u.id === currentUser.id);

    if (targetIdx !== -1 && selfIdx !== -1) {
      const isFollowing = data.users[selfIdx].following.includes(targetUser.id);
      
      if (isFollowing) {
        // Unfollow
        data.users[selfIdx].following = data.users[selfIdx].following.filter((id) => id !== targetUser.id);
        data.users[targetIdx].followers = data.users[targetIdx].followers.filter((id) => id !== currentUser.id);
      } else {
        // Follow
        data.users[selfIdx].following.push(targetUser.id);
        data.users[targetIdx].followers.push(currentUser.id);
      }
      saveAppDb(data);
      onRefresh();
    }
  };

  // Match / Unmatch Toggle
  const handleMatchToggle = () => {
    const data = loadAppDb();
    const selfIdx = data.users.findIndex((u: User) => u.id === currentUser.id);

    if (selfIdx !== -1) {
      const isMatched = data.users[selfIdx].matches.includes(targetUser.id);
      if (isMatched) {
        data.users[selfIdx].matches = data.users[selfIdx].matches.filter((id) => id !== targetUser.id);
      } else {
        data.users[selfIdx].matches.push(targetUser.id);
      }
      saveAppDb(data);
      onRefresh();
    }
  };

  // Handle Report User
  const handleReportUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    const data = loadAppDb();
    const newReport: Report = {
      id: `report-${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.username,
      reportedUserId: targetUser.id,
      reportedUsername: targetUser.username,
      reason: reportReason.trim(),
      type: 'profile',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    data.reports.push(newReport);
    saveAppDb(data);
    setReportReason('');
    setShowReportForm(false);
    alert('User reported successfully. Security teams have flagged this account.');
    onRefresh();
  };

  // Handle Image Upload for Verification ID
  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdDoc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFollowing = currentUser.following.includes(targetUser.id);
  const isMatched = currentUser.matches.includes(targetUser.id);

  return (
    <div className="max-w-md w-full mx-auto space-y-6" id={`user-profile-${targetUser.id}`}>
      {/* Profile Header Card */}
      <div className="bg-dark-card border border-gold-300/10 rounded-2xl p-6 relative overflow-hidden text-center gold-glow" id="profile-card-base">
        {/* Verification Banner indicator */}
        <div className="absolute top-4 right-4" id="profile-verify-badge">
          {targetUser.isVerified === 'verified' && (
            <span className="flex items-center gap-1 bg-gold-500/10 text-gold-300 border border-gold-300/20 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-300" />
              <span>{t.verified}</span>
            </span>
          )}
          {targetUser.isVerified === 'pending' && (
            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{t.pending}</span>
            </span>
          )}
          {targetUser.isVerified === 'unverified' && (
            <span className="flex items-center gap-1 bg-white/5 text-gray-500 border border-white/5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase">
              <span>{t.unverified}</span>
            </span>
          )}
          {targetUser.isVerified === 'rejected' && (
            <span className="flex items-center gap-1 bg-red-950/20 text-red-400 border border-red-500/10 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase">
              <XCircle className="w-3.5 h-3.5" />
              <span>{t.rejected}</span>
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="relative inline-block mx-auto mt-4" id="avatar-container">
          <img
            src={targetUser.avatar}
            alt={targetUser.username}
            className={`w-24 h-24 rounded-full object-cover border-2 ${targetUser.isVerified === 'verified' ? 'border-gold-300' : 'border-zinc-800'}`}
          />
        </div>

        <h3 className="text-xl font-display font-bold text-white mt-4 flex items-center justify-center gap-1.5" id="profile-username">
          <span>@{targetUser.username}</span>
        </h3>
        <p className="text-xs text-gray-500 font-mono" id="profile-email-phone">{targetUser.age} Years Old • {targetUser.phone}</p>

        {targetUser.bio && (
          <p className="text-xs text-gray-300 max-w-xs mx-auto mt-3 font-sans leading-relaxed" id="profile-bio-text">
            {targetUser.bio}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-3 mt-6 text-center" id="profile-stats">
          <div id="followers-stat">
            <span className="block text-lg font-display font-bold text-white">{targetUser.followers.length}</span>
            <span className="text-[10px] font-mono text-gray-500 uppercase">Followers</span>
          </div>
          <div id="following-stat">
            <span className="block text-lg font-display font-bold text-white">{targetUser.following.length}</span>
            <span className="text-[10px] font-mono text-gray-500 uppercase">Following</span>
          </div>
        </div>

        {/* INTERACTION ACTIONS FOR OTHER PROFILES */}
        {!isSelf && (
          <div className="grid grid-cols-3 gap-2 mt-6 text-xs font-mono" id="other-profile-actions">
            <button
              onClick={handleFollowToggle}
              id="follow-btn"
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition cursor-pointer ${
                isFollowing ? 'bg-white/5 border border-white/10 text-white' : 'bg-gold-500 text-dark-bg font-semibold hover:bg-gold-400'
              }`}
            >
              {isFollowing ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{isFollowing ? t.unfollow : t.follow}</span>
            </button>

            <button
              onClick={handleMatchToggle}
              id="match-btn"
              className={`flex items-center justify-center gap-1.5 py-2 px-3 border rounded-lg transition cursor-pointer ${
                isMatched ? 'bg-rose-950/20 border-rose-500/20 text-rose-400' : 'bg-transparent border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isMatched ? 'fill-rose-400' : ''}`} />
              <span>{isMatched ? t.unmatch : t.match}</span>
            </button>

            <button
              onClick={() => setShowReportForm(!showReportForm)}
              id="show-report-form-btn"
              className="flex items-center justify-center gap-1.5 py-2 px-3 border border-red-500/10 text-red-400 rounded-lg hover:bg-red-950/10 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.reportBtn}</span>
            </button>
          </div>
        )}

        {/* SELF PROFILE ACTIONS: APPLY FOR VERIFICATION */}
        {isSelf && (targetUser.isVerified === 'unverified' || targetUser.isVerified === 'rejected') && !isApplying && (
          <button
            onClick={() => setIsApplying(true)}
            id="open-apply-verify-btn"
            className="w-full bg-gold-500 hover:bg-gold-400 text-dark-bg font-semibold py-2 px-4 rounded-lg mt-6 flex items-center justify-center gap-2 transition cursor-pointer text-xs font-mono"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.applyVerifyBtn}</span>
          </button>
        )}
      </div>

      {/* REPORT FORM COMPONENT */}
      {showReportForm && (
        <form onSubmit={handleReportUser} className="bg-dark-card border border-red-500/10 rounded-xl p-5 space-y-3" id="report-form">
          <h4 className="text-xs font-mono uppercase text-red-400 tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>REPORT @{targetUser.username}</span>
          </h4>
          <textarea
            required
            id="report-reason-input"
            rows={3}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Please specify how this user violated community guidelines (e.g. NSFW, insults, harassment)..."
            className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-400"
          />
          <div className="flex gap-2 justify-end" id="report-form-actions">
            <button
              type="button"
              id="cancel-report-btn"
              onClick={() => setShowReportForm(false)}
              className="bg-white/5 hover:bg-white/10 text-gray-400 px-3 py-1.5 rounded text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-report-btn"
              className="bg-red-500 text-dark-bg font-bold px-4 py-1.5 rounded text-xs hover:bg-red-400 transition cursor-pointer"
            >
              Submit Report
            </button>
          </div>
        </form>
      )}

      {/* VERIFICATION APPLICATION FLOW */}
      {isSelf && isApplying && (
        <form onSubmit={handleApplyForVerification} className="bg-dark-card border border-gold-300/10 rounded-xl p-5 space-y-4" id="apply-verification-form">
          <div className="flex justify-between items-center pb-2 border-b border-white/5" id="apply-verification-header">
            <h4 className="text-xs font-mono uppercase text-gold-300 tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Apply for premium verification</span>
            </h4>
            <button
              type="button"
              id="close-apply-verify-btn"
              onClick={() => setIsApplying(false)}
              className="text-gray-500 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-400 leading-normal" id="apply-verification-desc">
            Upload an official document image (Passport, ID Card, Driver's License) to verify your credentials. Real-time owner "mr monet" will review this application in the admin panel.
          </p>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">ID Document Proof</label>
            <div className="relative border border-dashed border-white/10 hover:border-gold-300/30 rounded-lg p-4 text-center cursor-pointer bg-dark-bg/40 hover:bg-dark-bg transition-all" id="profile-id-upload-wrapper">
              <input
                type="file"
                accept="image/*"
                required
                id="profile-id-file-input"
                onChange={handleIdUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {idDoc ? (
                <div className="flex items-center justify-center gap-2 text-xs text-gold-300" id="profile-id-preview">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ID Document attached ({idDoc.substring(0, 15)}...)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-500" id="profile-id-placeholder">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-xs">Drag/Click to upload ID photo</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            id="profile-submit-verify-btn"
            className="w-full bg-gold-500 hover:bg-gold-400 text-dark-bg font-semibold py-2 px-4 rounded-lg transition cursor-pointer text-xs font-mono"
          >
            Submit Application
          </button>
        </form>
      )}
    </div>
  );
}
