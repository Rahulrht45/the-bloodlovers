import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, Clock, Search, Filter, TrendingUp, ShieldCheck, User, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './WalletPage.css';

const WalletPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [walletData, setWalletData] = useState({
        uid: '',
        name: '',
        balance: 0
    });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                // Get current user
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    setLoading(false);
                    return;
                }

                setUser(authUser);

                // Fetch player profile from Supabase
                // 1. Fetch Source of Truth Balance (users.global_credit)
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('global_credit, name')
                    .eq('id', authUser.id)
                    .single();

                // 2. Fetch Player Profile (for Display UID only)
                const { data: playerData } = await supabase
                    .from('players')
                    .select('in_game_uid, ign')
                    .eq('user_id', authUser.id)
                    .single();

                // 3. Set Wallet Data
                setWalletData({
                    uid: playerData?.in_game_uid || 'NOT LINKED',
                    name: userData?.name || playerData?.ign || 'Operator',
                    balance: Number(userData?.global_credit || 0)
                });

                // 4. Fetch Transactions History (transactions table)
                const { data: txList, error: txError } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false });

                if (txList) {
                    // Map keys if necessary, or ensure simple display
                    // The UI expects: id, ref, date, matchId, amount
                    // DB has: id, amount, type, source, note, created_at
                    const formattedTxs = txList.map(tx => ({
                        id: tx.id,
                        matchId: tx.source === 'admin' ? 'ADMIN' : 'SYS', // or parse from note?
                        amount: tx.amount,
                        type: tx.type,
                        ref: tx.note || 'Transaction',
                        date: new Date(tx.created_at).toLocaleDateString()
                    }));
                    setTransactions(formattedTxs);
                }

            } catch (err) {
                console.error("Error loading wallet:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();

        // Listener for updates
        // Real-time Subscription for Balance Updates
        const channel = supabase
            .channel('wallet-realtime')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'users' },
                async (payload) => {
                    // Refresh if the update is for this user (fetch fresh auth user to bypass closure staleness)
                    const { data: { user: cur } } = await supabase.auth.getUser();
                    if (cur && payload.new.id === cur.id) {
                        fetchWalletData();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020014] text-[var(--neon-cyan)]">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-[4px]">Accessing Secure Ledger...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020014] text-white">
                <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md max-w-md w-full mx-4">
                    <Wallet size={48} className="mx-auto mb-6 text-gray-500" />
                    <h2 className="text-2xl font-black italic uppercase mb-2">Access Denied</h2>
                    <p className="text-gray-400 text-sm mb-8">You must be logged in to view your financial data.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-[var(--neon-cyan)] text-black px-8 py-3 rounded font-black uppercase tracking-widest hover:bg-[#00f0ff80] transition-all w-full"
                    >
                        Login Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wallet-page-container">
            <div className="wallet-bg-effects">
                <div className="glow-circle top-right"></div>
                <div className="glow-circle bottom-left"></div>
            </div>

            <main className="wallet-content">
                <header className="wallet-header">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">My Wallet</h1>
                        <p className="text-gray-500 text-xs font-bold tracking-[4px] uppercase mt-1">Personal Financial Command Center</p>
                    </div>

                    <div className="flex items-center gap-3 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Connected</span>
                    </div>
                </header>

                <div className="wallet-main-grid">
                    <div className="flex flex-col gap-6">
                        {/* MAIN BALANCE CARD */}
                        <div className="balance-card relative overflow-hidden group">
                            {/* Abstract bg visual */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--neon-cyan)]/20 to-transparent rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>

                            <div className="card-top relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-[var(--neon-cyan)]/10 rounded-2xl text-[var(--neon-cyan)] inline-flex">
                                        <Wallet size={32} />
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-2 mb-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operator</span>
                                            <span className="text-[10px] font-black text-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 px-2 py-0.5 rounded border border-[var(--neon-cyan)]/20">
                                                {walletData.name}
                                            </span>
                                        </div>
                                        {walletData.uid !== 'NOT LINKED' && (
                                            <div className="text-[9px] font-mono text-gray-500 bg-black/30 px-2 py-1 rounded inline-block">
                                                UID: {walletData.uid}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <span className="block text-[10px] font-black text-white/40 uppercase tracking-[3px] mb-2">Available Balance</span>
                                    <h1 className="text-6xl font-black italic tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                                        ৳{walletData.balance.toLocaleString()}
                                    </h1>
                                </div>
                            </div>

                            <div className="card-stats mt-12 grid grid-cols-2 gap-4 relative z-10">
                                <div className="stat-box">
                                    <span className="block text-[9px] text-gray-500 font-bold uppercase mb-1">Total Earnings</span>
                                    <div className="flex items-center gap-2 text-[#00ff88]">
                                        <TrendingUp size={14} />
                                        <span className="font-black italic">৳{walletData.balance.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="stat-box">
                                    <span className="block text-[9px] text-gray-500 font-bold uppercase mb-1">Account Status</span>
                                    <div className="flex items-center gap-2 text-[var(--neon-cyan)]">
                                        <ShieldCheck size={14} />
                                        <span className="font-black italic">VERIFIED OPERATOR</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Note for unlinked accounts */}
                        {walletData.uid === 'NOT LINKED' && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-4">
                                <div className="p-2 bg-red-500/20 rounded-full text-red-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase text-red-500">Action Required</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Link your Game UID in <span className="text-white underline cursor-pointer" onClick={() => navigate('/profile')}>Profile Settings</span> to receive tournament winnings.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: LEDGER (Kept for visual balance, showing network activity or history) */}
                    <div className="ledger-section">
                        <div className="ledger-header mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Clock className="text-gray-500" size={18} />
                                <h2 className="text-lg font-black uppercase tracking-widest italic">Recent Activity</h2>
                            </div>
                            <div className="flex gap-2">
                                <button className="ledger-tool-btn"><Search size={16} /></button>
                            </div>
                        </div>

                        <div className="ledger-list space-y-3">
                            {transactions.length > 0 ? (
                                transactions.slice().reverse().map((tx) => (
                                    <div key={tx.id} className="tx-card group hover:bg-white/5 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="tx-icon-box group-hover:bg-[#00ff88]/20 transition-all">
                                                <ArrowDownLeft size={18} className="text-[#00ff88]" />
                                            </div>
                                            <div className="tx-info">
                                                <h4 className="font-black italic uppercase text-sm text-white group-hover:text-[var(--neon-cyan)] transition-colors">{tx.ref || 'Tournament Reward'}</h4>
                                                <div className="flex items-center gap-2 mt-0.5 opacity-40">
                                                    <span className="text-[10px] font-bold">{tx.date}</span>
                                                    <span className="text-[10px]">•</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">ID: {tx.matchId}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[#00ff88] font-black italic text-lg">+ ৳{tx.amount.toLocaleString()}</div>
                                            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Received</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-20">
                                    <Clock size={48} className="mx-auto mb-4" />
                                    <p className="text-sm font-black uppercase tracking-widest">No transaction history found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
};

export default WalletPage;

