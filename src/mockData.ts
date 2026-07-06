import { User, Report, DeviceBan, LiveRoom } from './types';

// Strict Reserved Usernames
export const RESERVED_USERNAMES = [
  'mr monet',
  'ymonet',
  'mrmonet',
  'y monet',
  'admin',
  'owner',
  'youngmonet'
];

// Content Filtering keywords for Auto-Ban
export const FORBIDDEN_WORDS_HATE = [
  'hate', 'idiot', 'loser', 'trash', 'scam', 'retard', 'bitch', 'bastard', 'fuck', 'asshole'
];

export const FORBIDDEN_WORDS_NSFW = [
  'naked', 'nsfw', 'porn', 'nude', 'nakedness', 'sex', 'boobs', 'penis', 'strip'
];

const INITIAL_USERS: User[] = [
  {
    id: 'owner-id',
    username: 'mr monet',
    email: 'youngmonet434@gmail.com', // Dynamically matches user's email
    phone: '+15550192837',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    age: 29,
    isVerified: 'verified',
    isBanned: false,
    role: 'owner',
    deviceId: 'device-owner',
    followers: ['user-1', 'user-2', 'user-3'],
    following: [],
    matches: [],
    bio: 'Founder and Owner of ymonet. Safety and authenticity are non-negotiable.',
    createdAt: new Date(2026, 0, 1).toISOString()
  },
  {
    id: 'user-1',
    username: 'dj_monet_vibes',
    email: 'dj@ymonet.com',
    phone: '+34600123456',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    age: 24,
    isVerified: 'verified',
    isBanned: false,
    role: 'user',
    deviceId: 'device-dj',
    followers: ['user-2'],
    following: ['owner-id'],
    matches: [],
    bio: 'Streaming electronic ambient sets from Ibiza. 🎧',
    createdAt: new Date(2026, 4, 12).toISOString()
  },
  {
    id: 'user-2',
    username: 'crypto_queen',
    email: 'crypto@ymonet.com',
    phone: '+14159876543',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    age: 26,
    isVerified: 'verified',
    isBanned: false,
    role: 'user',
    deviceId: 'device-crypto',
    followers: ['user-1'],
    following: [],
    matches: [],
    bio: 'Live charts, prediction games, and clean discussions only.',
    createdAt: new Date(2026, 5, 20).toISOString()
  },
  {
    id: 'user-3',
    username: 'paris_chic',
    email: 'paris@ymonet.com',
    phone: '+33612345678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    age: 22,
    isVerified: 'unverified',
    isBanned: false,
    role: 'user',
    deviceId: 'device-paris',
    followers: [],
    following: ['owner-id'],
    matches: [],
    bio: 'Fashion talk and Parisian lifestyle.',
    createdAt: new Date(2026, 6, 2).toISOString()
  },
  {
    id: 'user-troll',
    username: 'troll_king',
    email: 'troll@spammer.com',
    phone: '+12025550119',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    age: 19,
    isVerified: 'rejected',
    isBanned: false,
    role: 'user',
    deviceId: 'device-troll-hardware',
    followers: [],
    following: [],
    matches: [],
    bio: 'Just looking for trouble.',
    createdAt: new Date(2026, 6, 5).toISOString()
  }
];

const INITIAL_ROOMS: LiveRoom[] = [
  {
    id: 'room-1',
    hostId: 'user-1',
    hostUsername: 'dj_monet_vibes',
    title: 'Ibiza Sunset Live DJ Set',
    description: 'Chilled deep house with 3 guests connected. Requesting predictions!',
    participants: ['user-1', 'user-2', 'user-3'],
    viewersCount: 1420,
    tags: ['Music', 'Chill', 'Vibes']
  },
  {
    id: 'room-2',
    hostId: 'user-2',
    hostUsername: 'crypto_queen',
    title: 'Crypto Predictions V1 Testing',
    description: 'Discussing safe strategies. No ads or promotions allowed.',
    participants: ['user-2'],
    viewersCount: 890,
    tags: ['Crypto', 'Games', 'Finance']
  }
];

const INITIAL_REPORTS: Report[] = [
  {
    id: 'report-1',
    reporterId: 'user-2',
    reporterName: 'crypto_queen',
    reportedUserId: 'user-troll',
    reportedUsername: 'troll_king',
    reason: 'Sent insulting slurs and spam during my live session.',
    type: 'chat',
    content: 'You guys are total trash and losers!',
    createdAt: new Date(2026, 6, 5, 23, 10).toISOString(),
    status: 'pending'
  }
];

// State Hydration and Retrieval
export function loadAppDb() {
  const users = localStorage.getItem('ymonet_users');
  const rooms = localStorage.getItem('ymonet_rooms');
  const reports = localStorage.getItem('ymonet_reports');
  const bans = localStorage.getItem('ymonet_bans');

  return {
    users: users ? JSON.parse(users) : INITIAL_USERS,
    rooms: rooms ? JSON.parse(rooms) : INITIAL_ROOMS,
    reports: reports ? JSON.parse(reports) : INITIAL_REPORTS,
    bans: bans ? JSON.parse(bans) : ([] as DeviceBan[]),
  };
}

export function saveAppDb(data: { users: User[]; rooms: LiveRoom[]; reports: Report[]; bans: DeviceBan[] }) {
  localStorage.setItem('ymonet_users', JSON.stringify(data.users));
  localStorage.setItem('ymonet_rooms', JSON.stringify(data.rooms));
  localStorage.setItem('ymonet_reports', JSON.stringify(data.reports));
  localStorage.setItem('ymonet_bans', JSON.stringify(data.bans));
}
