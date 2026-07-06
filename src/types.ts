export type Language = 'en' | 'es' | 'fr' | 'ar' | 'pt';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  age: number;
  idProofUrl?: string;
  selfieUrl?: string;
  isVerified: 'unverified' | 'pending' | 'verified' | 'rejected';
  isBanned: boolean;
  role: 'user' | 'owner';
  deviceId: string;
  followers: string[]; // List of user IDs
  following: string[]; // List of user IDs
  matches: string[];   // List of user IDs
  bio?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUsername: string;
  reason: string;
  type: 'chat' | 'live' | 'profile';
  content?: string; // Message content or room title
  createdAt: string;
  status: 'pending' | 'dismissed' | 'banned';
}

export interface DeviceBan {
  deviceId: string;
  reason: string;
  bannedAt: string;
}

export interface LiveRoom {
  id: string;
  hostId: string;
  hostUsername: string;
  title: string;
  description: string;
  participants: string[]; // Up to 7 users (including host)
  viewersCount: number;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}
