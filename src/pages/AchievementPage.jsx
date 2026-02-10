import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AchievementCard = ({ title, image_url }) => {
    return (
        <div className="relative w-full aspect-video md:aspect-square max-w-[280px] group cursor-pointer transform transition-transform duration-300 hover:scale-105">
            {/* Neon Glow Layer */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#ff3333] via-[#ffffff] to-[#33ff33] rounded-3xl blur opacity-30 group-hover:opacity-80 group-hover:blur-md transition duration-500"></div>

            {/* Main Card Container */}
            <div className="relative w-full h-full bg-black rounded-3xl p-[2px]">
                {/* Gradient Border Line - Matching the Red-White-Green theme */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff0000] via-[#ffffff] to-[#00ff00] rounded-3xl opacity-90" />

                {/* Inner Content */}
                <div className="absolute inset-[2px] bg-[#050505] rounded-[22px] flex flex-col items-center justify-center overflow-hidden group-hover:bg-[#0a0a0a] transition-colors duration-300">

                    {/* Background Image (If uploaded) */}
                    {image_url && (
                        <div className="absolute inset-0 z-0">
                            <img src={image_url} alt={title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-all duration-500" />
                        </div>
                    )}

                    {/* Subtle Inner Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <h3 className="relative text-white font-orbitron text-xl md:text-2xl font-extrabold text-center tracking-wider uppercase z-10 drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300 p-4">
                        {title}
                    </h3>
                </div>
            </div>
        </div>
    );
};

const AchievementPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const { data, error } = await supabase
                    .from('achievements')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) setAchievements(data);
            } catch (err) {
                console.error('Error fetching achievements:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, []);

    return (
        <div className="min-h-screen bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pt-24 pb-12 px-6 gap-8 animate-fade-in relative z-10">
            {loading ? (
                <div className="text-[var(--neon-cyan)] animate-pulse font-bold tracking-widest uppercase">Loading Achievements...</div>
            ) : achievements.length > 0 ? (
                achievements.map((ach) => (
                    <AchievementCard key={ach.id} title={ach.title || "Achievement"} image_url={ach.image_url} />
                ))
            ) : (
                <div className="text-gray-500 font-bold tracking-widest uppercase">No achievements yet</div>
            )}
        </div>
    );
};

export default AchievementPage;
