import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { ArrowRight, Play, Users, Sword, Trophy } from 'lucide-react';

const HeroSection = () => {
    const [topFragger, setTopFragger] = useState(null);
    const [stats, setStats] = useState({ players: '—', matches: '—', prizePool: '—' });
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [playersRes, matchesRes, usersRes, topRes] = await Promise.all([
                    supabase.from('players').select('*', { count: 'exact', head: true }),
                    supabase.from('match_settings').select('*', { count: 'exact', head: true }),
                    supabase.from('users').select('global_credit'),
                    supabase.from('players').select('ign, kills').order('kills', { ascending: false }).limit(1).single()
                ]);

                const pCount = playersRes.count || 0;
                const mCount = matchesRes.count || 0;
                const totalFunds = usersRes.data
                    ? usersRes.data.reduce((sum, u) => sum + Number(u.global_credit || 0), 0)
                    : 0;

                setStats({
                    players: pCount >= 1000 ? `${(pCount / 1000).toFixed(1)}K+` : `${pCount}+`,
                    matches: mCount >= 1000 ? `${(mCount / 1000).toFixed(1)}K` : String(mCount),
                    prizePool: `৳${totalFunds.toLocaleString()}`
                });

                if (!topRes.error && topRes.data) setTopFragger(topRes.data);
            } catch (e) {
                console.error('HeroSection fetch error:', e);
            } finally {
                setLoaded(true);
            }
        };
        fetchData();
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-[#05010d]">
            {/* ── Background layers ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Grid */}
                <div className="absolute inset-0 bg-grid opacity-60" />
                {/* Red radial glow — top left */}
                <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[160px]" />
                {/* Purple radial glow — bottom right */}
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-700/8 rounded-full blur-[160px]" />
                {/* Scanline sweep */}
                <div
                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent animate-scan z-10"
                    style={{ top: '0' }}
                />
            </div>

            {/* ── Main content ── */}
            <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-red-600/10 border border-red-600/20 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="font-orbitron text-[10px] font-black text-red-500 tracking-[0.4em] uppercase">
                        Season 4 · Now Active
                    </span>
                </div>

                {/* Main heading */}
                <h1 className="hero-h1 mb-6 max-w-4xl">
                    WE <span className="hero-accent">BLEED.</span><br />
                    WE <span className="hero-muted-text">RISE.</span><br />
                    WE <span className="hero-accent">DOMINATE.</span>
                </h1>

                {/* Subtitle */}
                <p className="hero-desc max-w-xl mx-auto mb-12 text-center">
                    Not just a team — a{' '}
                    <span className="text-red-500 font-bold">bloodline</span>. Built through
                    sacrifice, strategy, and the hunger to be the best.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <Link to="/members" className="btn-primary group flex items-center gap-3 px-8 py-4 text-sm">
                        MEET THE TEAM
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to="/mvp" className="btn-outline flex items-center gap-3 px-8 py-4 text-sm">
                        <Play size={16} />
                        VIEW LEADERBOARD
                    </Link>
                </div>

                {/* Live Stats Bar */}
                <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-16">
                    {[
                        { icon: Users,  value: stats.players,  label: 'Active Players' },
                        { icon: Sword,  value: stats.matches,  label: 'Matches Played' },
                        { icon: Trophy, value: stats.prizePool, label: 'Total Credits' },
                    ].map(({ icon: Icon, value, label }) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                            <Icon size={16} className="text-red-600 mb-1 opacity-70" />
                            <strong className="font-orbitron text-3xl md:text-4xl font-black text-white italic">
                                {loaded ? value : '—'}
                            </strong>
                            <span className="font-orbitron text-[10px] tracking-[3px] text-white/40 uppercase">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Top Fragger Card */}
                {topFragger && (
                    <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-sm mb-4">
                        <span className="text-xl">👑</span>
                        <div className="text-left">
                            <div className="font-orbitron text-[9px] text-red-500 font-black tracking-[3px] uppercase mb-0.5">
                                Top Fragger
                            </div>
                            <div className="font-orbitron text-base font-black text-white tracking-tight uppercase">
                                {topFragger.ign}
                                <span className="text-red-600 ml-2 text-sm font-bold">
                                    {topFragger.kills} KILLS
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
                    <span className="font-orbitron text-[9px] tracking-[4px] text-white uppercase">Scroll</span>
                    <div className="w-px h-10 bg-gradient-to-b from-red-600 to-transparent" />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
