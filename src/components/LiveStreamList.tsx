import React, { useState } from 'react';
import { loadAppDb, saveAppDb } from '../mockData';
import { LiveRoom, User, Language } from '../types';
import { translations } from '../translations';
import { Play, Sparkles, Plus, Radio, Users, Eye } from 'lucide-react';

interface LiveStreamListProps {
  currentLang: Language;
  currentUser: User;
  onJoinRoom: (roomId: string) => void;
  onRefresh: () => void;
}

export default function LiveStreamList({ currentLang, currentUser, onJoinRoom, onRefresh }: LiveStreamListProps) {
  const t = translations[currentLang];
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const db = loadAppDb();

  // Create Live Room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const data = loadAppDb();

    // Verify user is verified/unverified (any user can stream, but premium hosts get a badge)
    const newRoom: LiveRoom = {
      id: `room-${Date.now()}`,
      hostId: currentUser.id,
      hostUsername: currentUser.username,
      title: title.trim(),
      description: description.trim(),
      participants: [currentUser.id], // Host is first participant
      viewersCount: Math.floor(10 + Math.random() * 150), // Seed viewers for high-fidelity feel
      tags: tagsInput ? tagsInput.split(',').map((tag) => tag.trim()) : ['Live', 'Interactive']
    };

    data.rooms.push(newRoom);
    saveAppDb(data);

    setTitle('');
    setDescription('');
    setTagsInput('');
    setShowCreateForm(false);
    onJoinRoom(newRoom.id);
    onRefresh();
  };

  return (
    <div className="space-y-6" id="stream-list-container">
      {/* Platform Banner / Create Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-dark-card border border-gold-300/10 rounded-2xl p-6 gap-4 gold-glow" id="platform-banner">
        <div>
          <span className="text-[10px] font-mono text-gold-300 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Radio className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            <span>COMMUNITY BROADCASTS</span>
          </span>
          <h2 className="text-xl font-display font-semibold text-white tracking-wide uppercase">
            {t.appName.toUpperCase()} DIRECT STREAMING
          </h2>
          <p className="text-xs text-gray-400 mt-1">Multi-peer grid streaming. Up to 7 people connected simultaneously.</p>
        </div>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            id="open-create-stream-btn"
            className="flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-bg font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer font-mono shadow-lg shadow-gold-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>{t.goLiveBtn}</span>
          </button>
        )}
      </div>

      {/* CREATE STREAM FORM */}
      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="bg-dark-card border border-gold-300/15 rounded-xl p-6 space-y-4" id="create-stream-form">
          <div className="flex justify-between items-center pb-2 border-b border-white/5" id="create-stream-header">
            <h3 className="text-sm font-display font-medium text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-300" />
              <span>Broadcast Configuration</span>
            </h3>
            <button
              type="button"
              id="cancel-create-stream-btn"
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="create-stream-fields">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">Stream Title</label>
              <input
                type="text"
                required
                id="stream-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.streamTitlePl}
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-300"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">Tags (comma-separated)</label>
              <input
                type="text"
                id="stream-tags-input"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Music, Talk, Prediction, Gaming"
                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-gold-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea
                id="stream-description-input"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give viewers details about your room guidelines, topic, or prediction games..."
                className="w-full bg-dark-bg border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-gold-300"
              />
            </div>
          </div>

          <button
            type="submit"
            id="submit-create-stream-btn"
            className="w-full bg-gold-500 hover:bg-gold-400 text-dark-bg font-bold py-2 px-4 rounded-lg transition cursor-pointer text-xs font-mono"
          >
            Start Broadcast Room
          </button>
        </form>
      )}

      {/* STREAMS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="streams-grid">
        {db.rooms.map((room: LiveRoom) => {
          // Find host details to show verified state
          const hostUser = db.users.find((u) => u.id === room.hostId);
          const isHostVerified = hostUser?.isVerified === 'verified';

          return (
            <div key={room.id} className="group relative bg-dark-card border border-white/5 hover:border-gold-300/25 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 gold-glow hover:scale-[1.01]" id={`room-card-${room.id}`}>
              <div className="space-y-3" id={`room-card-content-${room.id}`}>
                {/* Card Top */}
                <div className="flex justify-between items-center" id="room-card-header">
                  <div className="flex items-center gap-2">
                    <img
                      src={hostUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt={room.hostUsername}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1">
                        <span>@{room.hostUsername}</span>
                        {isHostVerified && (
                          <span className="w-3.5 h-3.5 bg-gold-500/10 border border-gold-300/20 text-gold-300 rounded-full flex items-center justify-center text-[8px] font-bold" title="Verified Premium">✓</span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-500 font-mono">ROOM OWNER</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/15 px-2.5 py-1 rounded-full text-[10px] font-mono text-red-400 font-medium" id="room-viewer-count">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                    <span>{room.viewersCount} {t.viewers}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-sm font-display font-semibold text-white tracking-wide group-hover:text-gold-300 transition-colors">
                    {room.title}
                  </h4>
                  {room.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 font-sans leading-relaxed">
                      {room.description}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1" id="room-tags-wrapper">
                  {room.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-mono bg-white/5 text-gray-400 px-2 py-0.5 rounded border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Join Action & Stats Footer */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4" id="room-card-footer">
                <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500" id="room-connections-count">
                  <Users className="w-3.5 h-3.5 text-gold-300/60" />
                  <span>{room.participants.length} / 7 Active</span>
                </div>

                <button
                  onClick={() => onJoinRoom(room.id)}
                  id={`join-room-btn-${room.id}`}
                  className="flex items-center gap-1 bg-white/5 hover:bg-gold-500 hover:text-dark-bg border border-white/10 group-hover:border-gold-300/30 text-xs font-mono py-1.5 px-3 rounded-lg text-white transition cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{t.joinStream}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
