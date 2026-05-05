import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ArrowRight } from 'lucide-react';
import { getStarFill, getRatingBreakdown } from '../utils/ratingUtils';
import './MembersPage.css';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('all');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('rating');
    const [showPointsId, setShowPointsId] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const { data, error } = await supabase
                    .from('players')
                    .select('*')
                    .order('kills', { ascending: false });

                if (error) throw error;

                // Map snake_case from DB to camelCase for UI
                const formattedData = data.map(m => ({
                    ...m,
                    mvpPoints: m.mvp_points,
                    inGameUid: m.in_game_uid || `DEMO-UID-${String(m.id).padStart(6, '0')}`,
                    lineup: m.lineup || 'member' // Default to 'member' if null
                }));

                setMembers(formattedData);
            } catch (err) {
                console.error('Error fetching members:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const filteredMembers = members
        .filter(member => {
            const tabMatch = activeTab === 'all' || 
                           (activeTab === 'main' && member.lineup === 'main') || 
                           (activeTab === 'management' && member.lineup === 'management');
            
            const roleMatch = roleFilter === 'ALL' || 
                             (member.role || '').toUpperCase() === roleFilter;
            
            return tabMatch && roleMatch;
        })
        .sort((a, b) => {
            if (sortBy === 'rating') return (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0);
            if (sortBy === 'kills') return (b.kills || 0) - (a.kills || 0);
            if (sortBy === 'wins') return (b.wins || 0) - (a.wins || 0);
            return 0;
        });

    const handleMouseMove = (e) => {
        const card = e.currentTarget.querySelector('.card');
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        card.style.transform = `rotateY(${x / 18}deg) rotateX(${-y / 18}deg)`;
    };

    const handleMouseLeave = (e) => {
        const card = e.currentTarget.querySelector('.card');
        card.style.transform = 'rotateX(0) rotateY(0)';
    };

    return (
        <div className="members-page-container">
            <section className="page-title">
                <h1>Meet our TBL'S</h1>
                <p>Top professional members dominating the competitive arena</p>

            </section>

            {/* Member Filtering Tabs */}
            <div className="flex justify-center flex-wrap gap-4 mt-12 mb-10">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-2 rounded-full font-orbitron font-bold tracking-widest text-xs transition-all duration-300 ${activeTab === 'all'
                        ? 'bg-[#ff1a1a] text-white shadow-[0_0_15px_rgba(255,26,26,0.5)] scale-105'
                        : 'bg-transparent text-gray-400 border border-white/10 hover:border-[#ff1a1a] hover:text-white'
                        }`}
                >
                    ALL MEMBERS
                </button>
                <button
                    onClick={() => setActiveTab('main')}
                    className={`px-6 py-2 rounded-full font-orbitron font-bold tracking-widest text-xs transition-all duration-300 ${activeTab === 'main'
                        ? 'bg-[#990000] text-white shadow-[0_0_15px_rgba(153,0,0,0.5)] scale-105'
                        : 'bg-transparent text-gray-400 border border-white/10 hover:border-[#990000] hover:text-white'
                        }`}
                >
                    PLAYER LINEUP
                </button>

                <button
                    onClick={() => setActiveTab('management')}
                    className={`px-6 py-2 rounded-full font-orbitron font-bold tracking-widest text-xs transition-all duration-300 ${activeTab === 'management'
                        ? 'bg-[#4d0000] text-white shadow-[0_0_15px_rgba(77,0,0,0.5)] scale-105'
                        : 'bg-transparent text-gray-400 border border-white/10 hover:border-[#4d0000] hover:text-white'
                        }`}
                >
                    MANAGEMENT
                </button>
            </div>

            {/* Role Filters & Sorting */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1400px] mx-auto px-8 mb-12 py-6 bg-black/20 border border-white/5 rounded-2xl backdrop-blur-xl">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase mr-2">FILTER ROLE:</span>
                    {['ALL', 'SNIPER', 'RUSHER', 'SUPPORT', 'BOMBER', 'ALL ROUNDER'].map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold tracking-widest transition-all ${roleFilter === role 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            {role}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-500 tracking-widest uppercase mr-2">SORT BY:</span>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-xs font-orbitron font-bold text-red-500 outline-none focus:border-red-500/50"
                    >
                        <option value="rating">HIGHEST RATING</option>
                        <option value="kills">TOTAL KILLS</option>
                        <option value="wins">MATCH WINS</option>
                    </select>
                </div>
            </div>

            <section className="members-grid">
                {loading ? (
                    <div className="col-span-full h-40 flex items-center justify-center text-xl font-orbitron text-[#ff1a1a] animate-pulse">
                        Synchronizing with Neural Net...
                    </div>
                ) : error ? (
                    <div className="col-span-full text-red-500 text-center py-10 font-orbitron">
                        Connection Error: {error}
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-80">
                        <div className="text-4xl mb-4">👑</div>
                        <h2 className="font-orbitron text-2xl text-[#ff1a1a] mb-2 uppercase tracking-widest">
                            {activeTab === 'all' ? 'No Members Yet' : `No Members in ${activeTab.toUpperCase()}`}
                        </h2>
                        <p className="font-exo text-gray-400 mb-6 max-w-md">
                            {activeTab === 'all'
                                ? 'The arena is empty. This is your chance to claim the top spot.'
                                : 'This elite squad is currently on a covert mission.'}
                        </p>
                        {activeTab === 'all' && (
                            <Link to="/signup" className="btn-primary flex items-center gap-2">
                                BECOME THE FIRST LEGEND <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>
                ) : (
                    filteredMembers.map((member) => (
                        <div
                            className="scene"
                            key={member.id}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="card">
                                <img className="avatar-3d" src={member.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${member.ign}`} alt={member.ign} />
                                <div className="card-content">
                                    <div className="member-name text-white font-bold flex items-center justify-center gap-2 text-center w-full">
                                        {member.ign}
                                        {member.lineup === 'main' && <span className="text-[10px] bg-[#990000] text-white px-1 rounded font-black">PLAYER</span>}
                                        {member.lineup === 'management' && <span className="text-[10px] bg-[#4d0000] text-white px-1 rounded font-black">MGMT</span>}
                                    </div>
                                    <div className="member-team text-gray-400 text-sm text-center w-full">{member.team}</div>
                                    <div className="role text-[#ff1a1a] text-xs uppercase tracking-widest mt-1 text-center w-full">{member.role}</div>

                                    {/* Member UID */}
                                    <div className="member-uid" style={{
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px',
                                        marginTop: '8px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: member.in_game_uid ? 'rgba(255, 26, 26, 0.1)' : 'rgba(255, 200, 0, 0.1)',
                                        border: member.in_game_uid ? '1px solid rgba(255, 26, 26, 0.3)' : '1px dashed rgba(255, 200, 0, 0.3)',
                                        color: member.in_game_uid ? '#ff1a1a' : '#ffc800',
                                        textAlign: 'center',
                                        fontFamily: 'monospace'
                                    }}>
                                        UID: {member.inGameUid}
                                    </div>

                                    {/* Star Rating Badge - Premium Redesign */}
                                    <div 
                                        className="flex justify-center mt-4 mb-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowPointsId(showPointsId === member.id ? null : member.id);
                                        }}
                                    >
                                        <div className={`relative w-full max-w-[220px] transition-all duration-500 rounded-2xl overflow-hidden border ${showPointsId === member.id ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(255,26,26,0.25)]' : 'border-white/5 bg-white/5 hover:border-red-500/30'} cursor-pointer group`}>
                                            {/* Glossy Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                            
                                            <div className="relative p-4">
                                                {/* Stars Display */}
                                                <div className="flex justify-center gap-2 mb-3">
                                                    {[...Array(5)].map((_, i) => {
                                                        const fill = getStarFill(member.rating, member.role, i);

                                                        return (
                                                            <div key={i} className="relative w-6 h-6 transition-transform group-hover:scale-110 duration-300" style={{ transitionDelay: `${i * 50}ms` }}>
                                                                <svg viewBox="0 0 24 24" className="w-full h-full text-white/10 fill-current">
                                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                                </svg>
                                                                <div className="absolute inset-0 overflow-hidden transition-all duration-700 ease-out" style={{ width: `${fill}%` }}>
                                                                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-500 fill-current drop-shadow-[0_0_10px_rgba(255,26,26,0.8)]">
                                                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {showPointsId === member.id ? (
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-52 p-4 bg-black/95 border border-red-500/20 rounded-2xl backdrop-blur-2xl z-50 shadow-2xl animate-in zoom-in-95 duration-300">
                                                        <div className="text-[10px] font-black text-red-500 tracking-[0.2em] mb-3 uppercase text-center">Skill Breakdown</div>
                                                        <div className="space-y-3">
                                                            {getRatingBreakdown(member).map((stat, idx) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                                                    <span className="text-[8px] font-black tracking-[3px] text-gray-400 uppercase">{stat.n}</span>
                                                                    <span className="text-xs font-black text-red-500 italic">{stat.p}<span className="text-[8px] ml-0.5 opacity-50 not-italic">pts</span></span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center px-1">
                                                            <span className="text-[7px] text-gray-500 font-bold tracking-widest uppercase">Performance Index</span>
                                                            <span className="text-xs font-black text-white">{member.rating || 0}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-1">
                                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[4px] group-hover:text-red-500/80 transition-colors">
                                                            Rank Metrics
                                                        </div>
                                                        <div className="h-0.5 w-8 bg-red-500/30 mx-auto mt-2 rounded-full group-hover:w-16 transition-all duration-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="stats">
                                        <div className="stat-item">
                                            {member.kills}
                                            <small>KILLS</small>
                                        </div>
                                        <div className="stat-item">
                                            {member.wins || 0}
                                            <small>WINS</small>
                                        </div>
                                        <div className="stat-item">
                                            {member.mvpPoints}
                                            <small>MVP</small>
                                        </div>
                                    </div>

                                    <a className="btn-view" href="#">VIEW PROFILE</a>
                                </div>
                            </div>
                        </div>
                    )))}
            </section>
        </div>
    );
};

export default MembersPage;
