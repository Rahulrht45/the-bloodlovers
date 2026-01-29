import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import './MvpPage.css'; // Import the specific CSS

const MvpPage = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('mvp_points_monthly');

    // Fetch Players
    useEffect(() => {
        fetchPlayers();
        const subscription = supabase
            .channel('players_leaderboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchPlayers)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchPlayers = async () => {
        try {
            const { data, error } = await supabase.from('players').select('*');
            if (error) throw error;
            if (data) setPlayers(data);
        } catch (error) {
            console.error("Error fetching players:", error);
        } finally {
            setLoading(false);
        }
    };

    // Sorting Helper
    const getSortedPlayers = () => {
        return [...players].sort((a, b) => {
            const valA = a[sortBy] || 0;
            const valB = b[sortBy] || 0;
            if (sortBy === 'survival_time' && typeof valA === 'string' && valA.includes(':')) {
                const [mA, sA] = valA.split(':').map(Number);
                const [mB, sB] = valB.split(':').map(Number);
                return ((mB * 60) + sB) - ((mA * 60) + sA);
            }
            return (Number(valB) || 0) - (Number(valA) || 0);
        });
    };

    const sortedPlayers = getSortedPlayers();
    const top3 = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3);

    // Countdown Timer State
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            // Get the 1st day of the NEXT month
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const difference = endOfMonth - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0 });
            }
        };

        calculateTimeLeft(); // Initial call
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    // Filter Tabs Configuration
    const filters = [
        { id: 'mvp_points_monthly', label: 'MONTHLY MVP' },
        { id: 'mvp_points', label: 'ALL-TIME MVP' },
        { id: 'kills', label: 'MOST KILLS' },
        { id: 'damage', label: 'MOST DAMAGE' },
        { id: 'assists', label: 'ASSISTS' },
        { id: 'survival_time', label: 'SURVIVAL TIME' },
        { id: 'wins', label: 'MOST WINS' }
    ];

    // Helper to render a stat cell
    const renderStatCell = (player, statKey) => {
        const isActive = sortBy === statKey;
        const value = player[statKey] || (statKey === 'survival_time' ? '00:00' : 0);

        return (
            <div className={isActive ? 'highlight-stat' : 'muted'}>
                {value}
            </div>
        );
    };

    return (
        <div className="mvp-page-wrapper">
            <div className="leaderboard">

                {/* HEADER */}
                <div className="mvp-header">
                    <h1>MVP <span>LEADERBOARD</span></h1>

                    {sortBy === 'mvp_points_monthly' && (
                        <div className="monthly-countdown">
                            <span className="countdown-label">NEXT RESET IN:</span>
                            <div className="countdown-timer">
                                <span className="time-unit">{timeLeft.days}d</span> :
                                <span className="time-unit">{timeLeft.hours}h</span> :
                                <span className="time-unit">{timeLeft.minutes}m</span>
                            </div>
                        </div>
                    )}

                    <p>Ranking based on raw data • {filters.find(f => f.id === sortBy)?.label}</p>

                    <div className="filters">
                        {filters.map(filter => (
                            <div
                                key={filter.id}
                                className={`filter ${sortBy === filter.id ? 'active' : ''}`}
                                onClick={() => setSortBy(filter.id)}
                            >
                                {filter.label}
                            </div>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '100px', color: '#5f6f8f' }}>Loading...</div>
                ) : (
                    <>
                        {/* TOP 3 */}
                        <div className="top3">
                            {/* RANK 2 */}
                            {top3[1] && (
                                <div className="mvp-card">
                                    <div className="rank">#2</div>
                                    <div className="avatar">
                                        <img src={top3[1].avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${top3[1].ign}`} alt="" />
                                    </div>
                                    <div className="name">{top3[1].ign}</div>
                                    <div className="team">{top3[1].team || 'The Bloodlovers'}</div>
                                    <div className="value">{top3[1][sortBy] || 0}</div>
                                </div>
                            )}

                            {/* RANK 1 (GOLD) */}
                            {top3[0] && (
                                <div className="mvp-card gold">
                                    <div className="rank">#1 • {sortBy.includes('monthly') ? 'MONTHLY' : 'ALL-TIME'}</div>
                                    <div className="avatar">
                                        <img src={top3[0].avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${top3[0].ign}`} alt="" />
                                    </div>
                                    <div className="name">{top3[0].ign}</div>
                                    <div className="team">{top3[0].team || 'The Bloodlovers'}</div>
                                    <div className="value">{top3[0][sortBy] || 0}</div>
                                </div>
                            )}

                            {/* RANK 3 */}
                            {top3[2] && (
                                <div className="mvp-card">
                                    <div className="rank">#3</div>
                                    <div className="avatar">
                                        <img src={top3[2].avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${top3[2].ign}`} alt="" />
                                    </div>
                                    <div className="name">{top3[2].ign}</div>
                                    <div className="team">{top3[2].team || 'The Bloodlovers'}</div>
                                    <div className="value">{top3[2][sortBy] || 0}</div>
                                </div>
                            )}
                        </div>

                        {/* TABLE */}
                        {rest.length > 0 && (
                            <div className="mvp-table">
                                <div className="mvp-row header">
                                    <div>#</div>
                                    <div>MEMBER</div>
                                    <div className={sortBy === 'mvp_points_monthly' ? 'highlight-stat' : ''}>M. MVP</div>
                                    <div className={sortBy === 'mvp_points' ? 'highlight-stat' : ''}>T. MVP</div>
                                    <div className={sortBy === 'kills' ? 'highlight-stat' : ''}>KILLS</div>
                                    <div className={sortBy === 'damage' ? 'highlight-stat' : ''}>DAMAGE</div>
                                    <div className={sortBy === 'assists' ? 'highlight-stat' : ''}>ASSISTS</div>
                                    <div className={sortBy === 'survival_time' ? 'highlight-stat' : ''}>TIME</div>
                                    <div className={sortBy === 'wins' ? 'highlight-stat' : ''}>WINS</div>
                                </div>

                                {rest.map((player, index) => (
                                    <div key={player.id} className="mvp-row">
                                        <div>#{index + 4}</div>
                                        <div>{player.ign}</div>
                                        {renderStatCell(player, 'mvp_points_monthly')}
                                        {renderStatCell(player, 'mvp_points')}
                                        {renderStatCell(player, 'kills')}
                                        {renderStatCell(player, 'damage')}
                                        {renderStatCell(player, 'assists')}
                                        {renderStatCell(player, 'survival_time')}
                                        {renderStatCell(player, 'wins')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="footer">
                    Leaderboard updates in real-time • Admin controlled
                </div>

            </div>
        </div>
    );
};

export default MvpPage;
