import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, Clock, Search, Filter, TrendingUp, ShieldCheck } from 'lucide-react';
import './WalletPage.css';

const WalletPage = () => {
    const [balance, setBalance] = useState(() => Number(localStorage.getItem('bloods_wallet_balance') || 0));
    const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('bloods_txs') || '[]'));

    useEffect(() => {
        // Handle changes if they happen in other tabs/pages
        const handleStorage = () => {
            setBalance(Number(localStorage.getItem('bloods_wallet_balance') || 0));
            setTransactions(JSON.parse(localStorage.getItem('bloods_txs') || '[]'));
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <div className="wallet-page-container">
            <div className="wallet-bg-effects">
                <div className="glow-circle top-right"></div>
                <div className="glow-circle bottom-left"></div>
            </div>

            <main className="wallet-content">
                <header className="wallet-header">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Financial Hub</h1>
                        <p className="text-gray-500 text-xs font-bold tracking-[4px] uppercase mt-1">Operational Credit Management</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Secure Ledger Active</span>
                    </div>
                </header>

                <div className="wallet-main-grid">
                    {/* LEFT: BALANCE CARD */}
                    <div className="balance-card">
                        <div className="card-top">
                            <div className="p-3 bg-[var(--neon-cyan)]/10 rounded-2xl text-[var(--neon-cyan)]">
                                <Wallet size={32} />
                            </div>
                            <div className="text-right">
                                <span className="block text-[10px] font-black text-white/40 uppercase tracking-[3px]">Total Balance</span>
                                <h1 className="text-5xl font-black italic tracking-tighter mt-1">₹{balance.toLocaleString()}</h1>
                            </div>
                        </div>

                        <div className="card-stats mt-12 grid grid-cols-2 gap-4">
                            <div className="stat-box">
                                <span className="block text-[9px] text-gray-500 font-bold uppercase mb-1">Total Profits</span>
                                <div className="flex items-center gap-2 text-[#00ff88]">
                                    <TrendingUp size={14} />
                                    <span className="font-black italic">₹{balance.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <span className="block text-[9px] text-gray-500 font-bold uppercase mb-1">Status</span>
                                <div className="flex items-center gap-2 text-[var(--neon-cyan)]">
                                    <ShieldCheck size={14} />
                                    <span className="font-black italic">VERIFIED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: LEDGER */}
                    <div className="ledger-section">
                        <div className="ledger-header mb-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Clock className="text-gray-500" size={18} />
                                <h2 className="text-lg font-black uppercase tracking-widest italic">Transaction History</h2>
                            </div>
                            <div className="flex gap-2">
                                <button className="ledger-tool-btn"><Search size={16} /></button>
                                <button className="ledger-tool-btn"><Filter size={16} /></button>
                            </div>
                        </div>

                        <div className="ledger-list space-y-3">
                            {transactions.length > 0 ? (
                                transactions.slice().reverse().map((tx) => (
                                    <div key={tx.id} className="tx-card">
                                        <div className="flex items-center gap-4">
                                            <div className="tx-icon-box">
                                                <ArrowDownLeft size={18} className="text-[#00ff88]" />
                                            </div>
                                            <div className="tx-info">
                                                <h4 className="font-black italic uppercase text-sm">{tx.ref || 'Tournament Reward'}</h4>
                                                <div className="flex items-center gap-2 mt-0.5 opacity-40">
                                                    <span className="text-[10px] font-bold">{tx.date}</span>
                                                    <span className="text-[10px]">•</span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest">ID: {tx.matchId}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[#00ff88] font-black italic text-lg">+ ₹{tx.amount.toLocaleString()}</div>
                                            <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Settled</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-20">
                                    <Clock size={48} className="mx-auto mb-4" />
                                    <p className="text-sm font-black uppercase tracking-widest">No transaction data found in neural cache</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WalletPage;
