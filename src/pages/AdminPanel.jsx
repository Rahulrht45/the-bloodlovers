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
    const [editingWallet, setEditingWallet] = useState(null);
    const [walletRefresh, setWalletRefresh] = useState(0);

    const [allMatches, setAllMatches] = useState([]);
    const toLocalISO = (date) => {
        const tzoffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
    };

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
        player2: '10%', player2Name: 'PLAYER 2',
        player3: '10%', player3Name: 'PLAYER 3',
        player4: '10%', player4Name: 'PLAYER 4',
        player5: '10%', player5Name: 'PLAYER 5',
        rank1: '৳200', rank2: '৳100', rank3: '৳75', rank4: '৳25',
        startTime: toLocalISO(new Date()),
        endTime: toLocalISO(new Date(Date.now() + 3600000))
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [isAddingMatch, setIsAddingMatch] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [calcRank, setCalcRank] = useState('');

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
        const toLocalISO = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const tzoffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
        };

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
            player5: match.player5, player5Name: match.player5_name || 'PLAYER 5',
            rank1: match.rank1_percent || '৳0',
            rank2: match.rank2_percent || '৳0',
            rank3: match.rank3_percent || '৳0',
            rank4: match.rank4_percent || '৳0',
            startTime: toLocalISO(match.start_at),
            endTime: toLocalISO(match.end_at)
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
            if (!val) return '৳0';
            const str = String(val).trim();
            if (/^[\d,.]+$/.test(str.replace(/[৳₹,]/g, ''))) return `৳${str.replace(/[৳₹]/g, '')}`;
            return str;
        };

        const getVal = (v) => parseInt(String(v).replace(/[৳₹,]/g, '')) || 0;
        const totalPrizesSum = getVal(matchForm.rank1) + getVal(matchForm.rank2) + getVal(matchForm.rank3) + getVal(matchForm.rank4);
        const expectedPool = getVal(matchForm.prizePool);

        if (totalPrizesSum !== expectedPool && expectedPool > 0) {
            alert(`Validation Failed: The sum of rank prizes (৳${totalPrizesSum}) must equal the total Prize Pool (৳${expectedPool}). Please adjust the rank amounts.`);
            setSavingSettings(false);
            return;
        }

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
                rank1_percent: ensureCurrency(matchForm.rank1),
                rank2_percent: ensureCurrency(matchForm.rank2),
                rank3_percent: ensureCurrency(matchForm.rank3),
                rank4_percent: ensureCurrency(matchForm.rank4),
                start_at: new Date(matchForm.startTime).toISOString(),
                end_at: new Date(matchForm.endTime).toISOString()
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
            const toLocalISO = (date) => {
                const tzoffset = date.getTimezoneOffset() * 60000;
                return new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
            };

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
                player2: '10%', player2Name: 'PLAYER 2',
                player3: '10%', player3Name: 'PLAYER 3',
                player4: '10%', player4Name: 'PLAYER 4',
                player5: '10%', player5Name: 'PLAYER 5',
                rank1: '৳200', rank2: '৳100', rank3: '৳75', rank4: '৳25',
                startTime: toLocalISO(new Date()),
                endTime: toLocalISO(new Date(Date.now() + 3600000))
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
                    {/* MOBILE TOGGLE */}
                    <button
                        className="admin-mobile-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '✕' : '☰'}
                    </button>

                    {/* SIDEBAR */}
                    <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
                            <div className="flex items-center gap-4">
                                <div className="md:hidden w-8" /> {/* Spacer for toggle */}
                                <div>
                                    <h1>{activeTab}</h1>
                                    <p className="text-xs opacity-40">Welcome back, Operator {username}</p>
                                </div>
                            </div>
                            <div className="admin-user-info">
                                <span className="hidden sm:inline text-sm font-medium">ADMIN MODE</span>
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

                                {/* PLAYER BALANCES SECTION */}
                                <div className="admin-content-box pt-8 md:col-span-2">
                                    <div className="flex justify-between items-center px-4 mb-4">
                                        <h2 className="text-xl font-black italic text-[#FBBC04] uppercase">Player Wallet Balances</h2>
                                        <button
                                            onClick={() => window.location.reload()}
                                            className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all border border-white/10"
                                        >
                                            Refresh
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                        {/* Corporate Wallets */}
                                        <div className="bg-white/5 border border-[var(--neon-cyan)]/20 rounded-xl p-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[3px] text-[var(--neon-cyan)] mb-4">Corporate Wallets (TBL)</h3>
                                            <div className="space-y-3">
                                                {/* TBL MANAGEMENT */}
                                                <div className="flex justify-between items-center border-b border-white/5 pb-2 gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">TBL MANAGEMENT</span>
                                                    {editingWallet === 'tbl_mgmt_bal' ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                defaultValue={Number(localStorage.getItem('tbl_mgmt_bal') || 0)}
                                                                id="edit_tbl_mgmt_bal"
                                                                className="w-24 bg-black/40 border border-[var(--neon-cyan)] rounded px-2 py-1 text-white text-sm font-bold text-right"
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const newBalance = Number(document.getElementById('edit_tbl_mgmt_bal').value);
                                                                        localStorage.setItem('tbl_mgmt_bal', String(newBalance));
                                                                        setEditingWallet(null);
                                                                        setWalletRefresh(prev => prev + 1);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newBalance = Number(document.getElementById('edit_tbl_mgmt_bal').value);
                                                                    localStorage.setItem('tbl_mgmt_bal', String(newBalance));
                                                                    setEditingWallet(null);
                                                                    setWalletRefresh(prev => prev + 1);
                                                                }}
                                                                className="text-[8px] bg-green-500 text-black px-2 py-1 rounded font-bold hover:bg-green-400"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingWallet(null)}
                                                                className="text-[8px] bg-red-500/80 text-white px-2 py-1 rounded font-bold hover:bg-red-500"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black italic text-sm text-white">৳{Number(localStorage.getItem('tbl_mgmt_bal') || 0).toLocaleString()}</span>
                                                            <button
                                                                onClick={() => setEditingWallet('tbl_mgmt_bal')}
                                                                className="text-[8px] bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] px-2 py-1 rounded font-bold hover:bg-[var(--neon-cyan)]/40"
                                                                title="Edit balance"
                                                            >
                                                                ✎
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* TBL RAHUL (MVP) */}
                                                <div className="flex justify-between items-center border-b border-white/5 pb-2 gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">TBL RAHUL (MVP)</span>
                                                    {editingWallet === 'tbl_mvp_bal' ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                defaultValue={Number(localStorage.getItem('tbl_mvp_bal') || 0)}
                                                                id="edit_tbl_mvp_bal"
                                                                className="w-24 bg-black/40 border border-[var(--neon-cyan)] rounded px-2 py-1 text-white text-sm font-bold text-right"
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const newBalance = Number(document.getElementById('edit_tbl_mvp_bal').value);
                                                                        localStorage.setItem('tbl_mvp_bal', String(newBalance));
                                                                        setEditingWallet(null);
                                                                        setWalletRefresh(prev => prev + 1);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newBalance = Number(document.getElementById('edit_tbl_mvp_bal').value);
                                                                    localStorage.setItem('tbl_mvp_bal', String(newBalance));
                                                                    setEditingWallet(null);
                                                                    setWalletRefresh(prev => prev + 1);
                                                                }}
                                                                className="text-[8px] bg-green-500 text-black px-2 py-1 rounded font-bold hover:bg-green-400"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingWallet(null)}
                                                                className="text-[8px] bg-red-500/80 text-white px-2 py-1 rounded font-bold hover:bg-red-500"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black italic text-sm text-white">৳{Number(localStorage.getItem('tbl_mvp_bal') || 0).toLocaleString()}</span>
                                                            <button
                                                                onClick={() => setEditingWallet('tbl_mvp_bal')}
                                                                className="text-[8px] bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] px-2 py-1 rounded font-bold hover:bg-[var(--neon-cyan)]/40"
                                                                title="Edit balance"
                                                            >
                                                                ✎
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* ORG RESERVE */}
                                                <div className="flex justify-between items-center border-b border-white/5 pb-2 gap-2">
                                                    <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">ORG RESERVE</span>
                                                    {editingWallet === 'tbl_reserve_bal' ? (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                defaultValue={Number(localStorage.getItem('tbl_reserve_bal') || 0)}
                                                                id="edit_tbl_reserve_bal"
                                                                className="w-24 bg-black/40 border border-[var(--neon-cyan)] rounded px-2 py-1 text-white text-sm font-bold text-right"
                                                                onKeyPress={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const newBalance = Number(document.getElementById('edit_tbl_reserve_bal').value);
                                                                        localStorage.setItem('tbl_reserve_bal', String(newBalance));
                                                                        setEditingWallet(null);
                                                                        setWalletRefresh(prev => prev + 1);
                                                                    }
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newBalance = Number(document.getElementById('edit_tbl_reserve_bal').value);
                                                                    localStorage.setItem('tbl_reserve_bal', String(newBalance));
                                                                    setEditingWallet(null);
                                                                    setWalletRefresh(prev => prev + 1);
                                                                }}
                                                                className="text-[8px] bg-green-500 text-black px-2 py-1 rounded font-bold hover:bg-green-400"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingWallet(null)}
                                                                className="text-[8px] bg-red-500/80 text-white px-2 py-1 rounded font-bold hover:bg-red-500"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-black italic text-sm text-white">৳{Number(localStorage.getItem('tbl_reserve_bal') || 0).toLocaleString()}</span>
                                                            <button
                                                                onClick={() => setEditingWallet('tbl_reserve_bal')}
                                                                className="text-[8px] bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] px-2 py-1 rounded font-bold hover:bg-[var(--neon-cyan)]/40"
                                                                title="Edit balance"
                                                            >
                                                                ✎
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Total Corporate */}
                                                <div className="flex justify-between items-center pt-2 border-t border-[var(--neon-cyan)]/30">
                                                    <span className="text-[10px] font-black text-[var(--neon-cyan)] uppercase">Total Corporate</span>
                                                    <span className="font-black italic text-lg text-[var(--neon-cyan)]">
                                                        ৳{(
                                                            Number(localStorage.getItem('tbl_mgmt_bal') || 0) +
                                                            Number(localStorage.getItem('tbl_mvp_bal') || 0) +
                                                            Number(localStorage.getItem('tbl_reserve_bal') || 0)
                                                        ).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Player Wallets */}
                                        <div className="bg-white/5 border border-[#FBBC04]/20 rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[10px] font-black uppercase tracking-[3px] text-[#FBBC04]">Individual Player Wallets</h3>
                                                <button
                                                    onClick={() => {
                                                        const playerName = prompt('Enter player name:');
                                                        if (playerName) {
                                                            const key = `player_wallet_${playerName.toLowerCase().replace(/\s+/g, '_')}`;
                                                            localStorage.setItem(key, '0');
                                                            setWalletRefresh(prev => prev + 1);
                                                        }
                                                    }}
                                                    className="text-[8px] font-bold uppercase bg-[#FBBC04]/20 px-3 py-1 rounded hover:bg-[#FBBC04]/40 transition-all border border-[#FBBC04]/30"
                                                >
                                                    + Add Player
                                                </button>
                                            </div>
                                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                                {(() => {
                                                    const playerWallets = [];
                                                    let totalPlayerBalance = 0;

                                                    // Scan localStorage for all player wallets
                                                    for (let i = 0; i < localStorage.length; i++) {
                                                        const key = localStorage.key(i);
                                                        if (key && key.startsWith('player_wallet_')) {
                                                            const playerName = key.replace('player_wallet_', '').replace(/_/g, ' ').toUpperCase();
                                                            const balance = Number(localStorage.getItem(key) || 0);
                                                            playerWallets.push({ name: playerName, key: key, balance });
                                                            totalPlayerBalance += balance;
                                                        }
                                                    }

                                                    if (playerWallets.length === 0) {
                                                        return (
                                                            <div className="text-center py-8 opacity-30">
                                                                <p className="text-[9px] font-bold uppercase tracking-widest">No player wallets found</p>
                                                                <p className="text-[8px] text-gray-500 mt-1">Distribute match earnings or add players manually</p>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <>
                                                            {playerWallets.map((wallet, idx) => (
                                                                <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 gap-2">
                                                                    <span className="text-[10px] font-bold text-gray-400 flex-shrink-0">{wallet.name}</span>

                                                                    {editingWallet === wallet.key ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="number"
                                                                                defaultValue={wallet.balance}
                                                                                id={`edit_${wallet.key}`}
                                                                                className="w-24 bg-black/40 border border-[#FBBC04] rounded px-2 py-1 text-white text-sm font-bold text-right"
                                                                                onKeyPress={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        const newBalance = Number(document.getElementById(`edit_${wallet.key}`).value);
                                                                                        localStorage.setItem(wallet.key, String(newBalance));
                                                                                        setEditingWallet(null);
                                                                                        setWalletRefresh(prev => prev + 1);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <button
                                                                                onClick={() => {
                                                                                    const newBalance = Number(document.getElementById(`edit_${wallet.key}`).value);
                                                                                    localStorage.setItem(wallet.key, String(newBalance));
                                                                                    setEditingWallet(null);
                                                                                    setWalletRefresh(prev => prev + 1);
                                                                                }}
                                                                                className="text-[8px] bg-green-500 text-black px-2 py-1 rounded font-bold hover:bg-green-400"
                                                                            >
                                                                                ✓
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setEditingWallet(null)}
                                                                                className="text-[8px] bg-red-500/80 text-white px-2 py-1 rounded font-bold hover:bg-red-500"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-black italic text-sm text-white">৳{wallet.balance.toLocaleString()}</span>
                                                                            <button
                                                                                onClick={() => setEditingWallet(wallet.key)}
                                                                                className="text-[8px] bg-[#FBBC04]/20 text-[#FBBC04] px-2 py-1 rounded font-bold hover:bg-[#FBBC04]/40"
                                                                                title="Edit balance"
                                                                            >
                                                                                ✎
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (window.confirm(`Delete ${wallet.name}'s wallet?`)) {
                                                                                        localStorage.removeItem(wallet.key);
                                                                                        setWalletRefresh(prev => prev + 1);
                                                                                    }
                                                                                }}
                                                                                className="text-[8px] bg-red-500/20 text-red-500 px-2 py-1 rounded font-bold hover:bg-red-500/40"
                                                                                title="Delete wallet"
                                                                            >
                                                                                🗑
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between items-center pt-2 border-t border-[#FBBC04]/30">
                                                                <span className="text-[10px] font-black text-[#FBBC04] uppercase">Total Players</span>
                                                                <span className="font-black italic text-lg text-[#FBBC04]">৳{totalPlayerBalance.toLocaleString()}</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grand Total */}
                                    <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-[var(--neon-cyan)]/10 to-[#FBBC04]/10 border border-white/20 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black uppercase tracking-widest text-white">Grand Total (All Wallets)</span>
                                            <span className="font-black italic text-2xl text-white">
                                                ৳{(() => {
                                                    let total = 0;
                                                    total += Number(localStorage.getItem('tbl_mgmt_bal') || 0);
                                                    total += Number(localStorage.getItem('tbl_mvp_bal') || 0);
                                                    total += Number(localStorage.getItem('tbl_reserve_bal') || 0);

                                                    for (let i = 0; i < localStorage.length; i++) {
                                                        const key = localStorage.key(i);
                                                        if (key && key.startsWith('player_wallet_')) {
                                                            total += Number(localStorage.getItem(key) || 0);
                                                        }
                                                    }

                                                    return total.toLocaleString();
                                                })()}
                                            </span>
                                        </div>
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
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Slot Fee (Deduction)</label>
                                            <input
                                                type="text"
                                                value={matchForm.slotPrize}
                                                onChange={(e) => setMatchForm({ ...matchForm, slotPrize: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">P & M Pool Calculator</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={calcRank}
                                                    onChange={(e) => setCalcRank(e.target.value)}
                                                    className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-2 py-3 text-white text-xs focus:border-[var(--neon-cyan)] outline-none"
                                                >
                                                    <option value="" className="text-black">Select Rank</option>
                                                    {[1, 2, 3, 4].map(n => <option key={n} value={n} className="text-black">#{n} Place</option>)}
                                                </select>
                                                <input
                                                    type="text"
                                                    readOnly
                                                    value={calcRank ? `৳${Math.max(0, (parseInt(String(matchForm[`rank${calcRank}`]).replace(/[৳₹,]/g, '')) || 0) - (parseInt(String(matchForm.slotPrize).replace(/[৳₹,]/g, '')) || 0))}` : ''}
                                                    className="w-1/2 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-[#00ff88] font-bold text-center outline-none"
                                                    placeholder="---"
                                                />
                                            </div>
                                        </div>

                                        <div className="admin-section-divider lg:col-span-2" />

                                        <div className="md:col-span-2">
                                            <h4 className="admin-tactical-header">Match Lifecycle & Timing</h4>
                                        </div>

                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">Start Time</label>
                                            <input
                                                type="datetime-local"
                                                value={matchForm.startTime}
                                                onChange={(e) => setMatchForm({ ...matchForm, startTime: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="admin-input-group">
                                            <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">End Time</label>
                                            <input
                                                type="datetime-local"
                                                value={matchForm.endTime}
                                                onChange={(e) => setMatchForm({ ...matchForm, endTime: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <h4 className="admin-tactical-header">Prize Distribution (Ranks 1-4)</h4>
                                        </div>

                                        {[1, 2, 3, 4].map((num) => (
                                            <div key={num} className="admin-input-group">
                                                <label className="text-gray-400 block mb-2 uppercase text-[10px] tracking-widest font-bold">#{num} Prize Amount</label>
                                                <input
                                                    type="text"
                                                    value={matchForm[`rank${num}`]}
                                                    onChange={(e) => setMatchForm({ ...matchForm, [`rank${num}`]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all font-mono"
                                                    placeholder="e.g. ৳500"
                                                />
                                            </div>
                                        ))}

                                        <div className="admin-section-divider lg:col-span-2" />

                                        <div className="md:col-span-2">
                                            <h4 className="admin-tactical-header">Player Roster & Shares</h4>
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

                                        <div className="admin-section-divider lg:col-span-2" />

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
            </div >
        </div >
    );
};

export default AdminPanel;
