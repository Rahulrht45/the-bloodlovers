import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PlayersPage from './pages/PlayersPage';
import AdminPanel from './pages/AdminPanel';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ImageExtractorPage from './pages/ImageExtractorPage';
import MatchesPage from './pages/MatchesPage';
import bgMain from './assets/bg-main.jpg';

function App() {
    return (
        <Router>
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
                <Header />
                <main className="pt-[72px]">
                    <Routes>
                        <Route path="/" element={<HeroSection />} />
                        <Route path="/players" element={<PlayersPage />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/login" element={<AuthPage />} />
                        <Route path="/signup" element={<AuthPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/extract" element={<ImageExtractorPage />} />
                        <Route path="/matches" element={<MatchesPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
