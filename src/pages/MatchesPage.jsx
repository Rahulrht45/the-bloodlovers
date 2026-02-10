import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, Users, Award, Target, Gamepad2, Clock, Wallet, Activity, Hash, ArrowUpRight, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../supabase';
import bgImage from '../assets/freefire_bg.jpg';
import './MatchesPage.css';

const MatchesPage = () => {
    const [matches, setMatches] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);
    const [activeRosterId, setActiveRosterId] = useState(null);
    const [activePrizeMatchId, setActivePrizeMatchId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [user, setUser] = useState(null);
    const [playerUids, setPlayerUids] = useState({});
    const [playerFullMap, setPlayerFullMap] = useState({}); // Stores full player info including user_id
    const [currentUserUid, setCurrentUserUid] = useState(null);

    // --- FETCH USER & BALANCE ---
    useEffect(() => {
        const getAuth = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            setUser(u);

            if (u) {
                // 1. Get Player Profile
                const { data: playerData } = await supabase
                    .from('players')
                    .select('in_game_uid')
                    .eq('user_id', u.id)
                    .single();

                if (playerData) {
                    setCurrentUserUid(playerData.in_game_uid);
                }

                // 2. Fetch REAL balance from 'users' table using ID (The Secure Way)
                const { data: userData } = await supabase
                    .from('users')
                    .select('global_credit')
                    .eq('id', u.id)
                    .single();

                if (userData) {
                    const balance = Number(userData.global_credit || 0);
                    setWalletBalance(balance);

                    // Sync localStorage only for backward compatibility, but DB is primary
                    localStorage.setItem('bloods_wallet_balance', String(balance));
                }
            }
        };
        getAuth();

        // Listen for direct wallet updates
        const channel = supabase
            .channel('wallet-sync')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'users'
            }, async (payload) => {
                const { data: { user: cur } } = await supabase.auth.getUser();
                if (cur && payload.new.id === cur.id) {
                    setWalletBalance(Number(payload.new.global_credit || 0));
                    localStorage.setItem('bloods_wallet_balance', String(payload.new.global_credit || 0));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // --- FETCH PLAYER UIDs ---
    useEffect(() => {
        const fetchPlayerUids = async () => {
            try {
                const { data, error } = await supabase
                    .from('players')
                    .select('ign, in_game_uid, user_id');

                if (error) {
                    console.error('Error fetching player UIDs:', error);
                    return;
                }

                // Create a map of IGN -> User Info
                const uidMap = {};
                const fullMap = {};
                data.forEach(player => {
                    if (player.ign) {
                        const key = player.ign.trim().toUpperCase();
                        uidMap[key] = player.in_game_uid || 'N/A';
                        fullMap[key] = {
                            ign: player.ign,
                            uid: player.in_game_uid,
                            userId: player.user_id
                        };
                    }
                });
                setPlayerUids(uidMap);
                setPlayerFullMap(fullMap);
            } catch (err) {
                console.error('Failed to fetch player UIDs:', err);
            }
        };
        fetchPlayerUids();
    }, []);

    // --- REFRESH DATA ---
    const fetchMatchSettings = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchMatchSettings();

        const subscription = supabase
            .channel('match_settings_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'match_settings' }, () => {
                fetchMatchSettings();
            })
            .subscribe();

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            subscription.unsubscribe();
            clearInterval(timer);
        };
    }, [fetchMatchSettings]);

    const getMatchState = (match) => {
        if (!match.start_at || !match.end_at) return match.status || 'LIVE';

        const now = currentTime.getTime();
        const start = new Date(match.start_at).getTime();
        const end = new Date(match.end_at).getTime();

        if (now < start) return 'UPCOMING';
        if (now >= start && now < end) return 'LIVE';

        const result = localStorage.getItem(`match_res_${match.id}`);
        if (result) return 'SETTLED';

        return 'LOCKED';
    };

    const getTimeRemaining = (targetDate) => {
        const diff = new Date(targetDate).getTime() - currentTime.getTime();
        if (diff <= 0) return "00:00:00";

        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const settleMatch = (match, userRank) => {
        if (localStorage.getItem(`match_res_${match.id}`)) return;

        // --- 1. RANK & PRIZES ---
        const rank = userRank;
        const getVal = (p) => parseInt(String(p).replace(/[৳₹,]/g, '')) || 0;
        const getPercent = (p) => parseInt(String(p).replace('%', '')) || 0;

        const prizeMap = {
            1: getVal(match.rank1_percent),
            2: getVal(match.rank2_percent),
            3: getVal(match.rank3_percent),
            4: getVal(match.rank4_percent)
        };
        const rankPrize = prizeMap[rank] || 0;
        const slotFee = getVal(match.slot_prize);
        const pmPool = Math.max(0, rankPrize - slotFee);

        // --- 2. ROSTER & SHARES (from Match Settings) ---
        const distribution = [
            { name: match.player1_name || 'Player 1', percent: getPercent(match.player1) },
            { name: match.player2_name || 'Player 2', percent: getPercent(match.player2) },
            { name: match.player3_name || 'Player 3', percent: getPercent(match.player3) },
            { name: match.player4_name || 'Player 4', percent: getPercent(match.player4) },
            { name: match.player5_name || 'Player 5', percent: getPercent(match.player5) },
            { name: 'MANAGEMENT', percent: getPercent(match.management) },
            { name: 'MVP BONUS', percent: getPercent(match.mvp) }
        ];

        // --- 2.1 ORG RESERVE CALCULATION ---
        const currentTotalPercent = distribution.reduce((sum, d) => sum + d.percent, 0);
        if (currentTotalPercent < 100) {
            distribution.push({
                name: 'ORG RESERVE',
                percent: 100 - currentTotalPercent
            });
        }

        // --- 3. CALCULATE PAYOUTS (Based on P&M Pool) ---
        let payouts = [];
        let distributedFromPool = 0;

        distribution.forEach(d => {
            const amt = Math.floor(pmPool * (d.percent / 100));
            payouts.push({
                name: d.name,
                percent: d.percent,
                amount: amt
            });
            distributedFromPool += amt;
        });

        // --- 4. ROUNDING CORRECTION (Add to Org Reserve) ---
        const remainder = pmPool - distributedFromPool;
        if (remainder > 0 && payouts.length > 0) {
            payouts[payouts.length - 1].amount += remainder;
        }

        // --- 5. USER INFO (for display only, no crediting yet) ---
        const userIGN = user?.user_metadata?.full_name || '';
        const myPayout = payouts.find(p => p.name.trim().toLowerCase() === userIGN.trim().toLowerCase());
        const creditingAmt = myPayout ? myPayout.amount : 0;

        const result = {
            id: match.id,
            rank: rank,
            totalWin: rankPrize, // Display Squad Win as Rank Prize
            pmPool: pmPool,
            slotFee: slotFee,
            individualWin: creditingAmt,
            myIGN: userIGN,
            payouts: payouts,
            settledAt: new Date().toISOString(),
            hash: btoa(`${match.id}-${rank}-${rankPrize}-${Date.now()}`).slice(0, 18).toUpperCase()
        };

        // --- 6. SAVE RESULT (NO WALLET CREDITING) ---
        localStorage.setItem(`match_res_${match.id}`, JSON.stringify(result));

        // Show confirmation without crediting wallet
        alert(`Match settled! Squad finished at Rank #${rank} and won ৳${rankPrize.toLocaleString()}.\n\nClick "DISTRIBUTE TO WALLET" to credit funds.`);
    };

    useEffect(() => {
        // Automatic settlement removed to allow for manual position entry
    }, [matches, currentTime]);

    return (
        <div className="matches-page-container">
            {/* BACKGROUNDS */}
            <div className="matches-bg-overlay" style={{ backgroundImage: `url(${bgImage})` }} />
            <div className="matches-gradient-overlay" />
            <div className="matches-grid-pattern" />

            {/* WALLET HUD */}
            <div className="wallet-hud">
                <div className="p-2 bg-[var(--neon-cyan)]/10 rounded-lg text-[var(--neon-cyan)]">
                    <Wallet size={20} />
                </div>
                <div>
                    <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">MY BALANCE</span>
                    <span className="font-black italic text-xl">৳{walletBalance.toLocaleString()}</span>
                </div>
            </div>

            <div className="matches-header">
                <div className="matches-subtitle">Operational Hub // System Active</div>
                <h1 className="matches-title">TBL TOurnament</h1>
            </div>

            <main className="matches-main-grid">
                {matches.map((match) => {
                    const mState = getMatchState(match);
                    const savedRes = JSON.parse(localStorage.getItem(`match_res_${match.id}`) || 'null');

                    return (
                        <div key={match.id} className="match-card">
                            <div className="match-card-hero">
                                <div className="match-card-img" style={{ backgroundImage: `url(${bgImage})` }} />
                                <div className="match-card-overlay" />

                                <div className={`match-status-pill status-${mState}`}>
                                    <Zap size={10} className={mState === 'LIVE' ? 'animate-pulse' : ''} />
                                    {mState}
                                    {mState === 'UPCOMING' && (
                                        <span className="ml-3 border-l border-white/20 pl-3 text-[var(--neon-cyan)] font-mono tracking-tighter">
                                            {getTimeRemaining(match.start_at)}
                                        </span>
                                    )}
                                </div>

                                <div className="match-card-info">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-md text-[8px] font-black text-white/50 uppercase tracking-[2px]">
                                            {match.tour_type || 'SCRIM TOUR'}
                                        </span>
                                        {match.tour_type === 'QUALIFIED TOUR' && (
                                            <span className="px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/40 rounded-md text-[8px] font-black text-yellow-500 uppercase tracking-[1px]">
                                                Round {match.current_round}
                                            </span>
                                        )}
                                    </div>
                                    <div className="match-card-org">
                                        {match.org_name}
                                        {mState === 'UPCOMING' && (
                                            <span className="ml-2 opacity-50 text-[9px]">Starts @ {new Date(match.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        )}
                                    </div>
                                    <div className="match-card-map-wrapper flex flex-wrap gap-2 mt-2">
                                        {(match.map_name || 'BERMUDA').split(',').map((m, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)]/30 rounded text-[9px] font-black text-[var(--neon-cyan)] uppercase tracking-tighter">
                                                {m.trim()}
                                            </span>
                                        ))}
                                    </div>

                                    {match.tour_type === 'QUALIFIED TOUR' && (
                                        <div className="qualification-meta mt-3 p-2 bg-black/30 rounded-lg border border-white/5">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[7px] text-white/40 font-bold uppercase tracking-widest">Status</span>
                                                <span className={`text-[8px] font-black uppercase ${match.qualification_status === 'QUALIFIED' ? 'text-green-400' :
                                                        match.qualification_status === 'DISQUALIFIED' ? 'text-red-500' : 'text-yellow-400'
                                                    }`}>
                                                    {match.current_round === 5 && match.qualification_status === 'QUALIFIED' ? '★ CHAMPION ★' : match.qualification_status}
                                                </span>
                                            </div>
                                            {match.qualification_status === 'QUALIFIED' && match.current_round < 5 && match.next_round_at && (
                                                <div className="flex justify-between items-center bg-green-500/5 p-1 rounded border border-green-500/10">
                                                    <span className="text-[7px] text-green-400/60 font-medium">NEXT ROUND:</span>
                                                    <span className="text-[7px] text-green-400 font-black">
                                                        {new Date(match.next_round_at).toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="match-card-body">
                                <div className="match-stats-row">
                                    <div
                                        className={`match-stat-box clickable-stat ${activePrizeMatchId === match.id ? 'active' : ''}`}
                                        onClick={() => setActivePrizeMatchId(activePrizeMatchId === match.id ? null : match.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="stat-box-label">Prize Pool</span>
                                            {activePrizeMatchId === match.id ? <ChevronUp size={10} className="text-[#FBBC04]" /> : <ChevronDown size={10} className="text-gray-500" />}
                                        </div>
                                        <span className="stat-box-value text-[#FBBC04]">৳{match.prize_pool || '0'}</span>

                                        {activePrizeMatchId === match.id && (
                                            <div className="prize-breakdown-mini mt-3 pt-3 border-t border-white/5 space-y-2">
                                                {Array.from({ length: (match.tour_type === 'BLAST TOUR' || match.sub_type === 'BLAST TOUR') ? 12 : 4 }).map((_, i) => {
                                                    const rank = i + 1;
                                                    const getPrizeValue = (p) => parseInt(String(p).replace(/[৳₹,]/g, '')) || 0;
                                                    const amt = getPrizeValue(match[`rank${rank}_percent`] || '0');
                                                    if (amt === 0 && rank > 4) return null; // Only show top 4 if 5-12 are 0
                                                    return (
                                                        <div key={rank} className="flex justify-between items-center text-[10px]">
                                                            <span className="font-bold text-gray-400">Position #{rank}</span>
                                                            <span className="font-black text-[var(--neon-cyan)]">৳{amt.toLocaleString()}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="match-stat-box">
                                        <span className="stat-box-label">Instance ID</span>
                                        <span className="stat-box-value">#{match.id}</span>
                                    </div>
                                </div>

                                {mState === 'LOCKED' && (
                                    <div className="match-settlement-prompt p-4 bg-white/5 border border-dashed border-[#ffc800]/30 rounded-2xl mb-4">
                                        <span className="text-[10px] font-black uppercase text-[#ffd014] tracking-widest mb-3 block text-center">Match Ended // Select Squad Position</span>
                                        {match.tour_type === 'QUALIFIED TOUR' && match.current_round < 5 && match.qualification_status !== 'QUALIFIED' ? (
                                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                                <span className="text-[9px] font-black text-red-500 uppercase">Wait for Round 5 to unlock distribution</span>
                                                <p className="text-[8px] text-gray-500 mt-1 uppercase">OR GET QUALIFIED BY ADMIN</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-2">
                                                {Array.from({ length: (match.tour_type === 'BLAST TOUR' || match.sub_type === 'BLAST TOUR') ? 12 : 4 }).map((_, i) => {
                                                    const r = i + 1;
                                                    return (
                                                        <button
                                                            key={r}
                                                            onClick={() => settleMatch(match, r)}
                                                            className="rank-btn py-3 bg-black/40 border border-white/5 rounded-xl hover:bg-[#ffc800] hover:text-black transition-all font-black text-sm"
                                                        >
                                                            #{r}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        <p className="text-[9px] text-gray-300 text-center mt-3 font-bold uppercase tracking-wider">Note: Position cannot be changed after submission</p>
                                    </div>
                                )}

                                {mState === 'SETTLED' && savedRes && (
                                    <div className="settled-card">
                                        <div className="settled-top">
                                            <div className="settled-box">
                                                <div className="settled-label">PRIZE POOL</div>
                                                <div className="settled-value green">৳{parseInt(String(match.prize_pool || '0').replace(/[^\d]/g, '')).toLocaleString()}</div>
                                            </div>
                                            <div className="settled-box">
                                                <div className="settled-label">INSTANCE ID</div>
                                                <div className="settled-value">#{match.id}</div>
                                            </div>
                                        </div>

                                        <div className="settled-main">
                                            <div className="settled-header">
                                                <div>
                                                    <div className="settled-label">TACTICAL PLACEMENT</div>
                                                    <div className="settled-rank">RANK #{savedRes.rank}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="settled-label">SQUAD PRIZE</div>
                                                    <div className="settled-squad">৳{savedRes.totalWin?.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <div className="settled-sub">PAYOUT BREAKDOWN · PERFECT DISTRIBUTION</div>

                                            <div className="settled-list">
                                                {savedRes.payouts.map((p, i) => {
                                                    const playerKey = p.name.trim().toUpperCase();
                                                    const uid = playerUids[playerKey];
                                                    const isPlayer = !['MANAGEMENT', 'MVP BONUS', 'ORG RESERVE'].includes(playerKey);

                                                    return (
                                                        <div className="settled-row" key={i}>
                                                            <div>
                                                                <div>{p.name.toUpperCase()} — {p.percent}%</div>
                                                                {isPlayer && uid && (
                                                                    <div style={{
                                                                        fontSize: '9px',
                                                                        opacity: 0.5,
                                                                        marginTop: '2px',
                                                                        fontFamily: 'monospace',
                                                                        letterSpacing: '0.5px'
                                                                    }}>
                                                                        UID: {uid}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="settled-amount">৳{p.amount.toLocaleString()}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="settled-footer">
                                                VERIFIED · SECURE · TOTAL 100%
                                                <div className="mt-2 opacity-30 text-[8px] font-mono tracking-widest cursor-pointer hover:text-red-500 hover:opacity-100" onClick={() => {
                                                    localStorage.removeItem(`match_res_${match.id}`);
                                                    localStorage.removeItem(`dist_done_${match.id}`);
                                                    window.location.reload();
                                                }}>
                                                    {savedRes.hash} [RESET]
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        const alreadyDistributed = localStorage.getItem(`dist_done_${match.id}`);
                                                        if (alreadyDistributed) {
                                                            alert("This match has already been distributed to wallets.");
                                                            return;
                                                        }

                                                        const DIST_LOG = [];

                                                        // Iterate Payouts and Credit via RPC
                                                        for (const p of savedRes.payouts) {
                                                            const nameTrimmed = (p.name || '').trim().toUpperCase();

                                                            // Find Target User ID
                                                            let targetUserId = null;

                                                            // Deterministic UUIDs for Corporate Accounts (Synced with DB)
                                                            if (nameTrimmed === 'MANAGEMENT') {
                                                                targetUserId = '00000000-0000-0000-0000-000000000001';
                                                            } else if (nameTrimmed === 'MVP BONUS') {
                                                                targetUserId = '00000000-0000-0000-0000-000000000002';
                                                            } else if (nameTrimmed === 'ORG RESERVE') {
                                                                targetUserId = '00000000-0000-0000-0000-000000000003';
                                                            } else {
                                                                const playerInfo = playerFullMap[nameTrimmed];
                                                                if (playerInfo && playerInfo.userId) {
                                                                    targetUserId = playerInfo.userId;
                                                                } else if (user && (user.user_metadata?.full_name?.toUpperCase() === nameTrimmed || user.email?.split('@')[0].toUpperCase() === nameTrimmed)) {
                                                                    targetUserId = user.id;
                                                                }
                                                            }

                                                            if (targetUserId) {
                                                                try {
                                                                    // DB Credit
                                                                    const { error } = await supabase.rpc('admin_credit_user', {
                                                                        p_user_id: targetUserId,
                                                                        p_amount: p.amount
                                                                    });

                                                                    if (error) throw error;
                                                                    DIST_LOG.push(`✅ ${p.name}: Credited ৳${p.amount}`);

                                                                    // Local Storage Update (Redundancy/Immediate feedback for self)
                                                                    if (user && user.id === targetUserId) {
                                                                        const currentMainWallet = Number(localStorage.getItem('bloods_wallet_balance') || 0);
                                                                        const newMainWallet = currentMainWallet + p.amount;
                                                                        localStorage.setItem('bloods_wallet_balance', String(newMainWallet));

                                                                        const txs = JSON.parse(localStorage.getItem('bloods_txs') || '[]');
                                                                        txs.push({
                                                                            id: `TX-${Date.now()}-${match.id}`,
                                                                            matchId: match.id,
                                                                            amount: p.amount,
                                                                            type: 'TOURNAMENT_WIN',
                                                                            ref: `Rank #${savedRes.rank} Share`,
                                                                            date: new Date().toLocaleString()
                                                                        });
                                                                        localStorage.setItem('bloods_txs', JSON.stringify(txs));
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    DIST_LOG.push(`❌ ${p.name}: DB Error (${err.message})`);
                                                                }
                                                            } else {
                                                                DIST_LOG.push(`⚠️ ${p.name}: No User ID found.`);
                                                            }
                                                        }

                                                        localStorage.setItem(`dist_done_${match.id}`, "true");
                                                        alert(`DISTRIBUTION REPORT:\n${DIST_LOG.join('\n')}`);
                                                        window.location.reload();
                                                    }}
                                                    className="mt-3 w-full py-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-bold text-[10px] hover:bg-emerald-500 hover:text-black transition-all"
                                                >
                                                    DISTRIBUTE TO WALLET
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    className="match-btn"
                                    onClick={() => setActiveRosterId(activeRosterId === match.id ? null : match.id)}
                                >
                                    {activeRosterId === match.id ? 'Hide Tactical Data' : 'View Operational Roster'}
                                    <ArrowUpRight size={16} />
                                </button>

                                {activeRosterId === match.id && (
                                    <div className="match-roster">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <div key={n} className="roster-player">
                                                <div className="player-info">
                                                    <span>OPERATIVE 0{n}</span>
                                                    <h4>{match[`player${n}_name`] || `UNASSIGNED`}</h4>
                                                </div>
                                                <div className="player-share">{match[`player${n}`] || '0%'}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {
                    matches.length === 0 && (
                        <div className="lg:col-span-2 text-center py-32 opacity-30">
                            <Gamepad2 size={48} className="mx-auto mb-6" />
                            <h3 className="text-xl font-black italic uppercase tracking-[5px]">No Active Combat Zones</h3>
                        </div>
                    )
                }
            </main >

            {/* FOOTER TIMER */}
            < div className="matches-footer-timer" >
                <div className="flex items-center gap-3">
                    <Clock size={20} className="text-[var(--neon-cyan)]" />
                    <span className="footer-time">{currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[3px] uppercase opacity-60">Neural Network Active</span>
                </div>
            </div >
        </div >
    );
};

export default MatchesPage;
