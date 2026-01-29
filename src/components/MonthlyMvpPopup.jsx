import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { X, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const MonthlyMvpPopup = () => {
    const [winner, setWinner] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchLatestWinner = async () => {
            try {
                // Fetch the most recent MVP announcement
                const { data, error } = await supabase
                    .from('mvp_history')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (error) {
                    if (error.code !== 'PGRST116') { // Ignore 'no rows found'
                        console.error('Error fetching MVP winner:', error);
                    }
                    return;
                }

                if (data) {
                    // Check if user has already seen this announcement
                    const seenId = localStorage.getItem('seen_mvp_announcement_id');

                    if (String(seenId) !== String(data.id)) {
                        setWinner(data);
                        // Delay slightly to allow app to load
                        setTimeout(() => {
                            setIsVisible(true);
                            triggerConfetti();
                        }, 1500);
                    }
                }
            } catch (err) {
                console.error('Failed to check MVP winner:', err);
            }
        };

        fetchLatestWinner();
    }, []);

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);

            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FFA500', '#FF4500']
            });
            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#00FFFF', '#1E90FF', '#00BFFF']
            });
        }, 250);
    };

    const handleClose = () => {
        setIsVisible(false);
        if (winner) {
            localStorage.setItem('seen_mvp_announcement_id', winner.id);
        }
    };

    if (!isVisible || !winner) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-gradient-to-br from-[#0f1c33] to-[#050a14] border border-[#ffd700]/30 rounded-2xl p-1 shadow-[0_0_50px_rgba(255,215,0,0.2)] animate-scale-up">

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-20"
                >
                    <X size={24} />
                </button>

                {/* Content Container */}
                <div className="relative overflow-hidden rounded-xl bg-[#0b101b] p-8 text-center">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#ffd700]/10 to-transparent pointer-events-none" />

                    {/* Month Label */}
                    <div className="relative mb-6">
                        <div className="inline-block px-4 py-1.5 rounded-full border border-[#ffd700]/30 bg-[#ffd700]/10 text-[#ffd700] text-xs font-black tracking-[2px] uppercase mb-2">
                            {winner.month} • MVP
                        </div>
                    </div>

                    {/* Avatar with Crown */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[#ffd700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-bounce">
                            <Trophy size={48} fill="#ffd700" />
                        </div>
                        <div className="w-full h-full rounded-full border-4 border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.3)] overflow-hidden">
                            <img
                                src={winner.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${winner.ign}`}
                                alt={winner.ign}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Winner Name */}
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                        {winner.ign}
                    </h2>

                    <p className="text-gray-400 text-sm font-medium tracking-wide mb-6">
                        DOMINATED THE BATTLEFIELD
                    </p>

                    {/* Points Stat */}
                    <div className="inline-flex items-center gap-3 bg-[#ffd700]/10 border border-[#ffd700]/20 px-6 py-3 rounded-lg">
                        <Sparkles size={18} className="text-[#ffd700]" />
                        <span className="text-2xl font-black text-[#ffd700]">{winner.points}</span>
                        <span className="text-[10px] text-[#ffd700]/70 uppercase font-bold tracking-widest mt-1">Total Points</span>
                    </div>

                    {/* Footer Message */}
                    <p className="mt-8 text-[10px] text-gray-500 uppercase tracking-widest">
                        New Season Has Started. Can You Beat Them?
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MonthlyMvpPopup;
