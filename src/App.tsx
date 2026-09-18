import React, { useState } from 'react';
import { HeroBanner } from './components/HeroBanner';
import { KeyHighlights } from './components/KeyHighlights';
import { ScientificAgenda } from './components/ScientificAgenda';
import { RegistrationSection } from './components/RegistrationSection';
import { VenueSection } from './components/VenueSection';
import { Footer } from './components/Footer';
import { InfoModals } from './components/InfoModals';
import { CMSProvider, useCMS } from './context/CMSContext';
import { AdminCMSModal } from './components/admin/AdminCMSModal';
import { AdminLoginScreen } from './components/admin/AdminLoginScreen';
import { MobileQuickNav } from './components/MobileQuickNav';
import { SEOHead } from './components/SEOHead';
import { PosterCreatorModal } from './components/PosterCreatorModal';

function MainApp() {
  const {
    isAdminOpen,
    closeAdmin,
    isPosterModalOpen,
    closePosterModal,
    posterModalAttendee,
    cmsData,
  } = useCMS();
  const [modalType, setModalType] = useState<'cme' | 'layout' | 'privacy' | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('kbit_admin_auth') === 'true';
  });

  const handleOpenModal = (type: 'cme' | 'layout' | 'privacy') => {
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('kbit_admin_auth');
    setIsAdminAuthenticated(false);
  };

  // CMS is rendered as a standalone full page (not a popup modal)
  if (isAdminOpen) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLoginScreen
          onLoginSuccess={handleLoginSuccess}
          onBackHome={closeAdmin}
        />
      );
    }
    return <AdminCMSModal onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30] selection:bg-secondary/20 selection:text-secondary">
      {/* Dynamic SEO Meta Tags & Head Scripts */}
      <SEOHead />

      {/* Main Content Sections */}
      <main className="flex-1 w-full">
        {/* Section 1: Hero Symposium Banner & Real-time Countdown */}
        <HeroBanner />

        {/* Section 2: 6 Expert Speakers & Highlights */}
        <KeyHighlights
          onOpenCmeModal={() => handleOpenModal('cme')}
          onOpenLayoutModal={() => handleOpenModal('layout')}
        />

        {/* Section 3: Detailed Scientific Timetable / Agenda */}
        <ScientificAgenda />

        {/* Section 4: Official Registration Portal & Interactive E-Badge */}
        <RegistrationSection />

        {/* Section 5: Hospital Venue Directions & Map */}
        <VenueSection />
      </main>

      {/* Footer */}
      <Footer onOpenModal={handleOpenModal} />

      {/* Interactive Detail Modals (CME, Layout, Privacy) */}
      <InfoModals modalType={modalType} onClose={handleCloseModal} />

      {/* Mobile Floating Quick Navigation Dock */}
      <MobileQuickNav />

      {/* Official Invitation Poster Creator Modal */}
      <PosterCreatorModal
        isOpen={isPosterModalOpen}
        onClose={closePosterModal}
        defaultAttendee={posterModalAttendee}
        attendees={cmsData.registrations || []}
      />
    </div>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <MainApp />
    </CMSProvider>
  );
}
