import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PlayersPage from './pages/PlayersPage';
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

function AppContent() {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const hideLogoPaths = ['/matches', '/mvp', '/players'];
    const shouldShowLogo = !hideLogoPaths.includes(location.pathname);

    return (
        <div className="w-full min-h-screen text-white overflow-x-hidden relative">
            {/* Global Logo Background Watermark */}
            {shouldShowLogo && (
                <div
                    className="fixed inset-0 z-0 opacity-100 pointer-events-none flex items-center justify-center overflow-hidden"
                >
                    <div
                        style={{
                            backgroundImage: `url(${logo})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            width: 'min(800px, 90vw)',
                            height: 'min(800px, 90vw)',
                        }}
                    />
                </div>
            )}
            {isHomePage && <Header />}
            <main className={isHomePage ? "pt-[72px]" : "pt-0"}>
                <Routes>
                    <Route path="/" element={<HeroSection />} />
                    <Route path="/players" element={<PlayersPage />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/signup" element={<AuthPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/extract" element={<ImageExtractorPage />} />
                    <Route path="/matches" element={<MatchesPage />} />
                    <Route path="/wallet" element={<WalletPage />} />
                    <Route path="/mvp" element={<MvpPage />} />
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
