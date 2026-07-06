import React, { useState, useEffect, useRef } from 'react';
import { loadAppDb, saveAppDb, FORBIDDEN_WORDS_HATE, FORBIDDEN_WORDS_NSFW } from '../mockData';
import { LiveRoom, User, ChatMessage, Language, Report } from '../types';
import { translations } from '../translations';
import { Send, ShieldAlert, Sparkles, LogOut, Video, VideoOff, Mic, MicOff, Star, AlertTriangle, Play } from 'lucide-react';

interface LiveStreamRoomProps {
  currentLang: Language;
  roomId: string;
  currentUser: User;
  onLeave: () => void;
  onAutoBanTriggered: (reason: string) => void;
  onRefresh: () => void;
}

export default function LiveStreamRoom({ currentLang, roomId, currentUser, onLeave, onAutoBanTriggered, onRefresh }: LiveStreamRoomProps) {
  const t = translations[currentLang];

  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Audio / Video stream simulation
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // Interactive mini-game state
  const [predictionGoal, setPredictionGoal] = useState('Will DJ stream past midnight?');
  const [yesVotes, setYesVotes] = useState(140);
  const [noVotes, setNoVotes] = useState(65);
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize Room & Audio/Video
  useEffect(() => {
    const db = loadAppDb();
    const activeRoom = db.rooms.find((r) => r.id === roomId);
    if (activeRoom) {
      setRoom(activeRoom);
      
      // Seed initial chat messages
      setMessages([
        { id: 'msg-1', username: 'system', text: `Welcome to ${activeRoom.title}! Safety-Filter: Enabled.`, isSystem: true, timestamp: new Date().toLocaleTimeString() },
        { id: 'msg-2', username: 'crypto_queen', text: 'Hey guys! Testing V1 platform connection. Speed looks great.', timestamp: new Date().toLocaleTimeString() },
        { id: 'msg-3', username: 'paris_chic', text: 'Stellar visual density! Love the dark theme.', timestamp: new Date().toLocaleTimeString() }
      ]);

      // Request Webcam access for local peer simulation if requested
      if (isCamOn) {
        navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
          .then((stream) => {
            setLocalStream(stream);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn('Webcam permission denied, falling back to digital avatar stream.', err);
          });
      }
    }

    return () => {
      // Cleanup webcam stream on exit
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, [roomId, isCamOn]);

  // Scroll Chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!room) return <div className="text-center py-12 text-gray-400">Loading live broadcast...</div>;

  // Handle Send Message (With Auto-Ban filters)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.toLowerCase();

    // 1. CHAT FILTER: Hate Speech / Insults Auto-Ban
    const hasHate = FORBIDDEN_WORDS_HATE.some((word) => text.includes(word));
    if (hasHate) {
      triggerInstantBan(t.hateDetected);
      return;
    }

    // 2. MEDIA FILTER: NSFW / Nakedness Text/Upload simulated filter Auto-Ban
    const hasNsfw = FORBIDDEN_WORDS_NSFW.some((word) => text.includes(word));
    if (hasNsfw) {
      triggerInstantBan(t.nsfwDetected);
      return;
    }

    // Regular valid message post
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      username: currentUser.username,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate occasional automatic audience response
    setTimeout(() => {
      const mockResponses = [
        'Awesome vibes!',
        'No payments & No fakes is a game changer 📈',
        'Watching from Madrid!',
        'This V1 build is solid.',
        'Great prediction game.'
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-sim-${Date.now()}`,
          username: ['paris_chic', 'crypto_queen', 'ibiza_rocker'][Math.floor(Math.random() * 3)],
          text: randomResponse,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }, 1500);
  };

  // Trigger Account & Device ban
  const triggerInstantBan = (banReason: string) => {
    const dbData = loadAppDb();
    
    // Add User to ban
    dbData.users = dbData.users.map((u: User) => 
      u.id === currentUser.id ? { ...u, isBanned: true } : u
    );

    // Add Device to banned list
    const currentDevice = localStorage.getItem('ymonet_current_device_id') || 'simulated-device-id-123';
    if (!dbData.bans.some((b) => b.deviceId === currentDevice)) {
      dbData.bans.push({
        deviceId: currentDevice,
        reason: banReason,
        bannedAt: new Date().toISOString()
      });
    }

    saveAppDb(dbData);
    onAutoBanTriggered(banReason);
  };

  // Simulate unsafe media upload (Immediate NSFW Ban)
  const handleSimulateNsfwUpload = () => {
    const confirmTest = window.confirm('WARNING: This will simulate uploading NSFW/Nakedness content. Your account and device will be instantly blacklisted. Proceed with auto-ban test?');
    if (confirmTest) {
      triggerInstantBan(t.nsfwDetected);
    }
  };

  // Vote in prediction mini-game
  const handleVote = (option: 'yes' | 'no') => {
    if (voted) return;
    setVoted(option);
    if (option === 'yes') {
      setYesVotes((prev) => prev + 1);
    } else {
      setNoVotes((prev) => prev + 1);
    }
  };

  // Report the host (registers a pending flag for mr monet)
  const handleReportHost = () => {
    const reason = window.prompt(`Please provide a reason for reporting host @${room.hostUsername}:`);
    if (reason && reason.trim()) {
      const dbData = loadAppDb();
      const newReport: Report = {
        id: `report-${Date.now()}`,
        reporterId: currentUser.id,
        reporterName: currentUser.username,
        reportedUserId: room.hostId,
        reportedUsername: room.hostUsername,
        reason: `Live Stream Flag: ${reason.trim()}`,
        type: 'live',
        content: `Stream room title: "${room.title}"`,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      dbData.reports.push(newReport);
      saveAppDb(dbData);
      alert('Host reported. Security team "mr monet" has been flagged.');
      onRefresh();
    }
  };

  const handleSendGift = () => {
    alert(t.giftComingSoon);
  };

  // Join slots configuration (7 slots: Slot 1 is host, 2-7 are guests)
  const slots = [
    { slotNum: 1, user: room.hostUsername, isHost: true, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { slotNum: 2, user: 'crypto_queen', isHost: false, avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
    { slotNum: 3, user: 'paris_chic', isHost: false, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { slotNum: 4, user: currentUser.id !== room.hostId ? currentUser.username : null, isHost: false, avatarUrl: currentUser.avatar, isSelf: true },
    { slotNum: 5, user: null, isHost: false },
    { slotNum: 6, user: null, isHost: false },
    { slotNum: 7, user: null, isHost: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id={`live-room-${room.id}`}>
      {/* LEFT: Multi-stream Grid (Up to 7 people) */}
      <div className="lg:col-span-3 space-y-4" id="streams-grid-wrapper">
        <div className="flex justify-between items-center bg-dark-card border border-white/5 p-4 rounded-xl" id="room-nav-header">
          <div>
            <h3 className="text-base font-display font-semibold text-white tracking-wide">{room.title}</h3>
            <p className="text-xs text-gray-500 font-mono">Host: @{room.hostUsername} • {room.viewersCount} watching</p>
          </div>
          <button
            onClick={onLeave}
            id="leave-stream-btn"
            className="flex items-center gap-1.5 bg-red-950/20 text-red-400 hover:bg-red-950/40 border border-red-500/10 px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.leaveStream}</span>
          </button>
        </div>

        {/* 7-Grid Stream Containers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3" id="multi-stream-slots">
          {slots.map((slot) => {
            const hasUser = slot.user !== null;
            return (
              <div
                key={slot.slotNum}
                id={`stream-slot-${slot.slotNum}`}
                className={`relative aspect-video sm:aspect-square bg-dark-bg border rounded-xl overflow-hidden flex flex-col items-center justify-center transition-all ${
                  slot.isHost 
                    ? 'col-span-2 row-span-2 md:col-span-2 md:row-span-2 border-gold-300/30' 
                    : 'border-white/5 hover:border-gold-300/10'
                }`}
              >
                {/* Simulated Webcam video feeds or fallback visual waves */}
                {hasUser ? (
                  slot.isHost && localStream ? (
                    /* Actual camera view for local host */
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : slot.isSelf && localStream ? (
                    /* Camera view for self joining as guest */
                    <video
                      src=""
                      autoPlay
                      playsInline
                      muted
                      ref={(el) => {
                        if (el) el.srcObject = localStream;
                      }}
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    /* Fallback luxury animated vector visuals */
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-zinc-950" id={`fallback-anim-${slot.slotNum}`}>
                      <div className="relative mb-3" id="fallback-avatar-wrapper">
                        <img src={slot.avatarUrl} alt={slot.user!} className="w-12 h-12 rounded-full object-cover border border-gold-300/30" />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-dark-bg rounded-full animate-pulse" />
                      </div>
                      
                      {/* Interactive vector audio wave simulation */}
                      <div className="flex gap-1 items-end h-6 mt-1" id="audio-wave-sim">
                        <span className="w-0.5 bg-gold-300 rounded-full animate-[bounce_1s_infinite_100ms] h-4" />
                        <span className="w-0.5 bg-gold-300 rounded-full animate-[bounce_1s_infinite_300ms] h-5" />
                        <span className="w-0.5 bg-gold-300 rounded-full animate-[bounce_1s_infinite_500ms] h-3" />
                        <span className="w-0.5 bg-gold-300 rounded-full animate-[bounce_1s_infinite_200ms] h-4" />
                      </div>
                    </div>
                  )
                ) : (
                  /* Empty open guest slot */
                  <div className="text-center p-3 text-gray-600 font-mono text-[10px]" id="empty-slot-msg">
                    <VideoOff className="w-4 h-4 mx-auto mb-1 text-gray-700" />
                    <span>Slot {slot.slotNum} Open</span>
                  </div>
                )}

                {/* Slot user tags */}
                {hasUser && (
                  <div className="absolute bottom-2 left-2 bg-dark-bg/80 backdrop-blur border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span>@{slot.user} {slot.isHost ? '(HOST)' : ''}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* HOST & GUEST CONTROLS */}
        <div className="flex flex-wrap items-center justify-between bg-dark-card border border-white/5 p-4 rounded-xl gap-4" id="media-controls-container">
          <div className="flex items-center gap-2" id="media-mutes">
            <button
              onClick={() => setIsCamOn(!isCamOn)}
              id="toggle-cam-btn"
              className={`p-2.5 rounded-lg border transition cursor-pointer ${isCamOn ? 'bg-gold-500 text-dark-bg border-gold-400' : 'bg-transparent border-white/10 text-gray-400'}`}
              title={isCamOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              id="toggle-mic-btn"
              className={`p-2.5 rounded-lg border transition cursor-pointer ${isMicOn ? 'bg-gold-500 text-dark-bg border-gold-400' : 'bg-transparent border-white/10 text-gray-400'}`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2" id="action-buttons-group">
            <button
              onClick={handleSendGift}
              id="send-gift-btn"
              className="flex items-center gap-1 bg-gold-500 text-dark-bg font-semibold text-xs py-2 px-3 rounded-lg hover:bg-gold-400 transition cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{t.sendGift}</span>
            </button>

            <button
              onClick={handleReportHost}
              id="report-host-btn"
              className="flex items-center gap-1.5 bg-transparent border border-red-500/10 text-red-400 text-xs py-2 px-3 rounded-lg hover:bg-red-950/10 transition cursor-pointer font-mono"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.reportBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Live Stream Chat Feed & Interactive Games */}
      <div className="flex flex-col gap-4" id="room-sidebar-wrapper">
        {/* Prediction Game Card */}
        <div className="bg-dark-card border border-gold-300/10 rounded-xl p-4 space-y-3" id="prediction-game-card">
          <div className="flex items-center gap-1.5 text-gold-300 font-display text-xs font-semibold uppercase tracking-wider" id="game-title">
            <Sparkles className="w-4 h-4" />
            <span>{t.gamesTitle}</span>
          </div>

          <div className="bg-dark-bg p-3 rounded border border-white/5 space-y-2 text-xs" id="game-body">
            <p className="text-gray-300 font-medium">{predictionGoal}</p>

            <div className="grid grid-cols-2 gap-2 mt-2" id="game-options">
              <button
                disabled={voted !== null}
                onClick={() => handleVote('yes')}
                id="vote-yes-btn"
                className={`py-1.5 px-3 rounded text-center font-semibold cursor-pointer ${
                  voted === 'yes'
                    ? 'bg-gold-500 text-dark-bg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300'
                }`}
              >
                YES ({yesVotes})
              </button>
              <button
                disabled={voted !== null}
                onClick={() => handleVote('no')}
                id="vote-no-btn"
                className={`py-1.5 px-3 rounded text-center font-semibold cursor-pointer ${
                  voted === 'no'
                    ? 'bg-gold-500 text-dark-bg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300'
                }`}
              >
                NO ({noVotes})
              </button>
            </div>
            {voted && <p className="text-[10px] text-gold-300/80 font-mono text-center">Prediction vote received! Reward triggers in V2.</p>}
          </div>
        </div>

        {/* Chat Component */}
        <div className="bg-dark-card border border-white/5 rounded-xl flex flex-col justify-between h-[360px]" id="chat-component">
          {/* Messages Feed */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1" id="chat-messages-scroller">
            {messages.map((msg) => (
              <div key={msg.id} className="text-xs" id={`chat-msg-${msg.id}`}>
                {msg.isSystem ? (
                  <div className="bg-white/5 text-gray-400 border border-white/5 p-2 rounded-lg font-mono text-[10px] leading-relaxed">
                    {msg.text}
                  </div>
                ) : (
                  <div className="leading-relaxed">
                    <span className="font-mono font-semibold text-gold-300 mr-1.5">@{msg.username}:</span>
                    <span className="text-gray-300">{msg.text}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-white/5 bg-dark-bg/40 space-y-2" id="chat-input-bar">
            {/* Dangerous action test */}
            <div className="flex justify-end" id="nsfw-simulation-wrapper">
              <button
                type="button"
                onClick={handleSimulateNsfwUpload}
                id="sim-nsfw-btn"
                className="text-[9px] font-mono text-red-500/80 hover:text-red-400 bg-red-950/20 border border-red-500/20 px-2 py-0.5 rounded cursor-pointer transition-all"
                title="Test media safety filters"
              >
                ⚠️ Test NSFW Media Block
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2" id="chat-submit-form">
              <input
                type="text"
                required
                id="chat-text-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.chatPlaceholder}
                className="flex-1 bg-dark-bg border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold-300"
              />
              <button
                type="submit"
                id="send-chat-msg-btn"
                className="bg-gold-500 hover:bg-gold-400 text-dark-bg p-1.5 rounded-lg transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
