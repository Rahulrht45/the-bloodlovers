import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './PlayersPage.css';

const PlayersPage = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const { data, error } = await supabase
                    .from('players')
                    .select('*')
                    .order('kills', { ascending: false });

                if (error) throw error;

                console.log('Raw player data from database:', data);

                // Map snake_case from DB to camelCase for UI
                const formattedData = data.map(p => ({
                    ...p,
                    mvpPoints: p.mvp_points
                }));

                console.log('Formatted player data:', formattedData);
                setPlayers(formattedData);
            } catch (err) {
                console.error('Error fetching players:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, []);

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
        <div className="players-page-container">
            <section className="page-title">
                <h1>Meet the Legends</h1>
                <p>Top professional players dominating the competitive arena</p>
            </section>

            <section className="players-grid">
                {loading ? (
                    <div className="col-span-full h-40 flex items-center justify-center text-xl font-orbitron text-[var(--neon-cyan)] animate-pulse">
                        Synchronizing with Neural Net...
                    </div>
                ) : error ? (
                    <div className="col-span-full text-red-500 text-center py-10 font-orbitron">
                        Connection Error: {error}
                    </div>
                ) : players.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center opacity-80">
                        <div className="text-4xl mb-4">👑</div>
                        <h2 className="font-orbitron text-2xl text-[var(--neon-cyan)] mb-2 uppercase tracking-widest">No Players Yet</h2>
                        <p className="font-exo text-gray-400 mb-6 max-w-md">The arena is empty. This is your chance to claim the top spot.</p>
                        <Link to="/signup" className="btn-primary flex items-center gap-2">
                            BECOME THE FIRST LEGEND <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    players.map((player) => (
                        <div
                            className="scene"
                            key={player.id}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <div className="card">
                                <img className="avatar-3d" src={player.avatar} alt={player.ign} />
                                <div className="card-content">
                                    <div className="player-name">{player.ign}</div>
                                    <div className="player-team">{player.team}</div>
                                    <div className="role">{player.role}</div>

                                    <div className="stats">
                                        <div className="stat-item">
                                            {player.kills}
                                            <small>KILLS</small>
                                        </div>
                                        <div className="stat-item">
                                            {player.wins || 0}
                                            <small>WINS</small>
                                        </div>
                                        <div className="stat-item">
                                            {player.mvpPoints}
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

export default PlayersPage;
