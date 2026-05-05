import React from 'react';
import { Trophy, Play, ArrowRight, Twitter, Twitch, MessageSquare, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        { name: 'BLOODKING', realName: 'Alex Chen', role: 'IGL', kd: '1.87', win: '78%', color: '#dc2626', img: 'https://picsum.photos/seed/p1/600/800' },
        { name: 'DEATHSHOT', realName: 'Maria Lopez', role: 'DUELIST', kd: '2.14', win: '82%', color: '#9333ea', img: 'https://picsum.photos/seed/p2/600/800' },
        { name: 'SHADOW', realName: 'Liam Park', role: 'RIFLER', kd: '1.65', win: '75%', color: '#dc2626', img: 'https://picsum.photos/seed/p3/600/800' },
        { name: 'VAMPIRE', realName: 'Sophia Reed', role: 'SUPPORT', kd: '1.42', win: '71%', color: '#9333ea', img: 'https://picsum.photos/seed/p4/600/800' }
    ];

    return (
        <section className="py-24 bg-[#05010d]">
            <div className="container-wide mx-auto px-6">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                    <h2 className="font-orbitron text-2xl font-black text-white uppercase italic flex items-center gap-4">
                        OUR LEGENDS <span className="w-12 h-[2px] bg-red-600"></span>
                    </h2>
                    <Link to="/members" className="text-[10px] text-gray-400 hover:text-white font-orbitron font-bold tracking-[0.2em] flex items-center gap-2 transition-colors uppercase">
                        View All Players <ArrowRight size={14} />
                    </Link>
                </div>

                <div ref={drag.ref} {...drag.props} className={`mobile-h-scroll ${drag.props.className}`}>
                    {legends.map((legend) => (
                        <div key={legend.name} className="legend-card-v2 group">
                            <div className="card-top">
                                <span className="role-tag" style={{ background: legend.color }}>{legend.role}</span>
                                <img src={legend.img} alt={legend.name} className="avatar-img" />
                                <div className="avatar-glow" style={{ background: legend.color }}></div>
                            </div>
                            <div className="card-body">
                                <h3 className="name">{legend.name}</h3>
                                <p className="real-name">{legend.realName}</p>
                                <div className="stats-row">
                                    <div className="stat">
                                        <span className="label">K/D RATIO</span>
                                        <span className="val" style={{ color: legend.color }}>{legend.kd}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">WIN RATE</span>
                                        <span className="val" style={{ color: legend.color }}>{legend.win}</span>
                                    </div>
                                </div>
                                <div className="socials-row">
                                    <Twitter size={14} />
                                    <MessageSquare size={14} />
                                    <Twitch size={14} />
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
    const achievements = [
        { rank: '1ST', title: 'VALORANT CHAMPIONS 2024', prize: '$250,000', date: 'DEC 15, 2024' },
        { rank: '2ND', title: 'VCT PACIFIC LEAGUE', prize: '$120,000', date: 'SEP 10, 2024' },
        { rank: '3RD', title: 'ESL PRO LEAGUE SEASON 19', prize: '$80,000', date: 'JUL 22, 2024' }
    ];

    const news = [
        { tag: 'CHAMPIONSHIP', title: 'BloodLovers Esports wins VCT Pacific 2024!', date: 'December 16, 2024', img: 'https://picsum.photos/seed/n1/400/200' },
        { tag: 'TEAM UPDATE', title: 'Welcome our new IGL BLOODKING!', date: 'November 28, 2024', img: 'https://picsum.photos/seed/n2/400/200' },
        { tag: 'ANNOUNCEMENT', title: 'BloodLovers partners with ROG!', date: 'November 15, 2024', img: 'https://picsum.photos/seed/n3/400/200' }
    ];

    return (
        <section className="py-24 bg-[#05010d] border-t border-white/5">
            <div className="container-wide mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">
                {/* ACHIEVEMENTS */}
                <div>
                    <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                        <h2 className="font-orbitron text-xl font-black text-white uppercase italic">ACHIEVEMENTS</h2>
                        <Link to="/achievement" className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">VIEW ALL →</Link>
                    </div>
                    <div className="space-y-6">
                        {achievements.map((ach, i) => (
                            <div key={i} className="ach-list-item group">
                                <div className={`rank-box ${i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze'}`}>
                                    <Trophy size={20} />
                                    <span>{ach.rank}</span>
                                </div>
                                <div className="ach-main">
                                    <h3 className="title">{ach.title}</h3>
                                    <div className="meta">
                                        <span className="prize text-red-600">{ach.prize}</span>
                                        <span className="dot"></span>
                                        <span className="date">{ach.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LATEST NEWS */}
                <div>
                    <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                        <h2 className="font-orbitron text-xl font-black text-white uppercase italic">LATEST NEWS</h2>
                        <Link to="/news" className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">VIEW ALL →</Link>
                    </div>
                    <div className="space-y-6">
                        {news.map((n, i) => (
                            <div key={i} className="news-list-item group">
                                <div className="img-wrap">
                                    <img src={n.img} alt="" />
                                </div>
                                <div className="content">
                                    <span className="tag">{n.tag}</span>
                                    <h3 className="title">{n.title}</h3>
                                    <p className="date">{n.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const MediaGallery = () => {
    const drag = useDraggableScroll();
    const media = [
        { title: 'VCT PACIFIC FINALS GRAND FINAL HIGHLIGHTS', img: 'https://picsum.photos/seed/m1/400/220' },
        { title: 'INSANE 1V4 CLUTCH - DEATHSHOT', img: 'https://picsum.photos/seed/m2/400/220' },
        { title: 'TEAM COMMS - FUNNY MOMENTS', img: 'https://picsum.photos/seed/m3/400/220' },
        { title: 'EPIC COMEBACK AGAINST DRX', img: 'https://picsum.photos/seed/m4/400/220' },
        { title: 'BEST PLAYS OF 2024 MONTAGE', img: 'https://picsum.photos/seed/m5/400/220' }
    ];

    return (
        <section className="py-24 bg-[#05010d] border-t border-white/5">
            <div className="container-wide mx-auto px-6">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                    <h2 className="font-orbitron text-xl font-black text-white uppercase italic flex items-center gap-4">
                        MEDIA GALLERY <span className="w-12 h-[2px] bg-red-600"></span>
                    </h2>
                    <Link to="/media" className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">VIEW ALL →</Link>
                </div>
                <div ref={drag.ref} {...drag.props} className={`mobile-h-scroll ${drag.props.className}`}>
                    {media.map((item, i) => (
                        <div key={i} className="media-card group">
                            <div className="img-wrap">
                                <img src={item.img} alt="" />
                                <div className="play-btn">
                                    <Play size={20} fill="white" />
                                </div>
                            </div>
                            <h3 className="title">{item.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Sponsors = () => {
    const sponsors = [
        'REPUBLIC OF GAMERS', 'HYPERX', 'MONSTER ENERGY', 'ZOWIE', 'CORSAIR', 'XPG'
    ];
    return (
        <section className="py-20 bg-[#05010d] border-t border-white/5">
            <div className="container-wide mx-auto px-6">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                    <h2 className="font-orbitron text-xs font-black text-white/40 uppercase tracking-[0.4em]">OUR SPONSORS</h2>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale hover:opacity-100 transition-all duration-700">
                    {sponsors.map(s => (
                        <div key={s} className="font-orbitron text-lg md:text-xl font-black tracking-tighter text-white select-none">{s}</div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const JoinSection = () => {
    return (
        <section className="py-24 bg-[#05010d]">
            <div className="container-wide mx-auto px-6">
                <div className="join-container-v2">
                    <div className="join-content">
                        <h2 className="title">JOIN THE BLOODLINE</h2>
                        <p className="desc">
                            Think you have what it takes to be a part of our legacy?<br />
                            Show us your skills and bleed with us.
                        </p>
                        <Link to="/signup" className="btn-join">
                            APPLY NOW <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="join-image">
                        <img src="https://picsum.photos/seed/soldier/800/600" alt="" />
                        <div className="image-overlay"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="footer-v2">
            <div className="container-wide mx-auto px-6">
                <div className="footer-grid">
                    <div className="brand-col">
                        <div className="footer-logo mb-6">
                            <span className="logo-text">BLOODLOVERS</span>
                            <span className="logo-subtext">ESPORTS</span>
                        </div>
                        <p className="about">
                            Built for domination.<br />
                            Driven by blood.<br />
                            United as one.
                        </p>
                        <div className="socials">
                            <Twitter size={16} />
                            <Twitch size={16} />
                            <MessageSquare size={16} />
                            <Play size={16} />
                            <ShoppingBag size={16} />
                        </div>
                    </div>
                    
                    <div className="links-col">
                        <h4>QUICK LINKS</h4>
                        <div className="links-grid">
                            <ul>
                                <li><Link to="/home">Home</Link></li>
                                <li><Link to="/members">Team</Link></li>
                                <li><Link to="/achievement">Achievements</Link></li>
                                <li><Link to="/media">Media</Link></li>
                            </ul>
                            <ul>
                                <li><Link to="/news">News</Link></li>
                                <li><Link to="/sponsors">Sponsors</Link></li>
                                <li><Link to="/signup">Join</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="contact-col">
                        <h4>CONTACT US</h4>
                        <ul>
                            <li><span className="icon">✉</span> hello@bloodlovers.gg</li>
                            <li><span className="icon">📞</span> +1 (555) 123-4567</li>
                            <li><span className="icon">📍</span> Los Angeles, California, USA</li>
                        </ul>
                    </div>

                    <div className="newsletter-col">
                        <h4>NEWSLETTER</h4>
                        <p>Subscribe to get the latest updates</p>
                        <div className="newsletter-form">
                            <input type="email" placeholder="Enter your email" />
                            <button>SUBSCRIBE</button>
                        </div>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>© 2024 BloodLovers Esports. All Rights Reserved.</p>
                    <div className="legal-links">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export { OurLegends, Achievements, Sponsors, JoinSection, Footer, MediaGallery };
