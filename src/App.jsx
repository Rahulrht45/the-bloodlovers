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

function AppContent() {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div
            className="w-full min-h-screen text-white overflow-x-hidden"
            style={{
                backgroundImage: `linear-gradient(rgba(2, 0, 20, 0.5), rgba(2, 0, 20, 0.7)), url(${bgMain})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundRepeat: 'no-repeat'
            }}
        >
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
            <AppContent />
        </Router>
    );
}

export default App;
