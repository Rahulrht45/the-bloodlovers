import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Sun, Moon, CloudMoon } from 'lucide-react';
import { supabase } from '../supabase';
import logo from '../assets/logo.png';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
    const navigate = useNavigate();
    const location = useLocation();

    // Theme effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const themes = ['dark', 'light', 'night'];
        const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

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
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-[80px] flex items-center ${scrolled ? 'bg-[var(--bg-dark)]/95 backdrop-blur-xl border-b border-[var(--border-color)] shadow-2xl' : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-1.5 group">
                    <img src={logo} alt="THE BLOODLOVERS" className="h-14 w-auto object-contain" />
                    <div className="flex flex-col leading-none">
                        <span className="font-orbitron font-black text-xl tracking-tighter text-[var(--text-main)]">THE BLOODLOVERS</span>
                        <span className="font-orbitron text-[10px] tracking-[0.3em] text-[var(--accent-red)] font-bold">- E-SPORTS -</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`font-orbitron text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group ${
                                    isActive ? 'text-[var(--accent-red)]' : 'text-[var(--text-muted)] hover:text-[var(--accent-red)]'
                                }`}
                            >
                                {item.name}
                                <span className={`absolute -bottom-1 left-0 h-[2px] bg-[var(--accent-red)] transition-all duration-300 ${
                                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                }`}></span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    {/* Theme Switcher */}
                    <button 
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-main)] hover:border-[var(--accent-red)] transition-all"
                        title="Switch Theme"
                    >
                        {theme === 'light' ? <Sun size={18} /> : theme === 'night' ? <CloudMoon size={18} /> : <Moon size={18} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="flex items-center gap-2 text-[var(--text-main)]/80 hover:text-[var(--text-main)]">
                                <User size={16} className="text-[var(--accent-red)]" />
                                <span className="font-orbitron text-[10px] font-bold uppercase tracking-widest">
                                    {user.user_metadata?.full_name || 'OPERATIVE'}
                                </span>
                            </Link>
                            <button onClick={handleLogout} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-outline text-[10px] py-2 px-6 border-[var(--accent-red)]/30 hover:border-[var(--accent-red)]">
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
                <div className={`fixed inset-0 bg-[var(--bg-dark)] z-40 flex flex-col items-center justify-center gap-6 transition-transform duration-500 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <button 
                        onClick={toggleTheme}
                        className="mb-8 flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-main)] font-orbitron text-xs font-bold uppercase tracking-widest"
                    >
                        {theme === 'light' ? <Sun size={20} /> : theme === 'night' ? <CloudMoon size={20} /> : <Moon size={20} />}
                        {theme.toUpperCase()} MODE
                    </button>
                    <div className="flex flex-col items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className="font-orbitron text-2xl font-bold text-[var(--text-main)] hover:text-[var(--accent-red)] uppercase tracking-widest transition-colors"
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
