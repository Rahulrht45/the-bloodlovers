import React, { useEffect, useState } from 'react';
import { Trophy, Users, Award, Target, Gamepad2 } from 'lucide-react';
import { supabase } from '../supabase';
import bgImage from '../assets/freefire_bg.jpg';

const MatchesPage = () => {
    // This data would typically come from your backend/Supabase
    const [matches, setMatches] = useState([]);

    // Fetch match settings from Supabase
    useEffect(() => {
        const fetchMatchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('match_settings')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) console.error('Error fetching match settings:', error);
                if (data) setMatches(data);
            } catch (err) {
                console.error('Failed to load match settings:', err);
            }
        };

        fetchMatchSettings();

        const subscription = supabase
            .channel('match_settings_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'match_settings' }, () => {
                fetchMatchSettings();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const [activeRosterId, setActiveRosterId] = useState(null);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex justify-center overflow-y-auto overflow-x-hidden font-exo">
            <div
                className="fixed inset-0 bg-cover bg-center -z-20 transform scale-105"
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 -z-10 backdrop-blur-[2px]" />

            <div className="w-full max-w-6xl relative z-10 py-12 px-4 flex flex-col items-center">

                <h1 className="text-[var(--neon-cyan)] font-black italic text-4xl mb-12 tracking-tighter drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">TOURNAMENT FEED</h1>

                <div className="flex flex-col gap-16 w-full max-w-2xl mb-20">
                    {matches.map((match, idx) => (
                        <div key={match.id} className="match-card-group flex flex-col gap-6 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                            {/* Org Header */}
                            <div className="text-center">
                                <div className="inline-block px-12 py-4 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl text-2xl font-black italic tracking-widest text-white shadow-xl">
                                    {match.org_name}
                                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--neon-cyan)] to-transparent mt-1 rounded-full opacity-60" />
                                </div>
                            </div>

                            {/* Hero Feature */}
                            <div className="h-[240px] bg-black/50 rounded-[30px] border-2 border-white/10 flex items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(0,243,255,0.15)] group">
                                <div className={`absolute top-4 right-4 text-white px-4 py-1 rounded-full font-black text-xs z-20 shadow-lg ${match.status === 'LIVE' ? 'bg-red-600 animate-pulse' : 'bg-blue-600'}`}>
                                    {match.status || 'LIVE'}
                                </div>
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-80"
                                    style={{ backgroundImage: `url(${bgImage})` }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="relative z-10 text-center">
                                    <h3 className="text-2xl font-black italic text-white drop-shadow-md uppercase tracking-widest">{match.map_name || 'BERMUDA'}</h3>
                                    <p className="text-[var(--neon-cyan)] text-xs tracking-[4px] font-bold mt-1">OPERATIONAL ZONE</p>

                                    <button
                                        onClick={() => setActiveRosterId(activeRosterId === match.id ? null : match.id)}
                                        className="mt-4 bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-2 rounded-full text-[10px] font-black tracking-widest transition-all backdrop-blur-md"
                                    >
                                        {activeRosterId === match.id ? 'CLOSE ROSTER' : 'VIEW ROSTER'}
                                    </button>
                                </div>
                            </div>

                            {activeRosterId === match.id ? (
                                <div className="grid grid-cols-1 gap-4 animate-in fade-in zoom-in duration-300">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <div key={n} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-sm">
                                            <div className="flex flex-col text-left">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">PLAYER 0{n}</span>
                                                <span className="text-[17px] font-black italic text-white uppercase">{match[`player${n}_name`] || `PLAYER ${n}`}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-[var(--neon-cyan)] font-bold block uppercase">SHARE</span>
                                                <span className="text-[20px] font-black italic text-[var(--neon-cyan)]">{match[`player${n}`] || '0%'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <DetailCard label="SLOT PRIZE" value={match.slot_prize} highlight="cyan" featured />

                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailCard label="PRIZE POOL" value={match.prize_pool} highlight="gold" />
                                        <DetailCard label="P & M POOL" value={match.pm_pool} />
                                        <DetailCard label="MANAGEMENT" value={match.management} small />
                                        <DetailCard label="MVP" value={match.mvp} small />
                                    </div>

                                    <div className="grid grid-cols-5 gap-2">
                                        <DetailCard label="P1" value={match.player1} tiny />
                                        <DetailCard label="P2" value={match.player2} tiny />
                                        <DetailCard label="P3" value={match.player3} tiny />
                                        <DetailCard label="P4" value={match.player4} tiny />
                                        <DetailCard label="P5" value={match.player5} tiny />
                                    </div>
                                </>
                            )}

                            {idx < matches.length - 1 && (
                                <div className="py-8 flex justify-center opacity-20">
                                    <div className="w-24 h-[1px] bg-white" />
                                </div>
                            )}
                        </div>
                    ))}

                    {matches.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-gray-500 font-bold italic">NO ACTIVE TOURNAMENTS DETECTED IN SECTOR</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailCard = ({ label, value, small, tiny, highlight, delay, featured }) => {
    let textColor = 'text-white';
    let borderColor = 'border-white/10';
    let glow = '';

    if (highlight === 'cyan') {
        textColor = 'text-[var(--neon-cyan)] drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]';
        borderColor = 'border-[var(--neon-cyan)]/30';
        glow = 'shadow-[0_0_30px_rgba(0,243,255,0.1)]';
    } else if (highlight === 'gold') {
        textColor = 'text-[#FBBC04] drop-shadow-[0_0_10px_rgba(251,188,4,0.6)]';
        borderColor = 'border-[#FBBC04]/30';
        glow = 'shadow-[0_0_30px_rgba(251,188,4,0.1)]';
    }

    const textSize = featured ? 'text-5xl' : (small ? 'text-3xl' : (tiny ? 'text-lg' : 'text-4xl'));
    const padding = featured ? 'py-10' : (tiny ? 'py-3' : 'py-6');

    return (
        <div
            className={`group relative bg-black/60 ${borderColor} border rounded-3xl ${padding} px-6 text-center overflow-hidden backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-black/70 ${glow}`}
            style={{ animationDelay: delay }}
        >
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <span className="block text-xs font-bold text-gray-400 tracking-[2px] uppercase mb-1">{label}</span>
                <div className={`font-black italic leading-none ${textSize} ${textColor}`}>
                    {value}
                </div>
            </div>
        </div>
    );
};

export default MatchesPage;
