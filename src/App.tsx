import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { UniversalSearchModal } from './components/UniversalSearchModal';
import { TutorDrawer } from './components/TutorDrawer';
import { StudySprintModal } from './components/StudySprintModal';
import { UploadModal } from './components/UploadModal';

// Views
import { HomeDashboardView } from './views/HomeDashboardView';
import { LearnFromVideoView } from './views/LearnFromVideoView';
import { StudyVaultView } from './views/StudyVaultView';
import { ScanSolveView } from './views/ScanSolveView';
import { TestsMocksView } from './views/TestsMocksView';
import { ActiveRecallView } from './views/ActiveRecallView';
import { DoubtsCommunityView } from './views/DoubtsCommunityView';
import { FriendsGroupsView } from './views/FriendsGroupsView';
import { LevelUpView } from './views/LevelUpView';
import { ProfileView } from './views/ProfileView';
import { LoginView } from './views/LoginView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { TermsView } from './views/TermsView';
import { AuthLoadingScreen } from './components/AuthLoadingScreen';
import { getInitialLegalRoute, LegalRoute, navigateToLegalRoute } from './lib/routes';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, toastMessage } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboardView />;
      case 'video':
        return <LearnFromVideoView />;
      case 'study':
      case 'vault':
        return <StudyVaultView />;
      case 'scan':
        return <ScanSolveView />;
      case 'tests':
        return <TestsMocksView />;
      case 'recall':
        return <ActiveRecallView />;
      case 'doubts':
        return <DoubtsCommunityView />;
      case 'friends':
        return <FriendsGroupsView />;
      case 'levelup':
        return <LevelUpView />;
      case 'profile':
        return <ProfileView />;
      case 'privacy':
        return <PrivacyPolicyView onBack={() => setActiveTab('home')} />;
      case 'terms':
        return <TermsView onBack={() => setActiveTab('home')} />;
      default:
        return <HomeDashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-gray-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Universal Top Navigation Header */}
      <Navbar />

      {/* Main App Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">{renderActiveView()}</main>
      </div>

      {/* Persistent Global Modals & Drawers */}
      <GoogleAuthModal />
      <UniversalSearchModal />
      <TutorDrawer />
      <StudySprintModal />
      <UploadModal />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#181c26] border border-orange-500/40 text-white text-xs font-semibold shadow-2xl shadow-black/80 animate-in slide-in-from-bottom-5 duration-200">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { session, isLoadingSession } = useApp();
  const [publicLegalRoute, setPublicLegalRoute] = React.useState<LegalRoute>(() => getInitialLegalRoute());

  React.useEffect(() => {
    const handleRouteChange = () => {
      const route = getInitialLegalRoute();
      setPublicLegalRoute(route);
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // 1. PUBLIC LEGAL ROUTES (Google OAuth requirement: must be accessible without login)
  if (publicLegalRoute === 'privacy') {
    return (
      <PrivacyPolicyView
        isStandalone
        onBack={() => {
          navigateToLegalRoute('app');
          setPublicLegalRoute(null);
        }}
      />
    );
  }

  if (publicLegalRoute === 'terms') {
    return (
      <TermsView
        isStandalone
        onBack={() => {
          navigateToLegalRoute('app');
          setPublicLegalRoute(null);
        }}
      />
    );
  }

  // 2. If currently checking Supabase session, show branded loading screen
  if (isLoadingSession) {
    return <AuthLoadingScreen />;
  }

  // 3. If no valid Supabase session exists, show real ADHYAY Login & Sign-in screen
  if (!session) {
    return (
      <LoginView
        onOpenLegal={(route) => {
          navigateToLegalRoute(route);
          setPublicLegalRoute(route);
        }}
      />
    );
  }

  // 4. User is authenticated with a verified Supabase session -> open ADHYAY directly
  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
