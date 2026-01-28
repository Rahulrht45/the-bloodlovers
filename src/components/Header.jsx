import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { supabase } from '../supabase';
import logo from '../assets/logo.png';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Check current session
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const navItems = ['Matches', 'Wallet', 'Players', 'Leaderboard', 'MVP', 'Admin Panel'];

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-[72px] flex items-center ${scrolled ? 'bg-[#020014]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] shadow-[0_4px_30px_rgba(0,0,0,0.1)]' : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="w-full h-full flex items-center justify-between" style={{ paddingLeft: '5vw', paddingRight: '5vw' }}>
                {/* Logo */}
                <Link to="/" className="flex items-center cursor-pointer group z-50 h-full">
                    <img src={logo} alt="BLOODLOVERS" className="h-[64px] md:h-[72px] w-auto object-contain transform group-hover:scale-105 transition-transform duration-500" />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8 bg-white/5 border border-white/10 rounded-full px-10 py-4 backdrop-blur-md shadow-lg shadow-black/20">
                    {navItems.map((item) => {
                        const isPlayers = item === 'Players' || item === 'Leaderboard' || item === 'MVP' || item === 'Matches' || item === 'Wallet';
                        const isAdmin = item === 'Admin Panel';
                        const linkTo = isAdmin ? "/admin" : (item === 'Matches' ? "/matches" : (item === 'Wallet' ? "/wallet" : (item === 'MVP' ? "/mvp" : "/players")));

                        if (isPlayers || isAdmin) {
                            return (
                                <Link
                                    key={item}
                                    to={linkTo}
                                    className="font-exo text-[13px] font-bold uppercase tracking-[0.1em] text-gray-400 hover:text-white transition-all duration-300 relative group flex flex-col items-center"
                                >
                                    {item}
                                    <span className="w-0 h-[2px] bg-[var(--neon-cyan)] mt-1 transition-all duration-300 group-hover:w-full box-shadow-[0_0_8px_var(--neon-cyan)]"></span>
                                </Link>
                            );
                        }

                        return (
                            <a
                                key={item}
                                href={`/#${item.toLowerCase()}`}
                                className="font-exo text-[13px] font-bold uppercase tracking-[0.1em] text-gray-400 hover:text-white transition-all duration-300 relative group flex flex-col items-center"
                            >
                                {item}
                                <span className="w-0 h-[2px] bg-[var(--neon-cyan)] mt-1 transition-all duration-300 group-hover:w-full box-shadow-[0_0_8px_var(--neon-cyan)]"></span>
                            </a>
                        );
                    })}
                </nav>

                {/* Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-8">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-[var(--neon-cyan)] transition-all cursor-pointer"
                                title="Edit Profile"
                            >
                                <User size={16} className="text-[var(--neon-cyan)]" />
                                <span className="font-exo text-xs font-bold uppercase tracking-widest text-white/80">
                                    {user.user_metadata?.full_name || user.email.split('@')[0]}
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="font-exo font-bold text-white hover:text-[var(--neon-cyan)] transition-colors text-xs uppercase tracking-widest opacity-80 hover:opacity-100"
                            >
                                Log In
                            </Link>
                            <Link
                                to="/signup"
                                className="btn-primary text-xs py-3 px-8 border-[1px]"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden z-50 text-white focus:outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
                    <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></div>
                    <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
                </button>

                {/* Mobile Fullscreen Menu */}
                <div className={`fixed inset-0 bg-[#020014] z-40 flex flex-col items-center justify-center gap-8 transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    {navItems.map((item) => {
                        const isInternalPage = item === 'Players' || item === 'Leaderboard' || item === 'MVP' || item === 'Matches' || item === 'Wallet';
                        const isAdmin = item === 'Admin Panel';
                        const linkTo = isAdmin ? "/admin" : (item === 'Matches' ? "/matches" : (item === 'Wallet' ? "/wallet" : (item === 'MVP' ? "/mvp" : "/players")));

                        if (isInternalPage || isAdmin) {
                            return (
                                <Link
                                    key={item}
                                    to={linkTo}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="font-orbitron text-2xl font-bold text-white hover:text-[var(--neon-cyan)] uppercase tracking-wider"
                                >
                                    {item}
                                </Link>
                            );
                        }

                        return (
                            <a
                                key={item}
                                href={`/#${item.toLowerCase()}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-orbitron text-2xl font-bold text-white hover:text-[var(--neon-cyan)] uppercase tracking-wider"
                            >
                                {item}
                            </a>
                        );
                    })}
                    <div className="flex flex-col gap-4 mt-8 w-full px-12">
                        {user ? (
                            <>
                                <div className="text-white font-orbitron text-center mb-4">
                                    WELCOME, {user.user_metadata?.full_name?.toUpperCase() || user.email.split('@')[0].toUpperCase()}
                                </div>
                                <button
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                    className="w-full h-12 border border-red-500/50 text-red-500 font-exo font-bold uppercase tracking-wider"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full h-12 border border-white/20 text-white font-exo font-bold uppercase tracking-wider flex items-center justify-center"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full h-12 bg-[var(--neon-cyan)] text-black font-exo font-bold uppercase tracking-wider animate-pulse flex items-center justify-center"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
