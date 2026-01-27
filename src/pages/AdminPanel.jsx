import React, { useState, useEffect, useCallback } from 'react';
import {
    LayoutDashboard,
    Users,
    Shield,
    Trophy,
    LogOut,
    Edit,
    Trash2,
    User,
    TrendingUp,
    Zap,
    Gamepad2
} from 'lucide-react';
import { supabase } from '../supabase';
import './AdminPanel.css';

const AdminPanel = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [players, setPlayers] = useState([]);
    const [stats, setStats] = useState({ players: 0, teams: 0, matches: 3 });
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});

    const [allMatches, setAllMatches] = useState([]);
    const [matchForm, setMatchForm] = useState({
        id: null,
        orgName: 'BLOODLOVERS',
        mapName: 'BERMUDA',
        status: 'LIVE',
        prizePool: '',
        slotPrize: '',
        pmPool: '',
        management: '10%',
        mvp: '5%',
        player1: '10%', player1Name: 'PLAYER 1',
        player2: '20%', player2Name: 'PLAYER 2',
        player3: '15%', player3Name: 'PLAYER 3',
        player4: '10%', player4Name: 'PLAYER 4',
        player5: '10%', player5Name: 'PLAYER 5'
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [isAddingMatch, setIsAddingMatch] = useState(false);

    const fetchMatchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('match_settings')
                .select('*')
                .order('id', { ascending: false });

            if (data) {
                setAllMatches(data);
                // Set stats
                setStats(prev => ({ ...prev, matches: data.length }));
            }
        } catch (error) {
            console.error('Error fetching match settings', error);
        }
    };

    const handleEditMatch = (match) => {
        setMatchForm({
            id: match.id,
            orgName: match.org_name,
            mapName: match.map_name || 'BERMUDA',
            status: match.status || 'LIVE',
            prizePool: match.prize_pool,
            slotPrize: match.slot_prize,
            pmPool: match.pm_pool,
            management: match.management,
            mvp: match.mvp,
            player1: match.player1 || '10%', player1Name: match.player1_name || 'PLAYER 1',
            player2: match.player2, player2Name: match.player2_name || 'PLAYER 2',
            player3: match.player3, player3Name: match.player3_name || 'PLAYER 3',
            player4: match.player4, player4Name: match.player4_name || 'PLAYER 4',
            player5: match.player5, player5Name: match.player5_name || 'PLAYER 5'
        });
        setIsAddingMatch(true);
    };

    const handleDeleteMatch = async (id) => {
        if (!window.confirm('Delete this match?')) return;
        try {
            const { error } = await supabase.from('match_settings').delete().eq('id', id);
            if (error) throw error;
            setAllMatches(allMatches.filter(m => m.id !== id));
        } catch (err) {
            alert('Failed to delete match');
        }
    };

    const handleSaveMatchSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);

        const ensurePercent = (val) => {
            if (!val) return '0%';
            const str = String(val).trim();
            if (/^\d+$/.test(str)) return `${str}%`;
            return str;
        };

        const ensureCurrency = (val) => {
            if (!val) return '₹0';
            const str = String(val).trim();
            if (/^\d+$/.test(str.replace(/[₹,]/g, ''))) return `₹${str.replace('₹', '')}`;
            return str;
        };

        try {
            const rowData = {
                org_name: matchForm.orgName || 'BLOODLOVERS',
                map_name: matchForm.mapName || 'BERMUDA',
                status: matchForm.status || 'LIVE',
                prize_pool: ensureCurrency(matchForm.prizePool),
                slot_prize: ensureCurrency(matchForm.slotPrize),
                pm_pool: ensureCurrency(matchForm.pmPool),
                management: ensurePercent(matchForm.management),
                mvp: ensurePercent(matchForm.mvp),
                player1: ensurePercent(matchForm.player1), player1_name: matchForm.player1Name,
                player2: ensurePercent(matchForm.player2), player2_name: matchForm.player2Name,
                player3: ensurePercent(matchForm.player3), player3_name: matchForm.player3Name,
                player4: ensurePercent(matchForm.player4), player4_name: matchForm.player4Name,
                player5: ensurePercent(matchForm.player5), player5_name: matchForm.player5Name,
            };

            if (matchForm.id) {
                rowData.id = matchForm.id;
            }

            const { data, error } = await supabase
                .from('match_settings')
                .upsert(rowData)
                .select();

            if (error) throw error;

            alert('Match configuration saved!');
            fetchMatchSettings();
            setIsAddingMatch(false);
            setMatchForm({
                id: null,
                orgName: 'BLOODLOVERS',
                mapName: 'BERMUDA',
                status: 'LIVE',
                prizePool: '',
                slotPrize: '',
                pmPool: '',
                management: '10%',
                mvp: '5%',
                player1: '10%', player1Name: 'PLAYER 1',
                player2: '20%', player2Name: 'PLAYER 2',
                player3: '15%', player3Name: 'PLAYER 3',
                player4: '10%', player4Name: 'PLAYER 4',
                player5: '10%', player5Name: 'PLAYER 5'
            });
        } catch (err) {
            console.error('Error saving match:', err);
            alert('Failed to save settings: ' + (err.message || 'Unknown error'));
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchAdminData = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('players')
                .select('*')
                .order('id', { ascending: true });

            if (error) throw error;
            setPlayers(data);

            const uniqueTeams = new Set(data.map(p => p.team).filter(Boolean));
            setStats({
                players: data.length,
                teams: uniqueTeams.size,
                matches: 3
            });

            // Fetch match settings as well
            await fetchMatchSettings();
        } catch (err) {
            console.error('Error fetching admin data:', err);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            fetchAdminData();
        }
    }, [isLoggedIn, fetchAdminData]);

    const handleLogin = (e) => {
        e.preventDefault();

        // Trim whitespace from inputs
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        console.log('Login attempt:', { trimmedUsername, trimmedPassword });

        if (
            (trimmedUsername === "Sadaf" && trimmedPassword === "Sadaf123") ||
            (trimmedUsername === "rahul" && trimmedPassword === "Rahul123")
        ) {
            console.log('Login successful');
            setIsLoggedIn(true);
        } else {
            console.log('Login failed - credentials do not match');
            alert("Wrong Username or Password");
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
    };

    const handleDeletePlayer = async (id) => {
        if (window.confirm('Are you sure you want to delete this player? This action is permanent.')) {
            const { error } = await supabase
                .from('players')
                .delete()
                .eq('id', id);

            if (!error) {
                setPlayers(players.filter(p => p.id !== id));
                setStats(prev => ({ ...prev, players: prev.players - 1 }));
            }
        }
    };

    const handleEditPlayer = (player) => {
        setEditingId(player.id);
        setEditValues({
            ign: player.ign || '',
            kills: player.kills || 0,
            wins: player.wins || 0
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleSaveEdit = async (id) => {
        try {
            const { error } = await supabase
                .from('players')
                .update({
                    ign: editValues.ign,
                    kills: editValues.kills,
                    wins: editValues.wins
                })
                .eq('id', id);

            if (!error) {
                setPlayers(players.map(p =>
                    p.id === id ? { ...p, ...editValues } : p
                ));
                setEditingId(null);
                setEditValues({});
            } else {
                alert('Failed to update player stats');
            }
        } catch (err) {
            console.error('Error updating player:', err);
            alert('An error occurred while updating player stats');
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="admin-container">
                <div className="login-page">
                    <div className="login-box">
                        <div className="login-header">
                            <h1>ADMIN PORTAL</h1>
                            <p>Enter your credentials to access the neural link</p>
                        </div>
                        <form onSubmit={handleLogin}>
                            <div className="admin-input-group">
                                <label>Operator Username</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Sadaf"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="admin-input-group">
                                <label>Secure Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit">ESTABLISH LINK</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#020014] overflow-auto">
            <div className="admin-container">
                <div className="admin-dashboard">
                    {/* SIDEBAR */}
                    <div className="admin-sidebar">
                        <div className="sidebar-logo">
                            <div className="logo-icon">
                                <Zap size={20} color="#000" />
                            </div>
                            <h2>BLOODLOVERS</h2>
                        </div>
                        <ul>
                            <li>
                                <button
                                    className={`nav-link ${activeTab === 'Dashboard' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Dashboard')}
                                >
                                    <LayoutDashboard size={20} /> Dashboard
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-link ${activeTab === 'Players' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Players')}
                                >
                                    <Users size={20} /> Players
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-link ${activeTab === 'Teams' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Teams')}
                                >
                                    <Shield size={20} /> Teams
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-link ${activeTab === 'Matches' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('Matches')}
                                >
                                    <Gamepad2 size={20} /> Matches
                                </button>
                            </li>
                            <li style={{ marginTop: 'auto' }}>
                                <button className="nav-link logout-btn" onClick={handleLogout}>
                                    <LogOut size={20} /> Logout
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="admin-main">
                        <header className="dashboard-header">
                            <div>
                                <h1>{activeTab}</h1>
                                <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Welcome back, Operator {username}</p>
                            </div>
                            <div className="admin-user-info">
                                <span className="text-sm font-medium">ADMIN MODE</span>
                                <div className="avatar-circle">{username[0]}</div>
                            </div>
                        </header>

                        {/* CARDS */}
                        <div className="admin-cards">
                            <div className="admin-card">
                                <div className="admin-card-icon"><Users size={24} /></div>
                                <div className="admin-card-info">
                                    <h3>Total Players</h3>
                                    <div className="card-value">{stats.players}</div>
                                </div>
                            </div>
                            <div className="admin-card">
                                <div className="admin-card-icon"><Shield size={24} /></div>
                                <div className="admin-card-info">
                                    <h3>Active Teams</h3>
                                    <div className="card-value">{stats.teams}</div>
                                </div>
                            </div>
                            <div className="admin-card">
                                <div className="admin-card-icon"><TrendingUp size={24} /></div>
                                <div className="admin-card-info">
                                    <h3>Active Matches</h3>
                                    <div className="card-value">{stats.matches}</div>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        {activeTab === 'Dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="admin-content-box pt-8">
                                    <h2 className="text-xl font-black italic mb-4 text-[var(--neon-cyan)] px-4 uppercase">System Status</h2>
                                    <div className="space-y-4 p-4">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-gray-400 uppercase text-xs">Database Connection</span>
                                            <span className="text-green-500 font-bold">ACTIVE</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-gray-400 uppercase text-xs">Sync Frequency</span>
                                            <span className="text-white">REALTIME</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-gray-400 uppercase text-xs">Admin Level</span>
                                            <span className="text-[var(--neon-cyan)] italic font-black">SUPER OPERATOR</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="admin-content-box pt-8">
                                    <h2 className="text-xl font-black italic mb-4 text-[var(--neon-cyan)] px-4 uppercase">Quick Actions</h2>
                                    <div className="grid grid-cols-2 gap-4 p-4">
                                        <button onClick={() => setActiveTab('Matches')} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all text-center">
                                            <Gamepad2 className="mx-auto mb-2" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Match Config</span>
                                        </button>
                                        <button onClick={() => setActiveTab('Players')} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all text-center">
                                            <Users className="mx-auto mb-2" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Manage Roster</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Players' && (
                            <div className="admin-content-box">
                                <div className="admin-content-header">
                                    <h2 style={{ fontSize: '1.2rem', fontFamily: 'Orbitron' }}>Current Roster</h2>
                                    <button className="btn-primary text-xs py-2 px-6">ADD PLAYER</button>
                                </div>

                                <div className="table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Rank / ID</th>
                                                <th>Player / IGN</th>
                                                <th>Assigned Team</th>
                                                <th>Kills</th>
                                                <th>Wins</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players.map((p) => (
                                                <tr key={p.id}>
                                                    <td style={{ fontWeight: 'bold', color: '#00f0ff' }}>#{p.id}</td>
                                                    <td>
                                                        <div className="player-cell-info">
                                                            <img
                                                                src={p.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${p.ign}`}
                                                                className="player-avatar-mini"
                                                                alt=""
                                                            />
                                                            {editingId === p.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editValues.ign}
                                                                    onChange={(e) => setEditValues({ ...editValues, ign: e.target.value })}
                                                                    style={{
                                                                        width: '150px',
                                                                        padding: '4px 8px',
                                                                        background: 'rgba(0,240,255,0.1)',
                                                                        border: '1px solid var(--neon-cyan)',
                                                                        borderRadius: '4px',
                                                                        color: '#fff',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: '600'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontWeight: '600' }}>{p.ign}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="team-badge">{p.team || 'FREE AGENT'}</span>
                                                    </td>
                                                    <td>
                                                        {editingId === p.id ? (
                                                            <input
                                                                type="number"
                                                                value={editValues.kills}
                                                                onChange={(e) => setEditValues({ ...editValues, kills: parseInt(e.target.value) || 0 })}
                                                                style={{
                                                                    width: '80px',
                                                                    padding: '4px 8px',
                                                                    background: 'rgba(0,240,255,0.1)',
                                                                    border: '1px solid var(--neon-cyan)',
                                                                    borderRadius: '4px',
                                                                    color: '#fff',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span style={{ fontWeight: '600', color: '#fff' }}>{p.kills || 0}</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingId === p.id ? (
                                                            <input
                                                                type="number"
                                                                value={editValues.wins}
                                                                onChange={(e) => setEditValues({ ...editValues, wins: parseInt(e.target.value) || 0 })}
                                                                style={{
                                                                    width: '80px',
                                                                    padding: '4px 8px',
                                                                    background: 'rgba(0,240,255,0.1)',
                                                                    border: '1px solid var(--neon-cyan)',
                                                                    borderRadius: '4px',
                                                                    color: '#fff',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            />
                                                        ) : (
                                                            <span style={{ fontWeight: '600', color: '#fff' }}>{p.wins || 0}</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="admin-actions">
                                                            {editingId === p.id ? (
                                                                <>
                                                                    <button
                                                                        className="admin-btn-icon"
                                                                        style={{ background: '#00f0ff', color: '#000' }}
                                                                        onClick={() => handleSaveEdit(p.id)}
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        className="admin-btn-icon admin-btn-delete"
                                                                        onClick={handleCancelEdit}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        className="admin-btn-icon admin-btn-edit"
                                                                        onClick={() => handleEditPlayer(p)}
                                                                    >
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button
                                                                        className="admin-btn-icon admin-btn-delete"
                                                                        onClick={() => handleDeletePlayer(p.id)}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Matches' && (
                            <div className="admin-content-box">
                                <div className="admin-content-header">
                                    <h2 style={{ fontSize: '1.2rem', fontFamily: 'Orbitron' }}>Match Operations</h2>
                                    {!isAddingMatch && (
                                        <button
                                            onClick={() => setIsAddingMatch(true)}
                                            className="bg-[var(--neon-cyan)] text-black font-black italic px-6 py-2 rounded-full text-xs hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                                        >
                                            CREATE NEW MATCH
                                        </button>
                                    )}
                                </div>

                                {isAddingMatch ? (
                                    <form onSubmit={handleSaveMatchSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 text-white">
                                        <div className="md:col-span-2 flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 mb-2">
                                            <h3 className="text-[var(--neon-cyan)] font-black italic uppercase">Configuring {matchForm.id ? "Existing" : "New"} Match</h3>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingMatch(false)}
                                                className="text-gray-400 hover:text-white text-xs font-bold"
                                            >
                                                CANCEL
                                            </button>
                                        </div>

                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Organization Name</label>
                                            <input
                                                type="text"
                                                value={matchForm.orgName}
                                                onChange={(e) => setMatchForm({ ...matchForm, orgName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all placeholder:text-white/10"
                                                placeholder="e.g. NOVA ESPORTS"
                                            />
                                        </div>
                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Map Name</label>
                                            <input
                                                type="text"
                                                value={matchForm.mapName}
                                                onChange={(e) => setMatchForm({ ...matchForm, mapName: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                                placeholder="e.g. BERMUDA"
                                            />
                                        </div>
                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Match Status</label>
                                            <select
                                                value={matchForm.status}
                                                onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            >
                                                <option value="LIVE">LIVE</option>
                                                <option value="UPCOMING">UPCOMING</option>
                                                <option value="FINISHED">FINISHED</option>
                                            </select>
                                        </div>
                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Prize Pool</label>
                                            <input
                                                type="text"
                                                value={matchForm.prizePool}
                                                onChange={(e) => setMatchForm({ ...matchForm, prizePool: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Slot Prize</label>
                                            <input
                                                type="text"
                                                value={matchForm.slotPrize}
                                                onChange={(e) => setMatchForm({ ...matchForm, slotPrize: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">P & M Pool</label>
                                            <input
                                                type="text"
                                                value={matchForm.pmPool}
                                                onChange={(e) => setMatchForm({ ...matchForm, pmPool: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 border-t border-white/10 my-4" />

                                        <div className="md:col-span-2 mb-4">
                                            <h4 className="text-[var(--neon-cyan)] text-[10px] font-black italic uppercase tracking-[3px]">Player Roster & Shares</h4>
                                        </div>

                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <React.Fragment key={num}>
                                                <div className="admin-input-group">
                                                    <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Player {num} IGN</label>
                                                    <input
                                                        type="text"
                                                        value={matchForm[`player${num}Name`]}
                                                        onChange={(e) => setMatchForm({ ...matchForm, [`player${num}Name`]: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                                        placeholder={`IGN 0${num}`}
                                                    />
                                                </div>
                                                <div className="admin-input-group">
                                                    <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Player {num} Share</label>
                                                    <input
                                                        type="text"
                                                        value={matchForm[`player${num}`]}
                                                        onChange={(e) => setMatchForm({ ...matchForm, [`player${num}`]: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all font-mono"
                                                        placeholder="e.g. 10%"
                                                    />
                                                </div>
                                            </React.Fragment>
                                        ))}

                                        <div className="col-span-1 md:col-span-2 border-t border-white/10 my-4" />

                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Management Share</label>
                                            <input
                                                type="text"
                                                value={matchForm.management}
                                                onChange={(e) => setMatchForm({ ...matchForm, management: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">MVP Reward</label>
                                            <input
                                                type="text"
                                                value={matchForm.mvp}
                                                onChange={(e) => setMatchForm({ ...matchForm, mvp: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
                                            <button
                                                type="submit"
                                                disabled={savingSettings}
                                                className="bg-[var(--neon-cyan)] text-black font-black italic py-3 px-12 rounded-full hover:bg-white hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all transform active:scale-95 text-xs uppercase"
                                            >
                                                {savingSettings ? 'SYNCING...' : (matchForm.id ? 'UPDATE MATCH' : 'DEPLOY MATCH')}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="table-container p-4">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Org / Map</th>
                                                    <th>Prize Pool</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allMatches.map(m => (
                                                    <tr key={m.id}>
                                                        <td>
                                                            <div className="font-bold text-white">{m.org_name}</div>
                                                            <div className="text-[10px] text-[var(--neon-cyan)] tracking-widest font-black uppercase">{m.map_name || 'BERMUDA'}</div>
                                                        </td>
                                                        <td className="font-bold">{m.prize_pool}</td>
                                                        <td>
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black italic ${m.status === 'LIVE' ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'}`}>
                                                                {m.status || 'LIVE'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="admin-actions">
                                                                <button onClick={() => handleEditMatch(m)} className="admin-btn-icon text-white"><Edit size={16} /></button>
                                                                <button onClick={() => handleDeleteMatch(m.id)} className="admin-btn-icon text-red-500"><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {allMatches.length === 0 && (
                                                    <tr>
                                                        <td colSpan="4" className="text-center py-10 text-gray-500">No matches found. Create your first match!</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
