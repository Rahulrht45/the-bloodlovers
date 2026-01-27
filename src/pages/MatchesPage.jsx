import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, Users, Award, Target, Gamepad2, Clock, Wallet, Activity, Hash, ArrowUpRight, Zap } from 'lucide-react';
import { supabase } from '../supabase';
import bgImage from '../assets/freefire_bg.jpg';
import './MatchesPage.css';

const MatchesPage = () => {
    const [matches, setMatches] = useState([]);
    const [walletBalance, setWalletBalance] = useState(() => Number(localStorage.getItem('bloods_wallet_balance') || 0));
    const [activeRosterId, setActiveRosterId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

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

        // --- 1. ASSIGN FINAL POSITION (1-4) ---
        const rank = userRank;

        // --- 2. PREDEFINED WINNING AMOUNTS (Proportional to Pool) ---
        const prizeMap = { 1: 0.6, 2: 0.3, 3: 0.1, 4: 0.05 };
        const totalPool = parseInt(String(match.prize_pool).replace(/[₹,]/g, '')) || 0;
        const totalWin = Math.floor(totalPool * (prizeMap[rank] || 0));

        // --- 3. ROSTER PERCENTAGES ---
        const roster = [
            { name: match.player1_name || 'Player 1', percent: parseInt(match.player1) || 0 },
            { name: match.player2_name || 'Player 2', percent: parseInt(match.player2) || 0 },
            { name: match.player3_name || 'Player 3', percent: parseInt(match.player3) || 0 },
            { name: match.player4_name || 'Player 4', percent: parseInt(match.player4) || 0 },
            { name: match.player5_name || 'Management', percent: parseInt(match.player5) || 0 }
        ];

        // --- 4. PERFECT DISTRIBUTION (FLOOR + REMAINDER CORRECTION) ---
        let payouts = [];
        let distributedAmt = 0;

        roster.forEach((member) => {
            const amt = Math.floor(totalWin * member.percent / 100);
            payouts.push({
                name: member.name,
                percent: member.percent,
                amount: amt
            });
            distributedAmt += amt;
        });

        const remainder = totalWin - distributedAmt;
        if (remainder > 0 && payouts.length > 0) {
            payouts[payouts.length - 1].amount += remainder;
        }

        const result = {
            id: match.id,
            rank: rank,
            totalWin: totalWin,
            payouts: payouts,
            settledAt: new Date().toISOString(),
            hash: btoa(`${match.id}-${rank}-${totalWin}-${Date.now()}`).slice(0, 18).toUpperCase()
        };

        // --- 5. PERSISTENCE & LOCKING ---
        localStorage.setItem(`match_res_${match.id}`, JSON.stringify(result));

        const newBalance = walletBalance + totalWin;
        setWalletBalance(newBalance);
        localStorage.setItem('bloods_wallet_balance', String(newBalance));

        // --- 6. TRANSACTION LEDGER ---
        const txs = JSON.parse(localStorage.getItem('bloods_txs') || '[]');
        txs.push({
            id: `TX-${Date.now()}-${match.id}`,
            matchId: match.id,
            amount: totalWin,
            type: 'TOURNAMENT_WIN',
            ref: `Rank #${rank} in ${match.org_name}`,
            date: new Date().toLocaleString()
        });
        localStorage.setItem('bloods_txs', JSON.stringify(txs));
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
                    <span className="font-black italic text-xl">₹{walletBalance.toLocaleString()}</span>
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
                                    <div className="match-stat-box">
                                        <span className="stat-box-label">Prize Pool</span>
                                        <span className="stat-box-value text-[#FBBC04]">₹{match.prize_pool || '0'}</span>
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
                                    <div className="match-result-box">
                                        <div className="result-row">
                                            <div>
                                                <span className="result-label">Tactical Placement</span>
                                                <div className="result-value">RANK #{savedRes.rank}</div>
                                            </div>
                                            <div className="text-right">
                                                <span className="result-label">Net Payout</span>
                                                <div className="result-value text-[#00ff88]">₹{savedRes.totalWin.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Payout Breakdown (Perfect Distribution)</span>
                                            {savedRes.payouts.map((p, i) => (
                                                <div key={i} className="flex justify-between items-center text-[11px] bg-white/5 p-2 rounded-lg">
                                                    <span className="font-bold opacity-70">{p.name}</span>
                                                    <div className="flex gap-3 items-center">
                                                        <span className="text-[9px] px-2 py-0.5 bg-black/50 rounded-md text-[var(--neon-cyan)]">{p.percent}%</span>
                                                        <span className="font-black">₹{p.amount.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="result-hash">SECURE_BLOCK_SIG: {savedRes.hash}</div>
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
