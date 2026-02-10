import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

const Countdown = () => {
    const [targetDate, setTargetDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const fetchNextTournament = async () => {
            try {
                const { data, error } = await supabase
                    .from('match_settings')
                    .select('start_at')
                    .gt('start_at', new Date().toISOString())
                    .order('start_at', { ascending: true })
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'

                if (data && data.start_at) {
                    setTargetDate(new Date(data.start_at));
                }
            } catch (err) {
                console.error('Error fetching tournament time:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNextTournament();
    }, []);

    useEffect(() => {
        if (!targetDate) return;

        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (loading) {
        return <span className="text-white/30 animate-pulse font-orbitron text-sm">SYNCHRONIZING...</span>;
    }

    if (!targetDate) {
        return <span className="text-white/50 font-orbitron text-sm uppercase tracking-widest">TBA</span>;
    }

    return (
        <span className="font-orbitron text-2xl md:text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-green-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
    );
};

const MenuCard = ({ title, subtitle, linkTo, children }) => {
    const CardContent = (
        <div className="relative w-full h-32 group cursor-pointer transform transition-transform duration-300 hover:scale-105">
            {/* Neon Glow Layer behind the card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff3333] via-[#ffd700] to-[#33ff33] rounded-2xl blur opacity-40 group-hover:opacity-100 group-hover:blur-md transition duration-500"></div>

            {/* Main Card Container */}
            <div className="relative w-full h-full bg-black rounded-2xl p-[2px]">
                {/* Gradient Border Line */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff0000] via-[#ffff00] to-[#00ff00] rounded-2xl opacity-80" />

                {/* Inner Content */}
                <div className="absolute inset-[2px] bg-[#050505] rounded-[14px] flex flex-col items-center justify-center p-4 overflow-hidden group-hover:bg-[#0a0a0a] transition-colors duration-300">

                    {/* Subtle Inner Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <h3 className="text-white font-orbitron text-lg md:text-xl font-extrabold text-center tracking-wider uppercase z-10 drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                        {title}
                    </h3>

                    {subtitle && (
                        <div className="text-white/90 font-orbitron text-base md:text-lg font-bold text-center mt-1 z-10 tracking-widest group-hover:text-[#ffff00] transition-colors duration-300 drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]">
                            {subtitle}
                        </div>
                    )}

                    {children && (
                        <div className="z-10 mt-2">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (linkTo) {
        return (
            <Link to={linkTo} className="w-full max-w-md block">
                {CardContent}
            </Link>
        );
    }

    return <div className="w-full max-w-md">{CardContent}</div>;
};

const HomePage = () => {
    return (
        <div className="min-h-screen bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pt-24 pb-12 px-4 gap-6 animate-fade-in relative z-10">
            <MenuCard
                title="Players Leaderboard / MVP"
                subtitle="Board"
                linkTo="/mvp"
            />

            <MenuCard
                title="Best Achievement"
                linkTo="#"
            />

            <MenuCard
                title="All Time Best Player"
                linkTo="#"
            />

            <MenuCard title="Next Tournament Countdown">
                <Countdown />
            </MenuCard>
        </div>
    );
};

export default HomePage;
