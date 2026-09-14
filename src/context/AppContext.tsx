import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Session, User } from '@supabase/supabase-js';
import { supabase, signOut, cleanAuthUrlParams } from '../lib/supabase';
import {
  UserProfile,
  StudyMaterial,
  DoubtPost,
  DailyMission,
  KnowledgeNode,
  Question,
  MockTest,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_DAILY_MISSIONS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_DOUBTS,
  INITIAL_PYQ_BANK,
  INITIAL_KNOWLEDGE_NODES,
} from '../data/initialData';

export type NavigationTab =
  | 'home'
  | 'video'
  | 'study'
  | 'vault'
  | 'doubts'
  | 'friends'
  | 'tests'
  | 'levelup'
  | 'recall'
  | 'scan'
  | 'profile';

interface AppContextType {
  // Auth & Session
  session: Session | null;
  authUser: User | null;
  isLoadingSession: boolean;
  logout: () => Promise<void>;

  user: UserProfile;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  materials: StudyMaterial[];
  activeMaterial: StudyMaterial | null;
  setActiveMaterial: (material: StudyMaterial | null) => void;
  dailyMissions: DailyMission[];
  doubts: DoubtPost[];
  pyqBank: Question[];
  knowledgeNodes: KnowledgeNode[];
  completedTests: MockTest[];
  
  // Modals
  isTutorOpen: boolean;
  setIsTutorOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
  isSprintOpen: boolean;
  setIsSprintOpen: (open: boolean) => void;
  isGoogleAuthModalOpen: boolean;
  setIsGoogleAuthModalOpen: (open: boolean) => void;

  // Actions
  updateUser: (updates: Partial<UserProfile>) => void;
  addXP: (amount: number, reason: string) => void;
  addStudyMaterial: (material: StudyMaterial) => void;
  deleteStudyMaterial: (id: string) => void;
  toggleFavoriteMaterial: (id: string) => void;
  updateMaterialNotes: (id: string, notes: any) => void;
  addDoubt: (doubt: Omit<DoubtPost, 'id' | 'createdAt' | 'upvotes' | 'answers' | 'isResolved'>) => void;
  addDoubtAnswer: (doubtId: string, answerText: string, isAI?: boolean) => void;
  upvoteDoubt: (doubtId: string) => void;
  markBestAnswer: (doubtId: string, answerId: string) => void;
  completeMission: (missionId: string) => void;
  logStudyTime: (minutes: number) => void;
  addCompletedTest: (test: MockTest) => void;
  toggleWeakTopic: (topic: string) => void;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 0. Supabase Auth Session State
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  // 1. User State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('abhyas_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // 3. Materials / Vault State
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    const saved = localStorage.getItem('abhyas_materials');
    return saved ? JSON.parse(saved) : INITIAL_STUDY_MATERIALS;
  });
  const [activeMaterial, setActiveMaterial] = useState<StudyMaterial | null>(() => {
    return materials[0] || null;
  });

  // 4. Daily Missions
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    const saved = localStorage.getItem('abhyas_missions');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_MISSIONS;
  });

  // 5. Doubts Community
  const [doubts, setDoubts] = useState<DoubtPost[]>(() => {
    const saved = localStorage.getItem('abhyas_doubts');
    return saved ? JSON.parse(saved) : INITIAL_DOUBTS;
  });

  // 6. PYQ Bank & Knowledge Map
  const [pyqBank] = useState<Question[]>(INITIAL_PYQ_BANK);
  const [knowledgeNodes, setKnowledgeNodes] = useState<KnowledgeNode[]>(INITIAL_KNOWLEDGE_NODES);
  const [completedTests, setCompletedTests] = useState<MockTest[]>(() => {
    const saved = localStorage.getItem('abhyas_tests');
    return saved ? JSON.parse(saved) : [];
  });

  // 7. Modals
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSprintOpen, setIsSprintOpen] = useState(false);
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);

  // 8. Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Sync profile with Supabase authenticated user
  const syncUserProfile = useCallback(async (currentAuthUser: User) => {
    try {
      const email = currentAuthUser.email || '';
      const name =
        currentAuthUser.user_metadata?.full_name ||
        currentAuthUser.user_metadata?.name ||
        (email ? email.split('@')[0] : 'Student');
      const avatarUrl =
        currentAuthUser.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${currentAuthUser.id}`;

      // Call backend to fetch or create profile for this Supabase user
      const res = await fetch(
        `/api/user/profile?userId=${encodeURIComponent(currentAuthUser.id)}&email=${encodeURIComponent(
          email
        )}&name=${encodeURIComponent(name)}&avatarUrl=${encodeURIComponent(avatarUrl)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setUser((prev) => ({
            ...prev,
            id: currentAuthUser.id,
            name: data.profile.name || name,
            email: data.profile.email || email,
            avatarUrl: data.profile.avatarUrl || avatarUrl,
            friendCode: data.profile.friendCode || prev.friendCode || `ADHYAY-${Math.floor(1000 + Math.random() * 9000)}`,
            username: data.profile.username || prev.username,
            xp: data.profile.xp ?? prev.xp,
            level: data.profile.level ?? prev.level,
            streakDays: data.profile.streakDays ?? prev.streakDays,
            boardOrExam: data.profile.boardOrExam || prev.boardOrExam,
            classGrade: data.profile.classGrade || prev.classGrade,
            stream: data.profile.stream || prev.stream,
            targetExam: data.profile.targetExam || prev.targetExam,
          }));
          return;
        }
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
    }

    // Fallback if network was slow: map auth user metadata directly
    setUser((prev) => ({
      ...prev,
      id: currentAuthUser.id,
      email: currentAuthUser.email || prev.email,
      name:
        currentAuthUser.user_metadata?.full_name ||
        currentAuthUser.user_metadata?.name ||
        prev.name,
      avatarUrl:
        currentAuthUser.user_metadata?.avatar_url ||
        prev.avatarUrl,
    }));
  }, []);

  // Supabase Auth lifecycle handler
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        cleanAuthUrlParams();
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching Supabase session:', error);
        }
        if (mounted) {
          if (data?.session) {
            setSession(data.session);
            setAuthUser(data.session.user);
            await syncUserProfile(data.session.user);
          } else {
            setSession(null);
            setAuthUser(null);
          }
          setIsLoadingSession(false);
        }
      } catch (err) {
        console.error('Exception checking Supabase auth:', err);
        if (mounted) {
          setSession(null);
          setAuthUser(null);
          setIsLoadingSession(false);
        }
      }
    }

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
        if (currentSession) {
          cleanAuthUrlParams();
          setSession(currentSession);
          setAuthUser(currentSession.user);
          await syncUserProfile(currentSession.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setAuthUser(null);
        localStorage.removeItem('abhyas_user');
      }
      setIsLoadingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserProfile]);

  // Real Supabase Logout
  const logout = async () => {
    try {
      await signOut();
      setSession(null);
      setAuthUser(null);
      showToast('Logged out successfully', 'info');
    } catch (err: any) {
      console.error('Error during logout:', err);
      showToast('Error during logout', 'warning');
    }
  };

  // Persist to local storage
  useEffect(() => {
    if (session) {
      localStorage.setItem('abhyas_user', JSON.stringify(user));
    }
  }, [user, session]);

  useEffect(() => {
    localStorage.setItem('abhyas_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('abhyas_missions', JSON.stringify(dailyMissions));
  }, [dailyMissions]);

  useEffect(() => {
    localStorage.setItem('abhyas_doubts', JSON.stringify(doubts));
  }, [doubts]);

  useEffect(() => {
    localStorage.setItem('abhyas_tests', JSON.stringify(completedTests));
  }, [completedTests]);

  // Actions
  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      // Sync to backend asynchronously
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: prev.id, updates }),
      }).catch((err) => console.error('Failed to sync profile update to server:', err));
      return updated;
    });
    showToast('Profile updated successfully!', 'success');
  };

  const addXP = (amount: number, reason: string) => {
    setUser((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 250) + 1;
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f97316', '#fbbf24', '#ffffff', '#ea580c'],
        });
        showToast(`🎉 Level Up! You reached Level ${newLevel}! (+${amount} XP for ${reason})`, 'success');
      } else {
        showToast(`+${amount} XP: ${reason}`, 'success');
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  const addStudyMaterial = (material: StudyMaterial) => {
    setMaterials((prev) => [material, ...prev]);
    setActiveMaterial(material);
    addXP(60, 'Added new material to Study Vault');
    showToast(`Saved "${material.title}" to Study Vault`, 'success');
  };

  const deleteStudyMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    if (activeMaterial?.id === id) {
      setActiveMaterial(materials.find((m) => m.id !== id) || null);
    }
    showToast('Material deleted from Study Vault', 'info');
  };

  const toggleFavoriteMaterial = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isFavorite: !m.isFavorite } : m))
    );
  };

  const updateMaterialNotes = (id: string, notes: any) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, notes, updatedAt: new Date().toISOString() } : m))
    );
    if (activeMaterial?.id === id) {
      setActiveMaterial((prev) => (prev ? { ...prev, notes } : null));
    }
    showToast('AI Notes updated and saved!', 'success');
  };

  const addDoubt = (doubtData: Omit<DoubtPost, 'id' | 'createdAt' | 'upvotes' | 'answers' | 'isResolved'>) => {
    const newDoubt: DoubtPost = {
      ...doubtData,
      id: `doubt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      answers: [],
      isResolved: false,
    };
    setDoubts((prev) => [newDoubt, ...prev]);
    addXP(40, 'Posted doubt to academic community');
    showToast('Doubt posted! Community & AI are looking into it.', 'success');
  };

  const addDoubtAnswer = (doubtId: string, answerText: string, isAI = false) => {
    const newAns = {
      id: `ans_${Date.now()}`,
      authorName: isAI ? 'Abhyas AI Assistant' : user.name,
      authorGrade: isAI ? 'AI Study Engine' : user.classGrade,
      isAI,
      text: answerText,
      createdAt: new Date().toISOString(),
      upvotes: 0,
    };

    setDoubts((prev) =>
      prev.map((d) => (d.id === doubtId ? { ...d, answers: [...d.answers, newAns] } : d))
    );

    if (!isAI) {
      addXP(70, 'Contributed an answer to a peer doubt');
      // Progress mission
      setDailyMissions((prev) =>
        prev.map((m) => (m.id === 'm4' ? { ...m, progress: 1, isCompleted: true } : m))
      );
    }
    showToast('Answer submitted!', 'success');
  };

  const upvoteDoubt = (doubtId: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id === doubtId) {
          const hasUpvoted = d.hasUpvoted;
          return {
            ...d,
            upvotes: hasUpvoted ? d.upvotes - 1 : d.upvotes + 1,
            hasUpvoted: !hasUpvoted,
          };
        }
        return d;
      })
    );
  };

  const markBestAnswer = (doubtId: string, answerId: string) => {
    setDoubts((prev) =>
      prev.map((d) => {
        if (d.id === doubtId) {
          return {
            ...d,
            isResolved: true,
            answers: d.answers.map((a) => ({
              ...a,
              isBestAnswer: a.id === answerId,
            })),
          };
        }
        return d;
      })
    );
    addXP(100, 'Resolved doubt with Best Answer designation');
    showToast('Marked as Best Answer! Bonus XP awarded to contributor.', 'success');
  };

  const completeMission = (missionId: string) => {
    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && !m.isCompleted) {
          addXP(m.xpReward, `Completed mission: ${m.title}`);
          return { ...m, isCompleted: true, progress: m.target };
        }
        return m;
      })
    );
  };

  const logStudyTime = (minutes: number) => {
    setUser((prev) => ({
      ...prev,
      todayStudyMinutes: prev.todayStudyMinutes + minutes,
    }));
    addXP(Math.round(minutes * 1.5), `Studied for ${minutes} minutes`);
  };

  const addCompletedTest = (test: MockTest) => {
    setCompletedTests((prev) => [test, ...prev]);
    const scorePoints = test.score ? Math.round(test.score * 10) : 100;
    addXP(scorePoints + 50, `Completed test: ${test.title}`);
  };

  const toggleWeakTopic = (topic: string) => {
    setUser((prev) => {
      const exists = prev.weakTopics.includes(topic);
      const newWeaks = exists
        ? prev.weakTopics.filter((t) => t !== topic)
        : [...prev.weakTopics, topic];
      showToast(exists ? `Marked "${topic}" as improved!` : `Added "${topic}" to Weak Topics list`, 'info');
      return { ...prev, weakTopics: newWeaks };
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        materials,
        activeMaterial,
        setActiveMaterial,
        dailyMissions,
        doubts,
        pyqBank,
        knowledgeNodes,
        completedTests,
        isTutorOpen,
        setIsTutorOpen,
        isSearchOpen,
        setIsSearchOpen,
        isUploadOpen,
        setIsUploadOpen,
        isSprintOpen,
        setIsSprintOpen,
        isGoogleAuthModalOpen,
        setIsGoogleAuthModalOpen,
        updateUser,
        addXP,
        addStudyMaterial,
        deleteStudyMaterial,
        toggleFavoriteMaterial,
        updateMaterialNotes,
        addDoubt,
        addDoubtAnswer,
        upvoteDoubt,
        markBestAnswer,
        completeMission,
        logStudyTime,
        addCompletedTest,
        toggleWeakTopic,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
