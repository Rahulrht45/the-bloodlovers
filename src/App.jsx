import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MembersPage from './pages/MembersPage';
import AdminPanel from './pages/AdminPanel';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ImageExtractorPage from './pages/ImageExtractorPage';
import MatchesPage from './pages/MatchesPage';
import WalletPage from './pages/WalletPage';
import MvpPage from './pages/MvpPage';
import bgMain from './assets/bg-main.jpg';
import logo from './assets/logo.png';
import MonthlyMvpPopup from './components/MonthlyMvpPopup';
import AchievementPage from './pages/AchievementPage';
import EsportsPage from './pages/EsportsPage';
import HomePage from './pages/HomePage';

import Footer from './components/Footer';
import { OurLegends, AchievementAndIntel, MediaGallery, SponsorsSection, JoinSection } from './components/HomeSections';

function LandingPage() {
    return (
        <>
            <HeroSection />
            <OurLegends />
            <AchievementAndIntel />
            <MediaGallery />
            <SponsorsSection />
            <JoinSection />
            <Footer />
        </>
    );
}

function AppContent() {
    const location = useLocation();
    const isAdminPage = location.pathname === '/admin';

    return (
        <div className="w-full min-h-screen text-white overflow-x-hidden relative bg-[#05010d]">
            {!isAdminPage && <Header />}
            <main>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/achievement" element={<AchievementPage />} />
                    <Route path="/members" element={<MembersPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/extract" element={<ImageExtractorPage />} />
                    <Route path="/matches" element={<MatchesPage />} />
                    <Route path="/wallet" element={<WalletPage />} />
                    <Route path="/mvp" element={<MvpPage />} />
                    <Route path="/media" element={<EsportsPage title="MEDIA GALLERY" description="Exclusive highlights, team vlogs, and tournament footage." />} />
                    <Route path="/news" element={<EsportsPage title="LATEST NEWS" description="The most recent updates from the BloodLovers competitive scene." />} />
                    <Route path="/sponsors" element={<EsportsPage title="OUR SPONSORS" description="Partnering with the world's leading brands to dominate the game." />} />
                </Routes>
            </main>
        </div>
    );
}


function App() {
    return (
        <Router>
            <MonthlyMvpPopup />
            <AppContent />
        </Router>
    );
}

export default App;
