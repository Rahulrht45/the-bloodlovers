import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { supabase } from '../supabase';
import logo from '../assets/logo.png';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

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

    const navItems = [
        { name: 'Home',         path: '/home' },
        { name: 'Team',         path: '/members' },
        { name: 'Achievements', path: '/achievement' },
        { name: 'Matches',      path: '/matches' },
        { name: 'News',         path: '/news' },
        { name: 'Sponsors',     path: '/sponsors' },
        { name: 'Join',         path: '/signup' }
    ];

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-[80px] flex items-center ${scrolled ? 'bg-[#05010d]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <img src={logo} alt="BL" className="h-10 w-auto object-contain" />
                    <div className="flex flex-col leading-none">
                        <span className="font-orbitron font-black text-xl tracking-tighter text-white">BLOODLOVERS</span>
                        <span className="font-orbitron text-[10px] tracking-[0.3em] text-red-600 font-bold">- ESPORTS -</span>
                    </div>
                </Link>

                {/* Desktop Navigation - Centered */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`font-orbitron text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 relative group ${
                                    isActive ? 'text-red-500' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {item.name}
                                {isActive && (
                                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full shadow-[0_0_8px_#dc2626]"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="flex items-center gap-2 text-white/80 hover:text-white group">
                                <div className="w-8 h-8 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center group-hover:bg-red-600/20 transition-all">
                                    <User size={14} className="text-red-500" />
                                </div>
                                <span className="font-orbitron text-[10px] font-black uppercase tracking-widest hidden lg:block">
                                    {user.user_metadata?.full_name || 'OPERATIVE'}
                                </span>
                            </Link>
                            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="px-6 py-2 border-2 border-red-600 text-white font-orbitron text-[10px] font-black tracking-widest hover:bg-red-600 transition-all duration-300 rounded-sm">
                            LOGIN
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden z-50 flex flex-col justify-center gap-1.5 p-1 text-white focus:outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>

                {/* Mobile Fullscreen Menu */}
                <div className={`fixed inset-0 bg-[#05010d] z-40 flex flex-col items-center justify-center gap-6 transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-orbitron text-2xl font-bold text-white hover:text-red-600 uppercase tracking-widest transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                    
                    <div className="flex flex-col gap-4 mt-12 w-full px-12 max-w-md">
                        {user ? (
                            <>
                                <div className="text-white/60 font-orbitron text-center text-xs tracking-widest mb-2 uppercase">
                                    Operator: <span className="text-white font-black">{user.user_metadata?.full_name || user.email.split('@')[0]}</span>
                                </div>
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full h-14 border border-white/10 text-white font-orbitron font-bold uppercase tracking-widest flex items-center justify-center hover:bg-white/5 transition-all"
                                >
                                    My Profile
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                    className="w-full h-14 border border-red-600/30 text-red-500 font-orbitron font-bold uppercase tracking-widest flex items-center justify-center hover:bg-red-600/10 transition-all"
                                >
                                    Terminate Session
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full h-14 border border-white/10 text-white font-orbitron font-bold uppercase tracking-widest flex items-center justify-center"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full h-14 bg-red-600 text-white font-orbitron font-bold uppercase tracking-widest flex items-center justify-center shadow-lg shadow-red-600/20"
                                >
                                    Join Forces
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
