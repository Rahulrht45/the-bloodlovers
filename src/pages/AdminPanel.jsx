import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    LayoutDashboard,
    Users,
    Shield,
    ShieldCheck,
    Trophy,
    LogOut,
    Edit,
    Trash2,
    User,
    TrendingUp,
    Zap,
    Gamepad2,
    Search,
    Check,
    X,
    Wallet,
    Loader2,
    Crosshair,
    Award
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
        management: '20%',
        mvp: '5%',
        player1: '15%', player1Name: 'PLAYER 1',
        player2: '15%', player2Name: 'PLAYER 2',
        player3: '15%', player3Name: 'PLAYER 3',
        player4: '15%', player4Name: 'PLAYER 4',
        player5: '15%', player5Name: 'PLAYER 5',
        rank1: '৳200', rank2: '৳100', rank3: '৳75', rank4: '৳25',
        startTime: toLocalISO(new Date()),
        endTime: toLocalISO(new Date(Date.now() + 3600000))
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [isAddingMatch, setIsAddingMatch] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [calcRank, setCalcRank] = useState('');

    // --- PLAYER TAB STATES ---
    const [isAddingPlayer, setIsAddingPlayer] = useState(false);
    const [newPlayerForm, setNewPlayerForm] = useState({
        ign: '',
        in_game_uid: '',
        team: 'THE BLOODLOVERS',
        role: 'Assaulter',
        avatar: '',
        userId: ''
    });
    const [playerSearch, setPlayerSearch] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

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
                management: '20%',
                mvp: '5%',
                player1: '15%', player1Name: 'PLAYER 1',
                player2: '15%', player2Name: 'PLAYER 2',
                player3: '15%', player3Name: 'PLAYER 3',
                player4: '15%', player4Name: 'PLAYER 4',
                player5: '15%', player5Name: 'PLAYER 5',
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

            // --- NEW: FETCH DB USERS ---
            await fetchDbUsers();
        } catch (err) {
            console.error('Error fetching admin data:', err);
        }
    }, []);

    const [dbUsers, setDbUsers] = useState([]);

    const fetchDbUsers = async () => {
        try {
            // 1. Fetch Players (Source of Truth for Roster)
            const { data: playersData, error: playersError } = await supabase
                .from('players')
                .select('*');

            if (playersError) throw playersError;

            // 2. Fetch ALL Database Users (Source of Truth for Funds)
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*');

            if (usersError) {
                if (usersError.code === 'PGRST116' || usersError.message?.includes('not found')) {
                    console.warn("Public users table not found.");
                } else {
                    throw usersError;
                }
            }

            // 3. Create map of Roster Info
            const rosterMap = {};
            if (playersData) {
                playersData.forEach(p => {
                    if (p.user_id) rosterMap[p.user_id] = p;
                });
            }

            // 4. Map EVERY database user to a display object
            const allDbUsers = (usersData || []).map(u => {
                const rosterInfo = rosterMap[u.id];
                // Fallback: If no roster link yet, try matching by name (IGN)
                let matchedRoster = rosterInfo;
                if (!matchedRoster && u.name) {
                    matchedRoster = playersData.find(p => p.ign?.toLowerCase() === u.name?.toLowerCase());
                }

                return {
                    id: u.id,
                    ign: matchedRoster?.ign || u.name || 'System User',
                    displayName: matchedRoster?.ign || u.name || 'Anonymous',
                    in_game_uid: matchedRoster?.in_game_uid || '---',
                    global_credit: Number(u.global_credit || 0),
                    avatar: matchedRoster?.avatar,
                    team: matchedRoster?.team || 'N/A',
                    isRostered: !!matchedRoster
                };
            });

            // 5. Build Final Managed List (Uniquely merging Users + Roster)
            setDbUsers(allDbUsers.sort((a, b) => (a.ign || '').localeCompare(b.ign || '')));
        } catch (err) {
            console.error("Error fetching balance data:", err);
        }
    };

    const handleUpdateDbBalance = async (userId) => {
        const input = document.getElementById(`edit_db_${userId}`);
        if (!input) return;
        const newBal = parseFloat(input.value);
        if (isNaN(newBal)) return;

        try {
            // 1. Primary Method: Use Secure RPC
            const { error: rpcError } = await supabase.rpc('admin_set_user_balance', {
                p_user_id: userId,
                p_new_balance: newBal
            });

            if (!rpcError) {
                alert('Balance SET successfully via RPC.');
            } else {
                console.warn('RPC failed, attempting direct table update fallback...', rpcError);

                // 2. Fallback: Direct table update (only works if RLS allows or bypass is on)
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ global_credit: newBal })
                    .eq('id', userId);

                if (updateError) throw updateError;
                alert('Balance updated via direct table fallback.');
            }

            fetchDbUsers();
            setEditingWallet(null);
        } catch (err) {
            console.error('Error updating balance:', err);
            alert('CRITICAL: Balance update failed. Ensure you have run the provided Supabase SQL script! Error: ' + err.message);
        }
    };

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

        if (
            (trimmedUsername === "Sadaf" && trimmedPassword === "Sadaf123") ||
            (trimmedUsername === "rahul" && trimmedPassword === "Rahul123")
        ) {
            setIsLoggedIn(true);
        } else {
            alert("Wrong Username or Password");
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
    };

    const handleSaveNewPlayer = async (e) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase
                .from('players')
                .insert([{
                    ign: newPlayerForm.ign,
                    in_game_uid: newPlayerForm.in_game_uid,
                    team: newPlayerForm.team,
                    role: newPlayerForm.role,
                    avatar: newPlayerForm.avatar,
                    user_id: newPlayerForm.userId || null,
                    kills: 0,
                    wins: 0,
                    mvp_points: 0,
                    assists: 0,
                    damage: 0,
                    survival_time: '00:00'
                }])
                .select();

            if (error) throw error;

            setPlayers([...players, data[0]]);
            setStats(prev => ({ ...prev, players: prev.players + 1 }));
            setIsAddingPlayer(false);
            setNewPlayerForm({
                ign: '',
                in_game_uid: '',
                team: 'THE BLOODLOVERS',
                role: 'Assaulter',
                avatar: '',
                userId: ''
            });
            alert('New player recruited successfully!');
        } catch (err) {
            console.error('Error adding player:', err);
            alert('Failed to add player: ' + err.message);
        }
    };

    const filteredPlayers = players.filter(p => {
        const matchesSearch = !playerSearch ||
            (p.ign || '').toLowerCase().includes(playerSearch.toLowerCase()) ||
            (p.team || '').toLowerCase().includes(playerSearch.toLowerCase()) ||
            (p.role || '').toLowerCase().includes(playerSearch.toLowerCase());

        const matchesTeam = !teamFilter || p.team === teamFilter;
        const matchesRole = !roleFilter || p.role === roleFilter;

        return matchesSearch && matchesTeam && matchesRole;
    });

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
            in_game_uid: player.in_game_uid || '',
            kills: player.kills || 0,
            wins: player.wins || 0,
            mvp_points: player.mvp_points || 0,
            assists: player.assists || 0,
            damage: player.damage || 0,
            survival_time: player.survival_time || '00:00'
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
                    in_game_uid: editValues.in_game_uid,
                    kills: editValues.kills,
                    wins: editValues.wins,
                    mvp_points: editValues.mvp_points,
                    assists: editValues.assists,
                    damage: editValues.damage,
                    survival_time: editValues.survival_time
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

    // --- QUICK ACTION HANDLERS ---
    const handleQuickStatUpdate = async (player, type, amount = 1) => {
        const isKill = type === 'KILL';
        const field = isKill ? 'kills' : 'mvp_points';
        const currentValue = player[field] || 0;
        const newValue = currentValue + amount;

        // Optimistic Update
        setPlayers(prev => prev.map(p =>
            p.id === player.id ? { ...p, [field]: newValue } : p
        ));

        // DB Update
        try {
            const { error } = await supabase
                .from('players')
                .update({ [field]: newValue })
                .eq('id', player.id);

            if (error) throw error;
        } catch (err) {
            console.error(`Error updating ${type}:`, err);
            // Revert on error
            setPlayers(prev => prev.map(p =>
                p.id === player.id ? { ...p, [field]: currentValue } : p
            ));
            alert(`Failed to update ${type}. Reverting change.`);
        }
    };

    // Right-click handler for custom amount
    const handleCustomAdd = (e, player, type) => {
        if (e && e.preventDefault) e.preventDefault(); // Block default context menu
        const input = prompt(`Enter number of ${type === 'KILL' ? 'Kills' : 'MVP Points'} to ADD to ${player.ign}:`);
        if (!input) return;

        const amount = parseInt(input);
        if (!isNaN(amount) && amount !== 0) {
            handleQuickStatUpdate(player, type, amount);
        }
    };

    // --- MOBILE LONG PRESS LOGIC ---
    const longPressTimer = useRef(null);
    const isLongPress = useRef(false);

    const handleTouchStart = (player, type) => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            // Trigger haptic feedback if available
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
            handleCustomAdd(null, player, type);
        }, 600); // 600ms hold time
    };

    const handleTouchEnd = (e, player, type) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        // If it was a long press, prevent the default click
        if (isLongPress.current) {
            if (e.cancelable) e.preventDefault();
        }
        // Note: We don't manually trigger click here, we let the native onClick fire if not long press
    };

    const handleTouchMove = () => {
        // Cancel long press if finger moves (scroll)
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
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
                                    onClick={() => { setActiveTab('Dashboard'); setSidebarOpen(false); }}
                                >
                                    <LayoutDashboard size={20} /> Dashboard
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-link ${activeTab === 'Players' ? 'active' : ''}`}
                                    onClick={() => { setActiveTab('Players'); setSidebarOpen(false); }}
                                >
                                    <Users size={20} /> Players
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-link ${activeTab === 'Teams' ? 'active' : ''}`}
                                    onClick={() => { setActiveTab('Teams'); setSidebarOpen(false); }}
                                >
                                    <Shield size={20} /> Teams
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-link ${activeTab === 'Matches' ? 'active' : ''}`}
                                    onClick={() => { setActiveTab('Matches'); setSidebarOpen(false); }}
                                >
                                    <Gamepad2 size={20} /> Matches
                                </button>
                            </li>
                            <li>
                                <button
                                    className={`nav-link ${activeTab === 'Wallets' ? 'active' : ''}`}
                                    onClick={() => { setActiveTab('Wallets'); setSidebarOpen(false); }}
                                >
                                    <Wallet size={20} /> Wallets
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
                        <div className="admin-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="admin-card">
                                <div className="admin-card-icon"><Users size={24} /></div>
                                <div className="admin-card-info">
                                    <h3>Total Players</h3>
                                    <div className="card-value">{players.length}</div>
                                </div>
                            </div>
                            <div className="admin-card">
                                <div className="admin-card-icon" style={{ background: 'rgba(0, 240, 255, 0.15)', color: 'var(--neon-cyan)' }}>
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="admin-card-info">
                                    <h3>Total Corporate Funds</h3>
                                    <div className="card-value text-[var(--neon-cyan)] italic">
                                        ৳{(() => {
                                            const ids = [
                                                '00000000-0000-0000-0000-000000000001', // Mgmt
                                                '00000000-0000-0000-0000-000000000002', // MVP
                                                '00000000-0000-0000-0000-000000000003'  // Reserve
                                            ];
                                            return dbUsers
                                                .filter(u => ids.includes(u.id))
                                                .reduce((sum, u) => sum + Number(u.global_credit || 0), 0)
                                                .toLocaleString();
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="admin-card">
                                <div className="admin-card-icon" style={{ background: 'rgba(251, 188, 4, 0.15)', color: '#FBBC04' }}>
                                    <Wallet size={24} />
                                </div>
                                <div className="admin-card-info">
                                    <h3>Total Player Funds</h3>
                                    <div className="card-value text-[#FBBC04] italic">
                                        ৳{(() => {
                                            const corpIds = [
                                                '00000000-0000-0000-0000-000000000001',
                                                '00000000-0000-0000-0000-000000000002',
                                                '00000000-0000-0000-0000-000000000003'
                                            ];
                                            return dbUsers
                                                .filter(u => !corpIds.includes(u.id))
                                                .reduce((sum, u) => sum + Number(u.global_credit || 0), 0)
                                                .toLocaleString();
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="admin-card">
                                <div className="admin-card-icon"><TrendingUp size={24} /></div>
                                <div className="admin-card-info">
                                    <h3>Active Matches</h3>
                                    <div className="card-value">{allMatches.length}</div>
                                </div>
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        {activeTab === 'Dashboard' && (
                            <>
                                {/* Activity Overview & Recent Actions */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                    {/* Activity Chart - Takes 2 columns */}
                                    <div className="lg:col-span-2 admin-content-box">
                                        <h2>Activity Overview</h2>
                                        <div className="activity-chart">
                                            {[65, 85, 55, 95, 75, 60, 80].map((height, idx) => (
                                                <div
                                                    key={idx}
                                                    className="chart-bar"
                                                    style={{ height: `${height}%` }}
                                                    title={`Day ${idx + 1}: ${height}%`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Actions - Takes 1 column */}
                                    <div className="admin-content-box">
                                        <h2>Recent Actions</h2>
                                        <div className="recent-actions">
                                            <div className="action-item">
                                                <div className="action-dot blue"></div>
                                                <div className="action-text">New player added to roster</div>
                                                <div className="action-time">2m ago</div>
                                            </div>
                                            <div className="action-item">
                                                <div className="action-dot green"></div>
                                                <div className="action-text">Match configuration updated</div>
                                                <div className="action-time">15m ago</div>
                                            </div>
                                            <div className="action-item">
                                                <div className="action-dot orange"></div>
                                                <div className="action-text">Wallet distribution completed</div>
                                                <div className="action-time">1h ago</div>
                                            </div>
                                            <div className="action-item">
                                                <div className="action-dot red"></div>
                                                <div className="action-text">System backup completed</div>
                                                <div className="action-time">3h ago</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* System Status & Quick Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="admin-content-box">
                                        <h2>System Status</h2>
                                        <div className="space-y-4">
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
                                                <span className="text-[#5B8DEF] font-bold">SUPER OPERATOR</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 uppercase text-xs">Total In-Game Wallets</span>
                                                <span className="text-white font-bold">{dbUsers.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="admin-content-box">
                                        <h2>Quick Actions</h2>
                                        <div className="grid grid-cols-2 gap-4">
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
                            </>
                        )}

                        {activeTab === 'Players' && (
                            <>
                                {/* Header with Search and Actions */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-1">Player Roster</h1>
                                        <p className="text-sm text-gray-400">Manage your team members and their statistics</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAddingPlayer(!isAddingPlayer)}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {isAddingPlayer ? <X size={16} /> : <Users size={16} />}
                                        {isAddingPlayer ? 'Cancel' : 'Add New Player'}
                                    </button>
                                </div>

                                {isAddingPlayer && (
                                    <div className="admin-content-box mb-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
                                        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                                            <Users className="text-blue-400" />
                                            Recruit New Field Agent
                                        </h2>
                                        <form onSubmit={handleSaveNewPlayer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">In-Game Name (IGN)</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={newPlayerForm.ign}
                                                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, ign: e.target.value })}
                                                    placeholder="Enter Agent IGN"
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">In-Game UID</label>
                                                <input
                                                    type="text"
                                                    value={newPlayerForm.in_game_uid}
                                                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, in_game_uid: e.target.value })}
                                                    placeholder="Enter 10-digit UID"
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Assigned Team</label>
                                                <input
                                                    type="text"
                                                    value={newPlayerForm.team}
                                                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, team: e.target.value })}
                                                    placeholder="e.g. THE BLOODLOVERS"
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Combat Role</label>
                                                <select
                                                    value={newPlayerForm.role}
                                                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, role: e.target.value })}
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                                                >
                                                    <option value="Assaulter" className="bg-[#0b101b]">Assaulter</option>
                                                    <option value="Support" className="bg-[#0b101b]">Support</option>
                                                    <option value="Sniper" className="bg-[#0b101b]">Sniper</option>
                                                    <option value="IGL" className="bg-[#0b101b]">IGL</option>
                                                    <option value="Scout" className="bg-[#0b101b]">Scout</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Avatar URL (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={newPlayerForm.avatar}
                                                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, avatar: e.target.value })}
                                                    placeholder="https://..."
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">User UUID (Auth Link)</label>
                                                <input
                                                    type="text"
                                                    value={newPlayerForm.userId}
                                                    onChange={(e) => setNewPlayerForm({ ...newPlayerForm, userId: e.target.value })}
                                                    placeholder="Link to Auth User ID"
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-2 lg:col-span-3">
                                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-lg uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,108,255,0.3)]">
                                                    Deploy Agent to Roster
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {/* Search and Filter Bar */}
                                <div className="admin-content-box mb-6">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 search-bar">
                                            <Search className="search-icon" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search players by name, team, or role..."
                                                className="w-full"
                                                value={playerSearch}
                                                onChange={(e) => setPlayerSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <select
                                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-blue-500"
                                                value={teamFilter}
                                                onChange={(e) => setTeamFilter(e.target.value)}
                                            >
                                                <option value="" className="bg-[#0b101b]">All Teams</option>
                                                <option value="THE BLOODLOVERS" className="bg-[#0b101b]">TBL</option>
                                                <option value="BLOODLOVERS" className="bg-[#0b101b]">Bloodlovers (Alt)</option>
                                                <option value="FREE AGENT" className="bg-[#0b101b]">Free Agent</option>
                                            </select>
                                            <select
                                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-blue-500"
                                                value={roleFilter}
                                                onChange={(e) => setRoleFilter(e.target.value)}
                                            >
                                                <option value="" className="bg-[#0b101b]">All Roles</option>
                                                <option value="Assaulter" className="bg-[#0b101b]">Assaulter</option>
                                                <option value="Support" className="bg-[#0b101b]">Support</option>
                                                <option value="Sniper" className="bg-[#0b101b]">Sniper</option>
                                                <option value="IGL" className="bg-[#0b101b]">IGL</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>



                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredPlayers.map((player) => (
                                        editingId === player.id ? (
                                            /* EDIT MODE CARD */
                                            <div key={player.id} className="relative group rounded-[20px] p-[20px] text-white"
                                                style={{
                                                    background: 'linear-gradient(180deg, #0f1c33, #060c18)',
                                                    boxShadow: '0 0 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)'
                                                }}
                                            >
                                                <div className="flex flex-col gap-3 h-full">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-sm font-bold text-[#6ea8ff] uppercase tracking-wider">Edit Player</h3>
                                                        <button onClick={handleCancelEdit} className="text-gray-500 hover:text-white"><X size={16} /></button>
                                                    </div>

                                                    <div className="space-y-3 flex-1">
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">IGN</label>
                                                            <input
                                                                type="text"
                                                                value={editValues.ign}
                                                                onChange={(e) => setEditValues({ ...editValues, ign: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-[#3b6cff] outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">UID</label>
                                                            <input
                                                                type="text"
                                                                value={editValues.in_game_uid}
                                                                onChange={(e) => setEditValues({ ...editValues, in_game_uid: e.target.value })}
                                                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:border-[#3b6cff] outline-none"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Kills</label>
                                                                <input
                                                                    type="number"
                                                                    value={editValues.kills}
                                                                    onChange={(e) => setEditValues({ ...editValues, kills: parseInt(e.target.value) || 0 })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white text-center focus:border-[#3b6cff] outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Wins</label>
                                                                <input
                                                                    type="number"
                                                                    value={editValues.wins}
                                                                    onChange={(e) => setEditValues({ ...editValues, wins: parseInt(e.target.value) || 0 })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white text-center focus:border-[#3b6cff] outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">MVP</label>
                                                                <input
                                                                    type="number"
                                                                    value={editValues.mvp_points}
                                                                    onChange={(e) => setEditValues({ ...editValues, mvp_points: parseInt(e.target.value) || 0 })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-center text-[#f5c451] focus:border-[#f5c451] outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Assists</label>
                                                                <input
                                                                    type="number"
                                                                    value={editValues.assists}
                                                                    onChange={(e) => setEditValues({ ...editValues, assists: parseInt(e.target.value) || 0 })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white text-center focus:border-[#3b6cff] outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Damage</label>
                                                                <input
                                                                    type="number"
                                                                    value={editValues.damage}
                                                                    onChange={(e) => setEditValues({ ...editValues, damage: parseFloat(e.target.value) || 0 })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white text-center focus:border-[#3b6cff] outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Time</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="00:00"
                                                                    value={editValues.survival_time}
                                                                    onChange={(e) => setEditValues({ ...editValues, survival_time: e.target.value })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white text-center focus:border-[#3b6cff] outline-none"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                                        <button onClick={() => handleSaveEdit(player.id)} className="bg-[#3b6cff] hover:bg-blue-600 text-white font-bold py-2 rounded text-xs uppercase tracking-wider transition-colors">
                                                            Save Changes
                                                        </button>
                                                        <button onClick={handleCancelEdit} className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold py-2 rounded text-xs uppercase tracking-wider transition-colors">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* VIEW MODE CARD */
                                            <div key={player.id} className="relative group rounded-[20px] p-[20px] text-white transition-all duration-300 hover:-translate-y-1"
                                                style={{
                                                    background: 'linear-gradient(180deg, #0f1c33, #060c18)',
                                                    boxShadow: '0 0 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)'
                                                }}
                                            >

                                                {/* TOP ACTIONS (Edit/Delete - Absolute Positioned) */}
                                                <div className="absolute top-3 right-3 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleEditPlayer(player)} className="h-7 w-7 rounded-lg bg-white/5 hover:bg-blue-500 hover:text-white flex items-center justify-center backdrop-blur text-gray-400 transition-all border border-white/5">
                                                        <Edit size={12} />
                                                    </button>
                                                    <button onClick={() => handleDeletePlayer(player.id)} className="h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white flex items-center justify-center backdrop-blur text-red-500 transition-all border border-red-500/20">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>

                                                {/* HEADER */}
                                                <div className="flex gap-4 items-center mb-6">
                                                    {/* AVATAR */}
                                                    <div className="relative w-[84px] h-[84px] rounded-full overflow-hidden shrink-0 border-[3px] border-[#3b6cff] shadow-[0_0_15px_rgba(59,108,255,0.4)]">
                                                        <img
                                                            src={player.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${player.ign}`}
                                                            alt={player.ign}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* INFO */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[10px] font-bold tracking-[1px] text-[#6ea8ff] uppercase mb-1 flex items-center gap-1">
                                                            <Shield size={10} />
                                                            {player.team || 'FREE AGENT'} • {player.role || 'PLAYER'}
                                                        </div>
                                                        <h3 className="text-[24px] font-bold text-white leading-tight truncate mb-1" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
                                                            {player.ign}
                                                        </h3>
                                                        <div className="text-[10px] text-[#8a9bb5] font-mono flex flex-wrap gap-2">
                                                            <span>UID: {player.in_game_uid || '---'}</span>
                                                            <span className="opacity-50">|</span>
                                                            <span>ID: #{player.id}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* STATS GRID (6 Grid Layout) */}
                                                <div className="grid grid-cols-3 gap-3 mb-5">

                                                    {/* KILLS */}
                                                    <div className="bg-white/[0.04] rounded-[14px] p-2.5 text-center relative overflow-hidden group/stat border border-white/5">
                                                        <div className="text-sm mb-1">🔫</div>
                                                        <div className="text-[9px] text-[#8fa3bf] tracking-widest font-bold">KILLS</div>
                                                        <div className="text-[18px] font-bold text-white mt-0.5">
                                                            {player.kills || 0}
                                                        </div>
                                                    </div>

                                                    {/* ASSISTS */}
                                                    <div className="bg-white/[0.04] rounded-[14px] p-2.5 text-center relative overflow-hidden group/stat border border-white/5">
                                                        <div className="text-sm mb-1">🤝</div>
                                                        <div className="text-[9px] text-[#8fa3bf] tracking-widest font-bold">ASSISTS</div>
                                                        <div className="text-[18px] font-bold text-white mt-0.5">
                                                            {player.assists || 0}
                                                        </div>
                                                    </div>

                                                    {/* DAMAGE */}
                                                    <div className="bg-white/[0.04] rounded-[14px] p-2.5 text-center relative overflow-hidden group/stat border border-white/5">
                                                        <div className="text-sm mb-1">💥</div>
                                                        <div className="text-[9px] text-[#8fa3bf] tracking-widest font-bold">DAMAGE</div>
                                                        <div className="text-[18px] font-bold text-[#ff4d4d] mt-0.5 text-shadow-[0_0_10px_rgba(255,77,77,0.4)]">
                                                            {player.damage || '0'}
                                                        </div>
                                                    </div>

                                                    {/* WINS */}
                                                    <div className="bg-white/[0.04] rounded-[14px] p-2.5 text-center relative overflow-hidden group/stat border border-white/5">
                                                        <div className="text-sm mb-1">🏆</div>
                                                        <div className="text-[9px] text-[#8fa3bf] tracking-widest font-bold">WINS</div>
                                                        <div className="text-[18px] font-bold text-white mt-0.5">
                                                            {player.wins || 0}
                                                        </div>
                                                    </div>

                                                    {/* SURVIVAL */}
                                                    <div className="bg-white/[0.04] rounded-[14px] p-2.5 text-center relative overflow-hidden group/stat border border-white/5">
                                                        <div className="text-sm mb-1">⏱</div>
                                                        <div className="text-[9px] text-[#8fa3bf] tracking-widest font-bold">TIME</div>
                                                        <div className="text-[16px] font-bold text-[#4dffb8] mt-1 shrink-0">
                                                            {player.survival_time || '00:00'}
                                                        </div>
                                                    </div>

                                                    {/* MVP - Special Styling */}
                                                    <div className="rounded-[14px] p-2.5 text-center relative overflow-hidden group/stat border border-[#f5c451]/20"
                                                        style={{
                                                            background: 'linear-gradient(180deg, rgba(58, 43, 0, 0.6), rgba(26, 18, 0, 0.6))',
                                                            boxShadow: '0 0 15px rgba(245, 196, 81, 0.1)'
                                                        }}
                                                    >
                                                        <div className="text-sm mb-1">⭐</div>
                                                        <div className="text-[9px] text-[#f5c451] tracking-widest font-bold opacity-80">MVP</div>
                                                        <div className="text-[18px] font-bold text-[#f5c451] mt-0.5 drop-shadow-[0_0_10px_rgba(245,196,81,0.6)]">
                                                            {player.mvp_points || 0}
                                                        </div>
                                                    </div>

                                                </div>

                                                {/* ACTION FOOTER */}
                                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                                                    <button
                                                        onClick={(e) => {
                                                            if (!isLongPress.current) handleQuickStatUpdate(player, 'KILL', 1);
                                                        }}
                                                        onContextMenu={(e) => handleCustomAdd(e, player, 'KILL')}
                                                        onTouchStart={() => handleTouchStart(player, 'KILL')}
                                                        onTouchEnd={(e) => handleTouchEnd(e, player, 'KILL')}
                                                        onTouchMove={handleTouchMove}
                                                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 text-[10px] font-bold uppercase tracking-wider transition-all select-none border border-red-500/20"
                                                    >
                                                        <Crosshair size={12} /> + Kill
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            if (!isLongPress.current) handleQuickStatUpdate(player, 'MVP', 1);
                                                        }}
                                                        onContextMenu={(e) => handleCustomAdd(e, player, 'MVP')}
                                                        onTouchStart={() => handleTouchStart(player, 'MVP')}
                                                        onTouchEnd={(e) => handleTouchEnd(e, player, 'MVP')}
                                                        onTouchMove={handleTouchMove}
                                                        className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500 hover:text-black text-yellow-500 text-[10px] font-bold uppercase tracking-wider transition-all select-none border border-yellow-500/20"
                                                    >
                                                        <Award size={12} /> + MVP
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>

                                {/* Empty State */}
                                {filteredPlayers.length === 0 && (
                                    <div className="admin-content-box text-center py-16">
                                        <Users size={48} className="mx-auto mb-4 text-gray-600" />
                                        <h3 className="text-xl font-bold text-white mb-2">
                                            {playerSearch || teamFilter || roleFilter ? 'No Matches Found' : 'No Players Found'}
                                        </h3>
                                        <p className="text-gray-400 mb-6">
                                            {playerSearch || teamFilter || roleFilter
                                                ? 'Try adjusting your filters or search terms'
                                                : 'Get started by adding your first player to the roster'}
                                        </p>
                                        {!playerSearch && !teamFilter && !roleFilter && (
                                            <button
                                                onClick={() => setIsAddingPlayer(true)}
                                                className="btn-primary"
                                            >
                                                Add Your First Player
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
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
                                                    <div className="relative">
                                                        <select
                                                            value={matchForm[`player${num}Name`]}
                                                            onChange={(e) => setMatchForm({ ...matchForm, [`player${num}Name`]: e.target.value })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[var(--neon-cyan)] outline-none transition-all appearance-none cursor-pointer"
                                                        >
                                                            <option value="" className="text-gray-500 bg-[#0b101b]">Select Player...</option>
                                                            {players.map(p => (
                                                                <option key={p.id} value={p.ign} className="text-white bg-[#0b101b]">{p.ign}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 text-[10px]">
                                                            ▼
                                                        </div>
                                                    </div>
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

                        {/* WALLETS TAB */}
                        {activeTab === 'Wallets' && (
                            <>
                                {/* Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-1">Wallet Management</h1>
                                        <p className="text-sm text-gray-400">Monitor and manage all wallet balances</p>
                                    </div>
                                </div>

                                {/* Corporate Wallets Section */}
                                <div className="admin-content-box mb-6">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Shield size={20} className="text-[var(--neon-cyan)]" />
                                        Corporate Wallets (TBL HUB)
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* TBL Management */}
                                        {/* TBL Management */}
                                        <div className="admin-card">
                                            <div className="admin-card-icon" style={{ background: 'rgba(0, 240, 255, 0.15)', color: 'var(--neon-cyan)' }}>
                                                <Shield size={24} />
                                            </div>
                                            <div className="admin-card-info">
                                                <h3>TBL Management</h3>
                                                <div className="card-value">
                                                    ৳{(dbUsers.find(u => u.id === '00000000-0000-0000-0000-000000000001')?.global_credit || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* MVP Bonus */}
                                        <div className="admin-card">
                                            <div className="admin-card-icon" style={{ background: 'rgba(251, 188, 4, 0.15)', color: '#FBBC04' }}>
                                                <Trophy size={24} />
                                            </div>
                                            <div className="admin-card-info">
                                                <h3>MVP Bonus</h3>
                                                <div className="card-value">
                                                    ৳{(dbUsers.find(u => u.id === '00000000-0000-0000-0000-000000000002')?.global_credit || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Org Reserve */}
                                        <div className="admin-card">
                                            <div className="admin-card-icon" style={{ background: 'rgba(176, 38, 255, 0.15)', color: 'var(--neon-purple)' }}>
                                                <Wallet size={24} />
                                            </div>
                                            <div className="admin-card-info">
                                                <h3>Org Reserve</h3>
                                                <div className="card-value">
                                                    ৳{(dbUsers.find(u => u.id === '00000000-0000-0000-0000-000000000003')?.global_credit || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Player Wallets (REAL DATABASE) */}
                                <div className="admin-content-box">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <Users size={20} className="text-[#FBBC04]" />
                                            Player Wallets (Secure Database)
                                        </h2>
                                        <div className="text-sm text-gray-400">
                                            Total Users: <span className="text-white font-bold">{dbUsers.length}</span>
                                        </div>
                                    </div>

                                    {/* DB Users Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {dbUsers.length === 0 ? (
                                            <div className="col-span-full text-center py-16">
                                                <Loader2 size={48} className="mx-auto mb-4 text-[var(--neon-cyan)] animate-spin" />
                                                <h3 className="text-xl font-bold text-white mb-2">Syncing with Central Bank...</h3>
                                            </div>
                                        ) : (
                                            dbUsers.map((user) => (
                                                <div key={user.id} className="border border-white/10 rounded-lg p-4 bg-white/5 hover:bg-white/8 transition-all">
                                                    <div className="flex items-start gap-3 mb-4">
                                                        {/* Avatar */}
                                                        <div className="w-12 h-12 rounded-full border-2 border-[var(--neon-cyan)]/30 overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={user.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.ign}`}
                                                                alt={user.ign}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-base font-bold text-white truncate mb-1">
                                                                {user.ign}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">UID:</span>
                                                                <span className="text-xs text-[#00ff88] font-mono font-semibold">{user.in_game_uid}</span>
                                                                <span className="text-[9px] text-gray-600">|</span>
                                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">TEAM:</span>
                                                                <span className="text-xs text-[#FBBC04] font-mono font-semibold truncate max-w-[60px]">{user.team || 'None'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Balance */}
                                                    <div className="bg-gradient-to-r from-[#FBBC04]/10 to-[#F59E0B]/10 border border-[#FBBC04]/20 rounded-lg p-3 mb-3">
                                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">MY BALANCE</div>
                                                        {editingWallet === `db_${user.id}` ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    defaultValue={user.global_credit}
                                                                    id={`edit_db_${user.id}`}
                                                                    className="flex-1 bg-black/40 border border-[#FBBC04] rounded px-2 py-1 text-white text-lg font-bold"
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === 'Enter') handleUpdateDbBalance(user.id);
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-2xl font-black italic text-[#FBBC04]">
                                                                ৳{Number(user.global_credit).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        {editingWallet === `db_${user.id}` ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleUpdateDbBalance(user.id)}
                                                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
                                                                >
                                                                    ✓ Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingWallet(null)}
                                                                    className="flex-1 bg-red-500/80 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
                                                                >
                                                                    ✕ Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => setEditingWallet(`db_${user.id}`)}
                                                                className="w-full bg-[#FBBC04]/20 hover:bg-[#FBBC04]/40 text-[#FBBC04] px-3 py-2 rounded-lg text-xs font-bold transition-all"
                                                            >
                                                                ✎ Set Balance
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Grand Total DB */}
                                    <div className="mt-6 p-4 bg-gradient-to-r from-[var(--neon-cyan)]/10 to-[#FBBC04]/10 border border-white/20 rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black uppercase tracking-widest text-white">Total Player Funds (DB)</span>
                                            <span className="font-black italic text-2xl text-[#FBBC04]">
                                                ৳{dbUsers.reduce((sum, u) => sum + Number(u.global_credit ?? u.balance ?? 0), 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Overall Summary */}
                                <div className="admin-content-box bg-gradient-to-br from-[var(--neon-cyan)]/5 to-[var(--neon-purple)]/5 border-[var(--neon-cyan)]/30">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <TrendingUp size={20} className="text-[var(--neon-cyan)]" />
                                        Overall Summary
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Corporate Funds</div>
                                            <div className="text-3xl font-black italic text-[var(--neon-cyan)]">
                                                ৳{(() => {
                                                    const ids = [
                                                        '00000000-0000-0000-0000-000000000001', // Mgmt
                                                        '00000000-0000-0000-0000-000000000002', // MVP
                                                        '00000000-0000-0000-0000-000000000003'  // Reserve
                                                    ];
                                                    const total = dbUsers
                                                        .filter(u => ids.includes(u.id))
                                                        .reduce((sum, u) => sum + Number(u.global_credit || 0), 0);
                                                    return total.toLocaleString();
                                                })()}
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-lg p-4">
                                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Grand Total (All Wallets)</div>
                                            <div className="text-3xl font-black italic text-white">
                                                ৳{dbUsers.reduce((sum, u) => sum + Number(u.global_credit || 0), 0).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AdminPanel;
