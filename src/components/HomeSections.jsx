import React from 'react';
import { Trophy, Play, ArrowRight, Twitter, Twitch, MessageSquare, ShoppingBag } from 'lucide-react';

const useDraggableScroll = () => {
    const ref = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [startX, setStartX] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);

    const onMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - ref.current.offsetLeft);
        setScrollLeft(ref.current.scrollLeft);
        ref.current.style.scrollBehavior = 'auto';
        ref.current.style.scrollSnapType = 'none';
    };

    const onMouseLeave = () => {
        setIsDragging(false);
        if (ref.current) {
            ref.current.style.scrollBehavior = 'smooth';
            ref.current.style.scrollSnapType = 'x mandatory';
        }
    };

    const onMouseUp = () => {
        setIsDragging(false);
        if (ref.current) {
            ref.current.style.scrollBehavior = 'smooth';
            ref.current.style.scrollSnapType = 'x mandatory';
        }
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX) * 2;
        ref.current.scrollLeft = scrollLeft - walk;
    };

    return {
        ref,
        isDragging,
        props: {
            onMouseDown,
            onMouseLeave,
            onMouseUp,
            onMouseMove,
            className: isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }
    };
};

const OurLegends = () => {
    const drag = useDraggableScroll();
    const legends = [
        { 
            name: 'BLOODKING',  
            realName: 'Alex Chen',    
            role: 'IGL',     
            kd: '1.87', 
            win: '78%', 
            color: '#dc2626',
            img: 'https://picsum.photos/seed/p1/600/800' 
        },
        { 
            name: 'DEATHSHOT', 
            realName: 'Maria Lopez',  
            role: 'DUELIST', 
            kd: '2.14', 
            win: '82%', 
            color: '#9333ea',
            img: 'https://picsum.photos/seed/p2/600/800' 
        },
        { 
            name: 'SHADOW',    
            realName: 'Liam Park',    
            role: 'RIFLER',  
            kd: '1.65', 
            win: '75%', 
            color: '#dc2626',
            img: 'https://picsum.photos/seed/p3/600/800' 
        },
        { 
            name: 'VAMPIRE',   
            realName: 'Sophia Reed',  
            role: 'SUPPORT', 
            kd: '1.42', 
            win: '71%', 
            color: '#9333ea',
            img: 'https://picsum.photos/seed/p4/600/800' 
        }
    ];

    return (
        <section className="legends-section">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none"></div>
            
            <div className="container-wide mx-auto px-6 relative z-10">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 border-b border-white/10 pb-4 gap-4">
                    <h2 className="font-orbitron text-2xl md:text-3xl font-black text-white uppercase italic flex items-center gap-3 tracking-tighter">
                        OUR LEGENDS <span className="w-6 h-[3px] bg-red-600"></span>
                    </h2>
                    <a href="/members" className="text-[10px] text-gray-400 hover:text-white font-orbitron font-bold tracking-[0.2em] flex items-center gap-2 transition-colors uppercase">
                        View All Players <ArrowRight size={14} />
                    </a>
                </div>

                {/* Grid */}
                <div 
                    ref={drag.ref}
                    {...drag.props}
                    className={`mobile-h-scroll ${drag.props.className}`}
                >
                    {legends.map((legend, index) => (
                        <div 
                            key={legend.name} 
                            className="legend-card-container animate-in select-none"
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            <div 
                                className="legend-card group" 
                                style={{ '--card-color': legend.color }}
                            >
                                <div className="legend-img-wrap">
                                    <span 
                                        className="legend-role" 
                                        style={{ backgroundColor: legend.color }}
                                    >
                                        {legend.role}
                                    </span>
                                    <img src={legend.img} alt={legend.name} className="legend-img pointer-events-none" />
                                    <div className="img-overlay-gradient"></div>
                                </div>
                                
                                <div className="legend-info">
                                    <div className="text-center mb-5">
                                        <h3 className="legend-name">{legend.name}</h3>
                                        <p className="legend-realname">{legend.realName}</p>
                                    </div>
                                    
                                    <div className="legend-stats">
                                        <div className="stat-col">
                                            <span className="stat-label">K/D RATIO</span>
                                            <span className="stat-val" style={{ color: legend.color }}>{legend.kd}</span>
                                        </div>
                                        <div className="stat-col">
                                            <span className="stat-label">WIN RATE</span>
                                            <span className="stat-val" style={{ color: legend.color }}>{legend.win}</span>
                                        </div>
                                    </div>

                                    <div className="legend-socials">
                                        <Twitter size={15} />
                                        <Twitch size={15} />
                                        <MessageSquare size={15} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Achievements = () => {
    const drag = useDraggableScroll();
    const achievements = [
        { rank: '1ST', title: 'VALORANT CHAMPIONS 2024', prize: '$250,000', date: 'DEC 15, 2024' },
        { rank: '2ND', title: 'VCT PACIFIC LEAGUE', prize: '$120,000', date: 'SEP 10, 2024' },
        { rank: '3RD', title: 'ESL PRO LEAGUE SEASON 19', prize: '$80,000', date: 'JUL 22, 2024' }
    ];

    return (
        <section className="py-48 bg-[#05010d] px-4 md:px-8 border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full"></div>
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 relative z-10">
                {/* ACHIEVEMENTS */}
                <div className="animate-in-fade-up">
                    <div className="flex flex-col mb-12 border-l-4 border-red-600 pl-6">
                        <h2 className="font-orbitron text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                            CORE <span className="text-red-600">ACHIEVEMENTS</span>
                        </h2>
                        <span className="text-[10px] text-gray-500 font-orbitron tracking-[0.4em] font-bold uppercase opacity-60">Success & Milestones</span>
                    </div>
                    <div 
                        ref={drag.ref}
                        {...drag.props}
                        className={`mobile-h-scroll ${drag.props.className}`}
                    >
                        {achievements.map((item, idx) => (
                            <div key={idx} className="ach-card group select-none">
                                <div className={`ach-icon-box ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : 'bronze'}`}>
                                    <Trophy size={24} className="sm:w-8 sm:h-8" />
                                </div>
                                <div className="ach-info">
                                    <div className="ach-top-meta">
                                        <span className="ach-rank">{item.rank} PLACE</span>
                                        <span className="ach-prize">{item.prize}</span>
                                    </div>
                                    <div className="ach-main-meta">
                                        <h3 className="ach-title">{item.title}</h3>
                                        <span className="ach-date">{item.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LATEST NEWS */}
                <div className="animate-in-fade-up" style={{ animationDelay: '0.2s' }}>
                    <NewsFeed />
                </div>
            </div>
        </section>
    );
};

const NewsFeed = () => {
    const drag = useDraggableScroll();
    return (
        <>
            <div className="flex flex-col mb-12 border-l-4 border-purple-600 pl-6">
                <h2 className="font-orbitron text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                    INTEL <span className="text-purple-600">FEED</span>
                </h2>
                <span className="text-[10px] text-gray-500 font-orbitron tracking-[0.4em] font-bold uppercase opacity-60">Latest Updates & News</span>
            </div>
            <div 
                ref={drag.ref}
                {...drag.props}
                className={`news-grid-scroll ${drag.props.className}`}
            >
                <div className="news-card group select-none">
                    <div className="news-img-wrap">
                        <img src="https://picsum.photos/seed/vctnews/400/300" className="news-img" alt="VCT News" />
                        <div className="news-tag">CHAMPIONSHIP</div>
                    </div>
                    <div className="news-content">
                        <h3 className="news-title">BloodLovers Esports wins VCT Pacific 2024!</h3>
                        <div className="news-footer">
                            <span className="news-date">DECEMBER 16, 2024</span>
                            <span className="news-link">READ INTEL →</span>
                        </div>
                    </div>
                </div>
                <div className="news-card group select-none">
                    <div className="news-img-wrap">
                        <img src="https://picsum.photos/seed/roster28/400/300" className="news-img" alt="Roster News" />
                        <div className="news-tag">ROSTER</div>
                    </div>
                    <div className="news-content">
                        <h3 className="news-title">Welcome our new IGL BLOODKING!</h3>
                        <div className="news-footer">
                            <span className="news-date">NOVEMBER 28, 2024</span>
                            <span className="news-link">READ INTEL →</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const Sponsors = () => {
    return (
        <section className="sponsor-marquee-container">
            <div className="banner-sparks"></div>
            <div className="marquee-content">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="sponsor-banner-item">
                        <div className="kia-mart-logo-wrap">
                            <div className="kia-mart-text">
                                <div className="p-2 bg-red-600/10 rounded-lg border border-red-500/20 shadow-lg">
                                    <ShoppingBag className="text-red-600 shopping-bag-icon" size={32} />
                                </div>
                                KIA MART
                            </div>
                            <span className="kia-mart-tagline">Smart Shopping Experience</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const JoinSection = () => {
    return (
        <section className="join-section">
            <div className="join-bg-overlay">
                <div className="glow-red"></div>
                <div className="glow-purple"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="flex flex-col items-center">
                    <div className="join-badge animate-pulse mb-8">
                        <span className="dot"></span>
                        <span className="text">RECRUITMENT ACTIVE</span>
                    </div>
                    
                    <h2 className="join-title mb-8">
                        JOIN THE <span className="highlight">BLOODLINE</span>
                    </h2>
                    
                    <p className="join-desc mb-12">
                        Think you have what it takes to be a part of our legacy? <br className="hidden md:block" />
                        Forge your destiny with the ultimate esports family.
                    </p>
                    
                    <button className="btn-join-premium group">
                        APPLY FOR TRIALS 
                        <ArrowRight className="arrow" size={24} />
                        <div className="btn-glow"></div>
                    </button>
                </div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="footer-main">
            <div className="container-wide mx-auto px-6">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo mb-6">
                            <span className="logo-text">BLOODLOVERS</span>
                            <span className="logo-subtext">ESPORTS</span>
                        </div>
                        <p className="footer-about">
                            Built for domination. Driven by blood. United as one. 
                            The premier esports organization in the region.
                        </p>
                        <div className="footer-socials">
                            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" aria-label="Twitch"><Twitch size={20} /></a>
                            <a href="#" aria-label="Discord"><MessageSquare size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-links-col">
                        <h4 className="footer-heading">OPERATIONS</h4>
                        <ul className="footer-links">
                            <li><a href="/home">Command Center</a></li>
                            <li><a href="/members">Roster Intel</a></li>
                            <li><a href="/achievement">Hall of Fame</a></li>
                            <li><a href="/matches">Combat Logs</a></li>
                        </ul>
                    </div>

                    <div className="footer-links-col">
                        <h4 className="footer-heading">ENCRYPTED</h4>
                        <ul className="footer-links">
                            <li><a href="/news">News Archive</a></li>
                            <li><a href="/sponsors">Partners</a></li>
                            <li><a href="/signup">Join Forces</a></li>
                            <li><a href="/wallet">Bank</a></li>
                        </ul>
                    </div>

                    <div className="footer-newsletter">
                        <h4 className="footer-heading">INTEL SYNC</h4>
                        <p className="newsletter-text">Subscribe to receive classified updates.</p>
                        <div className="newsletter-form">
                            <input type="email" placeholder="ENTER OPERATIVE EMAIL" className="newsletter-input" />
                            <button className="newsletter-btn">SUBSCRIBE</button>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="copyright text-center">© 2024 BLOODLOVERS ESPORTS. ESTABLISHED FOR DOMINATION.</p>
                </div>
            </div>
        </footer>
    );
};

export { OurLegends, Achievements, Sponsors, JoinSection, Footer };
