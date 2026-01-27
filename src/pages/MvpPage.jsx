import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Trophy, Calculator, Award, Users, DollarSign, Crown } from 'lucide-react';
import './MvpPage.css';

const MvpPage = () => {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState('');
    const [mvpName, setMvpName] = useState('');
    const [numPlayers, setNumPlayers] = useState(5);
    const [rankData, setRankData] = useState([]);

    // Calculator States
    const [calcResult, setCalcResult] = useState(null);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        const { data } = await supabase.from('match_settings').select('*').order('created_at', { ascending: false });
        if (data) setMatches(data);
    };

    const calculateRewards = (matchId) => {
        const match = matches.find(m => m.id === matchId);
        if (!match) return;

        // Helper to parse currency (both ৳ and ₹)
        const getVal = (val) => parseInt(String(val).replace(/[৳₹,]/g, '')) || 0;
        const getPercent = (val) => (parseInt(String(val).replace('%', '')) || 0) / 100;

        const slotFee = getVal(match.slot_prize);
        const ranks = [
            { id: 1, prize: getVal(match.rank1_percent) },
            { id: 2, prize: getVal(match.rank2_percent) },
            { id: 3, prize: getVal(match.rank3_percent) },
            { id: 4, prize: getVal(match.rank4_percent) }
        ];

        // Get configured percentages (fallback to defaults if missing)
        const playerPct = getPercent(match.player1) || 0.10; // Assuming equal share for simplicity or taking P1's share
        const mgmtPct = getPercent(match.management) || 0.10;
        const mvpPct = getPercent(match.mvp) || 0.05;

        const breakdown = ranks.map(r => {
            const pmPool = Math.max(0, r.prize - slotFee);

            // Distribution Logic
            const playerShare = (pmPool * playerPct);
            const managementShare = (pmPool * mgmtPct);
            const mvpShare = (pmPool * mvpPct);

            return {
                rank: r.id,
                basePrize: r.prize,
                pmPool: pmPool,
                playerShare: Math.floor(playerShare),
                managementShare: Math.floor(managementShare),
                mvpShare: Math.floor(mvpShare)
            };
        });

        // MVP Highlight
        const champion = breakdown.find(b => b.rank === 1);

        setCalcResult({
            matchName: match.org_name,
            slotFee: slotFee,
            percentages: { player: playerPct, mgmt: mgmtPct, mvp: mvpPct },
            ranks: breakdown,
            totalMvpPool: breakdown.reduce((sum, item) => sum + item.mvpShare, 0)
        });
    };

    // Auto-calculate when match is selected
    useEffect(() => {
        if (selectedMatch) {
            calculateRewards(selectedMatch);
        }
    }, [selectedMatch, numPlayers]);

    const formatPercent = (dec) => `${Math.round(dec * 100)}%`;

    return (
        <div className="mvp-page-container">
            <div className="mvp-bg-overlay" />

            <header className="mvp-header">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Crown className="text-[#FFD700]" size={40} />
                        MVP Scoreboard
                    </h1>
                    <p className="text-gray-500 text-xs font-bold tracking-[4px] uppercase mt-1">Tournament Performance Analytics</p>
                </div>
            </header>

            <div className="mvp-grid">
                {/* SETTINGS CARD */}
                <div className="mvp-card settings-card">
                    <h3 className="card-title"><Calculator size={18} /> Configuration</h3>

                    <div className="input-group">
                        <label>Select Tournament</label>
                        <select
                            value={selectedMatch}
                            onChange={(e) => setSelectedMatch(parseInt(e.target.value))}
                            className="mvp-select"
                        >
                            <option value="">-- Choose Match --</option>
                            {matches.map(m => (
                                <option key={m.id} value={m.id}>{m.org_name} (ID: #{m.id})</option>
                            ))}
                        </select>
                    </div>

                    {selectedMatch && calcResult && (
                        <div className="calc-summary mt-6 space-y-4">
                            <div className="summary-item">
                                <span>Slot Fee Deducted</span>
                                <span className="val">৳{calcResult.slotFee}</span>
                            </div>
                            <div className="summary-item">
                                <span>MVP Bonus Pool</span>
                                <span className="val text-[#FFD700]">৳{calcResult.totalMvpPool}</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg text-[10px] text-gray-400 font-mono mt-4 border border-dashed border-white/10">
                                <div>Formula: (Prize - Fee) = P&M Pool</div>
                                <div className="mt-1">Rank #1: ৳{calcResult.ranks[0].basePrize} - ৳{calcResult.slotFee} = ৳{calcResult.ranks[0].pmPool}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MVP SHOWCASE */}
                {calcResult && (
                    <div className="mvp-card showcase-card">
                        <div className="trophy-section">
                            <Trophy size={64} className="text-[#FFD700] animate-bounce-slow" />
                            <h2 className="text-2xl font-black italic mt-4">MVP REWARDS</h2>
                        </div>

                        <div className="mvp-table-container">
                            <table className="mvp-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Base Prize</th>
                                        <th>P&M Pool ({calcResult.matchName})</th>
                                        <th>Player ({formatPercent(calcResult.percentages.player)})</th>
                                        <th>Mgmt ({formatPercent(calcResult.percentages.mgmt)})</th>
                                        <th>MVP ({formatPercent(calcResult.percentages.mvp)})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calcResult.ranks.map(r => (
                                        <tr key={r.rank} className={`rank-${r.rank}`}>
                                            <td className="font-bold">#{r.rank}</td>
                                            <td>৳{r.basePrize}</td>
                                            <td className="opacity-60 text-[var(--neon-cyan)]">৳{r.pmPool}</td>
                                            <td className="font-bold">৳{r.playerShare}</td>
                                            <td className="opacity-60">৳{r.managementShare}</td>
                                            <td className="text-[#FFD700] font-black">৳{r.mvpShare}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MvpPage;
