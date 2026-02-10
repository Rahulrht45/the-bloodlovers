import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { ArrowRight } from 'lucide-react';
import './MembersPage.css';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeTab, setActiveTab] = useState('all');

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

    const filteredMembers = members.filter(member => {
        if (activeTab === 'main') return member.lineup === 'main';
        if (activeTab === 'elite') return member.lineup === 'elite';
        if (activeTab === 'management') return member.lineup === 'management';
        return true;
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
                        ? 'bg-[var(--neon-cyan)] text-black shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-105'
                        : 'bg-transparent text-gray-400 border border-white/10 hover:border-[var(--neon-cyan)] hover:text-white'
                        }`}
                >
                    ALL MEMBERS
                </button>
                <button
                    onClick={() => setActiveTab('main')}
                    className={`px-6 py-2 rounded-full font-orbitron font-bold tracking-widest text-xs transition-all duration-300 ${activeTab === 'main'
                        ? 'bg-[var(--neon-purple)] text-white shadow-[0_0_15px_rgba(180,0,255,0.5)] scale-105'
                        : 'bg-transparent text-gray-400 border border-white/10 hover:border-[var(--neon-purple)] hover:text-white'
                        }`}
                >
                    MAIN LINEUP
                </button>
                <button
                    onClick={() => setActiveTab('elite')}
                    className={`px-6 py-2 rounded-full font-orbitron font-bold tracking-widest text-xs transition-all duration-300 ${activeTab === 'elite'
                        ? 'bg-[#ff3333] text-white shadow-[0_0_15px_rgba(255,50,50,0.5)] scale-105'
                        : 'bg-transparent text-gray-400 border border-white/10 hover:border-[#ff3333] hover:text-white'
                        }`}
                >
                    ELITE LINEUP
                </button>
                <button
                    onClick={() => setActiveTab('management')}
                    className={`px-6 py-2 rounded-full font-orbitron font-bold tracking-widest text-xs transition-all duration-300 ${activeTab === 'management'
                        ? 'bg-[#00ffa2] text-black shadow-[0_0_15px_rgba(0,255,162,0.5)] scale-105'
                        : 'bg-transparent text-gray-400 border border-white/10 hover:border-[#00ffa2] hover:text-white'
                        }`}
                >
                    MANAGEMENT
                </button>
            </div>

            <section className="members-grid">
                {loading ? (
                    <div className="col-span-full h-40 flex items-center justify-center text-xl font-orbitron text-[var(--neon-cyan)] animate-pulse">
                        Synchronizing with Neural Net...
                    </div>
                ) : error ? (
                    <div className="col-span-full text-red-500 text-center py-10 font-orbitron">
                        Connection Error: {error}
                    </div>
                ) : filteredMembers.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-80">
                        <div className="text-4xl mb-4">👑</div>
                        <h2 className="font-orbitron text-2xl text-[var(--neon-cyan)] mb-2 uppercase tracking-widest">
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
                                <img className="avatar-3d" src={member.avatar} alt={member.ign} />
                                <div className="card-content">
                                    <div className="member-name text-white font-bold flex items-center gap-2">
                                        {member.ign}
                                        {member.lineup === 'main' && <span className="text-[10px] bg-[var(--neon-purple)] text-white px-1 rounded font-black">MAIN</span>}
                                        {member.lineup === 'elite' && <span className="text-[10px] bg-[#ff3333] text-white px-1 rounded font-black">ELITE</span>}
                                        {member.lineup === 'management' && <span className="text-[10px] bg-[#00ffa2] text-black px-1 rounded font-black">MGMT</span>}
                                    </div>
                                    <div className="member-team text-gray-400 text-sm">{member.team}</div>
                                    <div className="role text-[var(--neon-cyan)] text-xs uppercase tracking-widest mt-1">{member.role}</div>

                                    {/* Member UID */}
                                    <div className="member-uid" style={{
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        letterSpacing: '1px',
                                        marginTop: '8px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: member.in_game_uid ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 200, 0, 0.1)',
                                        border: member.in_game_uid ? '1px solid rgba(0, 240, 255, 0.3)' : '1px dashed rgba(255, 200, 0, 0.3)',
                                        color: member.in_game_uid ? 'var(--neon-cyan)' : '#ffc800',
                                        textAlign: 'center',
                                        fontFamily: 'monospace'
                                    }}>
                                        UID: {member.inGameUid}
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
