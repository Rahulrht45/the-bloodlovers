import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Trophy, Star, Zap, Target, ArrowRight } from 'lucide-react';

/* ─── Static showcase data (shown when DB is empty) ─── */
const SHOWCASE = [
    {
        id: 's1',
        rank: '01',
        badge: '🥇',
        title: 'VALORANT CHAMPIONS 2024',
        event: 'World Championship',
        prize: '$250,000',
        date: 'DEC 15, 2024',
        tier: 'PLATINUM',
        color: '#ffd700',
    },
    {
        id: 's2',
        rank: '02',
        badge: '🥈',
        title: 'VCT PACIFIC FINALS',
        event: 'Regional Championship',
        prize: '$120,000',
        date: 'SEP 10, 2024',
        tier: 'GOLD',
        color: '#ff1a1a',
    },
    {
        id: 's3',
        rank: '03',
        badge: '🥉',
        title: 'ESL PRO LEAGUE S19',
        event: 'Pro League',
        prize: '$80,000',
        date: 'JUL 22, 2024',
        tier: 'SILVER',
        color: '#7000ff',
    },
    {
        id: 's4',
        rank: '04',
        badge: '🏆',
        title: 'BLAST PREMIER SPRING',
        event: 'Invitational',
        prize: '$50,000',
        date: 'APR 5, 2024',
        tier: 'BRONZE',
        color: '#0070ff',
    },
];

const TIER_CONFIG = {
    PLATINUM: { glow: '#ffd700', bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.25)' },
    GOLD:     { glow: '#ff1a1a', bg: 'rgba(255,26,26,0.08)', border: 'rgba(255,26,26,0.25)' },
    SILVER:   { glow: '#7000ff', bg: 'rgba(112,0,255,0.08)', border: 'rgba(112,0,255,0.25)' },
    BRONZE:   { glow: '#0070ff', bg: 'rgba(0,112,255,0.08)', border: 'rgba(0,112,255,0.25)' },
    DEFAULT:  { glow: '#ff1a1a', bg: 'rgba(255,26,26,0.05)', border: 'rgba(255,26,26,0.15)' },
};

/* ─── Single Achievement Card ─── */
const AchievementCard = ({ achievement, index }) => {
    const tier = TIER_CONFIG[achievement.tier] || TIER_CONFIG.DEFAULT;
    const delay = `${index * 0.12}s`;

    return (
        <div
            className="achievement-card-wrap"
            style={{ animationDelay: delay }}
        >
            {/* Rank number */}
            <div className="achievement-rank" style={{ color: tier.glow }}>
                {achievement.rank || String(index + 1).padStart(2, '0')}
            </div>

            {/* Card body */}
            <div
                className="achievement-card"
                style={{
                    background: tier.bg,
                    borderColor: tier.border,
                    '--glow': tier.glow,
                }}
            >
                {/* Glow top line */}
                <div
                    className="achievement-top-line"
                    style={{ background: `linear-gradient(90deg, transparent, ${tier.glow}, transparent)` }}
                />

                <div className="achievement-card-inner">
                    {/* Left: Badge + info */}
                    <div className="achievement-left">
                        <div className="achievement-badge">
                            {achievement.image_url ? (
                                <img
                                    src={achievement.image_url}
                                    alt={achievement.title}
                                    className="achievement-badge-img"
                                />
                            ) : (
                                <span className="achievement-badge-emoji">
                                    {achievement.badge || '🏆'}
                                </span>
                            )}
                        </div>
                        <div className="achievement-meta">
                            {achievement.tier && (
                                <span
                                    className="achievement-tier-tag"
                                    style={{ color: tier.glow, borderColor: tier.border }}
                                >
                                    {achievement.tier}
                                </span>
                            )}
                            <h3 className="achievement-title">{achievement.title || 'ACHIEVEMENT'}</h3>
                            {achievement.event && (
                                <p className="achievement-event">{achievement.event}</p>
                            )}
                        </div>
                    </div>

                    {/* Right: Prize + Date */}
                    <div className="achievement-right">
                        {achievement.prize && (
                            <div className="achievement-prize" style={{ color: tier.glow }}>
                                {achievement.prize}
                            </div>
                        )}
                        {achievement.date && (
                            <div className="achievement-date">{achievement.date}</div>
                        )}
                        <div className="achievement-arrow" style={{ color: tier.glow }}>
                            <ArrowRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Stat Counter Card ─── */
const StatCard = ({ icon: Icon, value, label, color }) => (
    <div className="ach-stat-card">
        <div className="ach-stat-icon" style={{ color, borderColor: `${color}33` }}>
            <Icon size={22} />
        </div>
        <div className="ach-stat-value" style={{ color }}>{value}</div>
        <div className="ach-stat-label">{label}</div>
    </div>
);

/* ─── Main Page ─── */
const AchievementPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const { data, error } = await supabase
                    .from('achievements')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data && data.length > 0) setAchievements(data);
                else setAchievements(SHOWCASE); // Fallback to showcase
            } catch {
                setAchievements(SHOWCASE);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, []);

    return (
        <div className="ach-page">
            {/* BG effects */}
            <div className="ach-bg-glow ach-bg-glow--red" />
            <div className="ach-bg-glow ach-bg-glow--purple" />
            <div className="ach-grid-overlay" />

            <div className="ach-container">
                {/* ── Header ── */}
                <header className="ach-header">
                    <div className="ach-header-tag">
                        <Zap size={12} /> HALL OF FAME
                    </div>
                    <h1 className="ach-h1">
                        OUR <span className="ach-h1-accent">ACHIEVEMENTS</span>
                    </h1>
                    <p className="ach-subtitle">
                        Built through blood, strategy, and relentless domination.<br />
                        Every trophy is a battle won, every rank a legacy cemented.
                    </p>
                </header>

                {/* ── Stats Bar ── */}
                <div className="ach-stats-bar">
                    <StatCard icon={Trophy}  value="12+"  label="TITLES WON"     color="#ffd700" />
                    <StatCard icon={Star}    value="$2M+"  label="PRIZE MONEY"    color="#ff1a1a" />
                    <StatCard icon={Target}  value="98%"   label="WIN RATE"       color="#7000ff" />
                    <StatCard icon={Zap}     value="3YRS"  label="ACTIVE STREAK"  color="#0070ff" />
                </div>

                {/* ── Achievement List ── */}
                <div className="ach-list">
                    {loading ? (
                        <div className="ach-loading">
                            <div className="ach-loading-dot" />
                            <span>Loading Hall of Fame...</span>
                        </div>
                    ) : (
                        achievements.map((ach, i) => (
                            <AchievementCard key={ach.id || i} achievement={ach} index={i} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AchievementPage;
