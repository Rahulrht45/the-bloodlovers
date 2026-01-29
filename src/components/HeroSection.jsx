import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import logo from '../assets/logo.png';

const HeroSection = () => {
    const [topFragger, setTopFragger] = useState({ ign: 'LOADING...', kills: 0 });
    const [standings, setStandings] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Top Fragger
            const { data: topData, error: topError } = await supabase
                .from('players')
                .select('ign, kills')
                .order('kills', { ascending: false })
                .limit(1)
                .single();

            if (!topError && topData) {
                setTopFragger(topData);
            }

            // Fetch Standings (Top 5)
            const { data: standData, error: standError } = await supabase
                .from('players')
                .select('ign, kills')
                .order('kills', { ascending: false })
                .limit(5);

            if (!standError && standData) {
                const maxK = standData[0]?.kills || 1;
                const formatted = standData.map(p => ({
                    ign: p.ign,
                    kills: p.kills,
                    width: `${(p.kills / maxK) * 100}%`
                }));
                setStandings(formatted);
            }
        };
        fetchData();
    }, []);

    return (
        <section className="relative min-h-screen flex items-center pt-20 pb-10 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-grid opacity-20 z-0"></div>
            {/* User Custom Overlay - ensuring gradient matches request */}
            <div className="absolute inset-0 hero-overlay-gradient z-0 pointer-events-none"></div>



            {/* Main Content Container - Removed standard container class to allow custom pixel-perfect padding */}
            <div className="w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 lg:gap-12 items-center">

                {/* Left Column: Text & CTA */}
                <div className="hero-left-wrapper animate-fade-in-up">
                    <span className="hero-badge">🏆 MVP OF THE MONTH</span>

                    <h1 className="hero-h1">
                        REIGN <span className="hero-accent">SUPREME.</span><br />
                        DOMINATE.<br className="block sm:hidden" />
                        <span className="hero-muted-text">CONQUER.</span><br className="block sm:hidden" />
                        REPEAT.
                    </h1>



                    <div className="hero-buttons">
                        <Link to="/signup" className="hero-btn hero-btn-primary">
                            SIGN UP
                        </Link>
                        <Link to="/login" className="hero-btn hero-btn-ghost">
                            LOG IN
                        </Link>
                    </div>

                    <div className="hero-stats-row">
                        <div className="hero-stats-item">
                            <strong>50K+</strong>
                            <span>PLAYERS</span>
                        </div>
                        <div className="hero-stats-item">
                            <strong>1.2M</strong>
                            <span>MATCHES</span>
                        </div>
                        <div className="hero-stats-item gold">
                            <strong>$500K</strong>
                            <span>PRIZE POOLS</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visuals / Cards */}
                <div className="relative h-full min-h-[500px] flex flex-col items-center justify-center lg:items-end lg:justify-center hidden md:flex pr-8 lg:pr-16">

                    {/* User's Custom HUD Structure */}
                    <div className="flex flex-col items-end transform scale-90 lg:scale-100 origin-right">
                        <div className="hero-hud">
                            {/* TOP FRAGGER */}
                            <div className="hero-card hero-fragger">
                                <div className="hero-crown">👑</div>
                                <span className="hero-label">MOST KILLS</span>
                                <h2>TOP FRAGGER:</h2>
                                <h1>{topFragger.ign}</h1>
                            </div>

                            {/* MATCH STANDINGS */}
                            <div className="hero-card hero-standings">
                                <h3>MATCH STANDINGS</h3>

                                {standings.length > 0 ? standings.map((player, idx) => (
                                    <div key={idx} className="hero-row">
                                        <span>{player.ign}</span>
                                        <div className="hero-bar">
                                            <div style={{ width: player.width }}></div>
                                        </div>
                                        <span>{player.kills}</span>
                                    </div>
                                )) : (
                                    <div className="text-center opacity-50 py-4">Syncing...</div>
                                )}
                            </div>
                        </div>

                        {/* LIVE MATCH */}
                        <div className="hero-vs max-w-[250px]">
                            LIVE MATCH <br />
                            <strong>TEAM A</strong> <span className="text-[var(--accent-gold)] font-bold italic">VS</span> <strong>TEAM B</strong>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;
