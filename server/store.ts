import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  friendCode: string;
  username: string;
  boardOrExam: string;
  classGrade: string;
  stream: string;
  targetExam: string;
  xp: number;
  level: number;
  streakDays: number;
  todayStudyMinutes: number;
  totalStudyMinutes: number;
  weakTopics: string[];
  strongTopics: string[];
}

export interface VideoAnalysisRecord {
  id: string;
  userId: string;
  sourceUrl: string;
  youtubeId?: string;
  title: string;
  duration?: string;
  channelTitle?: string;
  status: 'UPLOADING' | 'PROCESSING' | 'ANALYZING' | 'EXTRACTING_CONTENT' | 'GENERATING_NOTES' | 'GENERATING_QUESTIONS' | 'SAVING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  detectedSubject?: string;
  detectedTopic?: string;
  detectedChapter?: string;
  estimatedAcademicLevel?: string;
  isAiEstimated: boolean;
  overview?: string;
  timestamps: Array<{
    timestamp: string;
    seconds: number;
    title: string;
    summary: string;
  }>;
  notes?: {
    complete: string;
    easy: string;
    revision: string;
    ultraQuick: string;
    formulaSheet: Array<{
      formula: string;
      description: string;
      symbols: string;
      units: string;
      conditions: string;
      whenToUse: string;
    }>;
    definitions: Array<{
      term: string;
      definition: string;
      importance: string;
    }>;
    derivations: Array<{
      title: string;
      steps: string[];
      keyTakeaway: string;
    }>;
    examples: Array<{
      problem: string;
      solution: string;
      examTip: string;
    }>;
    commonMistakes: Array<{
      mistake: string;
      whyWrong: string;
      correctWay: string;
    }>;
    exceptions: Array<{
      rule: string;
      exception: string;
      examCaution: string;
    }>;
    keyTakeaways: string[];
  };
  questions: any[];
  flashcards: Array<{
    id: string;
    front: string;
    back: string;
    type: string;
    subject?: string;
    chapter?: string;
  }>;
  miniTest: {
    id: string;
    title: string;
    questions: any[];
  };
  uncertainties?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface FriendRecord {
  userId: string;
  friendId: string;
  friendName: string;
  friendCode: string;
  friendAvatar: string;
  friendLevel: number;
  friendStreak: number;
  addedAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  sharedMaterialTitle?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  creatorId: string;
  inviteCode: string;
  members: Array<{
    userId: string;
    name: string;
    role: 'admin' | 'member';
    joinedAt: string;
  }>;
  messages: GroupMessage[];
  sharedMaterials: any[];
  createdAt: string;
}

export interface DataStore {
  users: Record<string, UserRecord>;
  videoAnalyses: Record<string, VideoAnalysisRecord>;
  studyMaterials: any[];
  friendRequests: FriendRequest[];
  friends: FriendRecord[];
  groups: Record<string, StudyGroup>;
  doubts: any[];
  testAttempts: any[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'adhyay_store.json');

// Initial default seed
const defaultStore: DataStore = {
  users: {
    'user_default': {
      id: 'user_default',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@adhyay.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      friendCode: 'ADHYAY-7482',
      username: 'aarav_sharma',
      boardOrExam: 'CBSE',
      classGrade: 'Class 12',
      stream: 'Science (PCM)',
      targetExam: 'JEE Main & CBSE Boards',
      xp: 1450,
      level: 6,
      streakDays: 14,
      todayStudyMinutes: 45,
      totalStudyMinutes: 1840,
      weakTopics: ['Rotational Mechanics', 'Electromagnetic Induction', 'Optical Isomerism'],
      strongTopics: ['Current Electricity', 'Thermodynamics', 'Matrices & Determinants'],
    },
  },
  videoAnalyses: {},
  studyMaterials: [],
  friendRequests: [
    {
      id: 'req_1',
      senderId: 'user_priya',
      senderName: 'Priya Patel',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      receiverId: 'user_default',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  friends: [
    {
      userId: 'user_default',
      friendId: 'user_rohit',
      friendName: 'Rohit Verma',
      friendCode: 'ADHYAY-9921',
      friendAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      friendLevel: 7,
      friendStreak: 18,
      addedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      userId: 'user_default',
      friendId: 'user_ananya',
      friendName: 'Ananya Iyer',
      friendCode: 'ADHYAY-3381',
      friendAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      friendLevel: 5,
      friendStreak: 9,
      addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  groups: {
    'grp_jee_physics': {
      id: 'grp_jee_physics',
      name: '⚡ JEE Physics Champions',
      description: 'Daily concept discussions, tricky derivations & numerical problem solving for JEE 2025/2026.',
      category: 'Physics',
      creatorId: 'user_rohit',
      inviteCode: 'JEE-PHY-2025',
      members: [
        { userId: 'user_rohit', name: 'Rohit Verma', role: 'admin', joinedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
        { userId: 'user_default', name: 'Aarav Sharma', role: 'member', joinedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
        { userId: 'user_ananya', name: 'Ananya Iyer', role: 'member', joinedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      ],
      messages: [
        {
          id: 'msg_1',
          groupId: 'grp_jee_physics',
          senderId: 'user_rohit',
          senderName: 'Rohit Verma',
          senderAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
          text: 'Welcome to JEE Physics Study Group! Check out the new Current Electricity Lecture Study Pack.',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
        {
          id: 'msg_2',
          groupId: 'grp_jee_physics',
          senderId: 'user_ananya',
          senderName: 'Ananya Iyer',
          senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
          text: 'Hey everyone! Has anyone solved the wire-stretching numerical from today’s mini-test?',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ],
      sharedMaterials: [],
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  },
  doubts: [],
  testAttempts: [],
};

class StoreManager {
  private store: DataStore = defaultStore;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.store = { ...defaultStore, ...parsed };
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Could not read persistent store, using in-memory default:', err);
      this.store = defaultStore;
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving store to disk:', err);
    }
  }

  // Users
  getUser(id: string): UserRecord {
    if (!this.store.users[id]) {
      this.store.users[id] = {
        ...defaultStore.users['user_default'],
        id,
      };
      this.save();
    }
    return this.store.users[id];
  }

  updateUser(id: string, updates: Partial<UserRecord>): UserRecord {
    const current = this.getUser(id);
    this.store.users[id] = { ...current, ...updates };
    this.save();
    return this.store.users[id];
  }

  searchUsers(query: string, currentUserId: string): UserRecord[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return Object.values(this.store.users).filter(
      (u) =>
        u.id !== currentUserId &&
        (u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.friendCode.toLowerCase() === q)
    );
  }

  // Video Analyses
  saveVideoAnalysis(analysis: VideoAnalysisRecord) {
    this.store.videoAnalyses[analysis.id] = analysis;
    this.save();
    return analysis;
  }

  getVideoAnalysis(id: string): VideoAnalysisRecord | undefined {
    return this.store.videoAnalyses[id];
  }

  updateVideoStatus(id: string, status: VideoAnalysisRecord['status'], errorMessage?: string) {
    if (this.store.videoAnalyses[id]) {
      this.store.videoAnalyses[id].status = status;
      if (errorMessage) {
        this.store.videoAnalyses[id].errorMessage = errorMessage;
      }
      this.store.videoAnalyses[id].updatedAt = new Date().toISOString();
      this.save();
    }
  }

  // Friends
  getFriends(userId: string): FriendRecord[] {
    return this.store.friends.filter((f) => f.userId === userId);
  }

  getFriendRequests(userId: string): FriendRequest[] {
    return this.store.friendRequests.filter((r) => r.receiverId === userId && r.status === 'pending');
  }

  sendFriendRequest(senderId: string, receiverFriendCodeOrUsername: string): { success: boolean; message: string } {
    const target = Object.values(this.store.users).find(
      (u) =>
        u.friendCode.toLowerCase() === receiverFriendCodeOrUsername.toLowerCase() ||
        u.username.toLowerCase() === receiverFriendCodeOrUsername.toLowerCase()
    );

    if (!target) {
      return { success: false, message: 'No student found with that friend code or username.' };
    }

    if (target.id === senderId) {
      return { success: false, message: 'You cannot add yourself as a study friend.' };
    }

    const existingFriend = this.store.friends.find((f) => f.userId === senderId && f.friendId === target.id);
    if (existingFriend) {
      return { success: false, message: `${target.name} is already in your study friends list.` };
    }

    const sender = this.getUser(senderId);
    const newReq: FriendRequest = {
      id: `req_${Date.now()}`,
      senderId,
      senderName: sender.name,
      senderAvatar: sender.avatarUrl,
      receiverId: target.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.store.friendRequests.push(newReq);
    this.save();
    return { success: true, message: `Friend request sent to ${target.name}!` };
  }

  respondFriendRequest(requestId: string, action: 'accept' | 'decline'): { success: boolean; message: string } {
    const req = this.store.friendRequests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: 'Request not found.' };
    }

    req.status = action === 'accept' ? 'accepted' : 'declined';

    if (action === 'accept') {
      const sender = this.getUser(req.senderId);
      const receiver = this.getUser(req.receiverId);

      this.store.friends.push({
        userId: req.receiverId,
        friendId: req.senderId,
        friendName: sender.name,
        friendCode: sender.friendCode,
        friendAvatar: sender.avatarUrl,
        friendLevel: sender.level,
        friendStreak: sender.streakDays,
        addedAt: new Date().toISOString(),
      });

      this.store.friends.push({
        userId: req.senderId,
        friendId: req.receiverId,
        friendName: receiver.name,
        friendCode: receiver.friendCode,
        friendAvatar: receiver.avatarUrl,
        friendLevel: receiver.level,
        friendStreak: receiver.streakDays,
        addedAt: new Date().toISOString(),
      });
    }

    this.save();
    return { success: true, message: action === 'accept' ? 'Friend request accepted!' : 'Friend request declined.' };
  }

  removeFriend(userId: string, friendId: string) {
    this.store.friends = this.store.friends.filter(
      (f) => !(f.userId === userId && f.friendId === friendId) && !(f.userId === friendId && f.friendId === userId)
    );
    this.save();
  }

  // Groups
  getGroups(userId: string): StudyGroup[] {
    return Object.values(this.store.groups).filter((g) => g.members.some((m) => m.userId === userId));
  }

  getGroup(groupId: string): StudyGroup | undefined {
    return this.store.groups[groupId];
  }

  createGroup(creatorId: string, name: string, description: string, category: string): StudyGroup {
    const creator = this.getUser(creatorId);
    const id = `grp_${Date.now()}`;
    const newGroup: StudyGroup = {
      id,
      name,
      description,
      category: category || 'General Study',
      creatorId,
      inviteCode: `ADHYAY-${Math.floor(1000 + Math.random() * 9000)}`,
      members: [
        {
          userId: creatorId,
          name: creator.name,
          role: 'admin',
          joinedAt: new Date().toISOString(),
        },
      ],
      messages: [
        {
          id: `msg_${Date.now()}`,
          groupId: id,
          senderId: creatorId,
          senderName: creator.name,
          senderAvatar: creator.avatarUrl,
          text: `Welcome to "${name}"! Let's study together and master our subjects.`,
          createdAt: new Date().toISOString(),
        },
      ],
      sharedMaterials: [],
      createdAt: new Date().toISOString(),
    };

    this.store.groups[id] = newGroup;
    this.save();
    return newGroup;
  }

  addGroupMessage(groupId: string, senderId: string, text: string, sharedMaterialTitle?: string): GroupMessage | null {
    const group = this.store.groups[groupId];
    if (!group) return null;

    const sender = this.getUser(senderId);
    const msg: GroupMessage = {
      id: `msg_${Date.now()}`,
      groupId,
      senderId,
      senderName: sender.name,
      senderAvatar: sender.avatarUrl,
      text,
      sharedMaterialTitle,
      createdAt: new Date().toISOString(),
    };

    group.messages.push(msg);
    this.save();
    return msg;
  }
}

export const store = new StoreManager();
