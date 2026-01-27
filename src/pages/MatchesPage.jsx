import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, Users, Award, Target, Gamepad2, Clock, Wallet, Activity, Hash, ArrowUpRight, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../supabase';
import bgImage from '../assets/freefire_bg.jpg';
import './MatchesPage.css';

const MatchesPage = () => {
    const [matches, setMatches] = useState([]);
    const [walletBalance, setWalletBalance] = useState(() => Number(localStorage.getItem('bloods_wallet_balance') || 0));
    const [activeRosterId, setActiveRosterId] = useState(null);
    const [activePrizeMatchId, setActivePrizeMatchId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [user, setUser] = useState(null);

    // --- FETCH USER ---
    useEffect(() => {
        const getAuth = async () => {
            const { data: { user: u } } = await supabase.auth.getUser();
            setUser(u);
        };
        getAuth();
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

        // --- 4. ROUNDING CORRECTION ---
        const remainder = pmPool - distributedFromPool;
        if (remainder > 0 && payouts.length > 0) {
            payouts[payouts.length - 1].amount += remainder;
        }

        // --- 5. USER CREDIT ---
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

        // --- 6. SAVE & UPDATE ---
        localStorage.setItem(`match_res_${match.id}`, JSON.stringify(result));

        const newBalance = walletBalance + creditingAmt;
        setWalletBalance(newBalance);
        localStorage.setItem('bloods_wallet_balance', String(newBalance));

        // --- 7. LEDGER ---
        const txs = JSON.parse(localStorage.getItem('bloods_txs') || '[]');
        txs.push({
            id: `TX-${Date.now()}-${match.id}`,
            matchId: match.id,
            amount: creditingAmt,
            type: 'TOURNAMENT_WIN',
            ref: `Rank #${rank} Share (${myPayout?.percent || 0}%) in ${match.org_name}`,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('bloods_txs', JSON.stringify(txs));

        if (creditingAmt > 0) {
            alert(`Victory! Credited ৳${creditingAmt.toLocaleString()} to your wallet.`);
        } else if (userIGN) {
            alert(`Match settled. Squad won ৳${rankPrize.toLocaleString()}, but your IGN (${userIGN}) was not found in the roster.`);
        } else {
            alert(`Match settled. Squad won ৳${rankPrize.toLocaleString()}. Please sign in to claim shares.`);
        }
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
                    <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Global Credits</span>
                    <span className="font-black italic text-xl">৳{walletBalance.toLocaleString()}</span>
                </div>
            </div>

            <div className="matches-header">
                <div className="matches-subtitle">Operational Hub // System Active</div>
                <h1 className="matches-title">Global <br /> Tournaments</h1>
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
                                    <div className="match-card-org">
                                        {match.org_name}
                                        {mState === 'UPCOMING' && (
                                            <span className="ml-2 opacity-50 text-[9px]">Starts @ {new Date(match.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        )}
                                    </div>
                                    <h2 className="match-card-map">{match.map_name || 'BERMUDA'}</h2>
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
                                                {[1, 2, 3, 4].map(rank => {
                                                    const getPrizeValue = (p) => parseInt(String(p).replace(/[৳₹,]/g, '')) || 0;
                                                    const pMap = {
                                                        1: getPrizeValue(match.rank1_percent || '0'),
                                                        2: getPrizeValue(match.rank2_percent || '0'),
                                                        3: getPrizeValue(match.rank3_percent || '0'),
                                                        4: getPrizeValue(match.rank4_percent || '0')
                                                    };
                                                    const amt = pMap[rank];
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
                                        <span className="text-[10px] font-black uppercase text-[#ffc800] tracking-widest mb-3 block text-center">Match Ended // Select Squad Position</span>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 2, 3, 4].map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => settleMatch(match, r)}
                                                    className="rank-btn py-3 bg-black/40 border border-white/5 rounded-xl hover:bg-[#ffc800] hover:text-black transition-all font-black text-sm"
                                                >
                                                    #{r}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-gray-500 text-center mt-3 font-bold uppercase tracking-wider">Note: Position cannot be changed after submission</p>
                                    </div>
                                )}

                                {mState === 'SETTLED' && savedRes && (
                                    <div className="settled-card">
                                        <div className="settled-top">
                                            <div className="settled-box">
                                                <div className="settled-label">PRIZE POOL</div>
                                                <div className="settled-value green">৳{match.prize_pool || '0'}</div>
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
                                                {savedRes.payouts.map((p, i) => (
                                                    <div className="settled-row" key={i}>
                                                        <div>{p.name.toUpperCase()} — {p.percent}%</div>
                                                        <div className="settled-amount">৳{p.amount.toLocaleString()}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="settled-footer">
                                                VERIFIED · SECURE · TOTAL 100%
                                                <div className="mt-2 opacity-30 text-[8px] font-mono tracking-widest">{savedRes.hash}</div>
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

                {matches.length === 0 && (
                    <div className="lg:col-span-2 text-center py-32 opacity-30">
                        <Gamepad2 size={48} className="mx-auto mb-6" />
                        <h3 className="text-xl font-black italic uppercase tracking-[5px]">No Active Combat Zones</h3>
                    </div>
                )}
            </main>

            {/* FOOTER TIMER */}
            <div className="matches-footer-timer">
                <div className="flex items-center gap-3">
                    <Clock size={20} className="text-[var(--neon-cyan)]" />
                    <span className="footer-time">{currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[3px] uppercase opacity-60">Neural Network Active</span>
                </div>
            </div>
        </div>
    );
};

export default MatchesPage;
