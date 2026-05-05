import React from 'react';
import { Trophy, Play, ArrowRight, Twitter, Twitch, MessageSquare, ShoppingBag } from 'lucide-react';

const OurLegends = () => {
    const legends = [
        { name: 'BLOODKING',  realName: 'Alex Chen',    role: 'IGL',     roleClass: 'role-igl',     kd: '1.87', win: '78%', img: 'https://picsum.photos/seed/bloodking/600/600' },
        { name: 'DEATHSHOT', realName: 'Maria Lopez',  role: 'DUELIST', roleClass: 'role-duelist', kd: '2.14', win: '82%', img: 'https://picsum.photos/seed/deathshot/600/600' },
        { name: 'SHADOW',    realName: 'Liam Park',    role: 'RIFLER',  roleClass: 'role-rifler',  kd: '1.65', win: '75%', img: 'https://picsum.photos/seed/shadow99/600/600' },
        { name: 'VAMPIRE',   realName: 'Sophia Reed',  role: 'SUPPORT', roleClass: 'role-support', kd: '1.42', win: '71%', img: 'https://picsum.photos/seed/vampire7/600/600' }
    ];

    return (
        <section className="legends-section">
            <div className="legends-bg-streaks">
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i} 
                        style={{ 
                            left: `${Math.random() * 100}%`, 
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }} 
                    />
                ))}
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <h2 className="font-orbitron text-xl md:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                            OUR LEGENDS <span className="w-12 h-[2px] bg-red-600 hidden md:block"></span>
                        </h2>
                    </div>
                    <a href="/members" className="text-[10px] text-gray-400 hover:text-white font-orbitron font-bold tracking-[0.2em] flex items-center gap-2 transition-all">
                        VIEW ALL PLAYERS <ArrowRight size={14} />
                    </a>
                </div>

                <div className="legends-frame">
                    <div className="legends-scroll-wrapper">
                        {legends.map((legend, index) => (
                            <div 
                                key={legend.name} 
                                className={`legend-card-container animate-in ${legend.roleClass}-border`}
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                <div className="legend-card">
                                    <div className="legend-img-wrap">
                                        <img src={legend.img} alt={legend.name} className="legend-img" />
                                        <span className={`legend-role ${legend.roleClass}`}>
                                            {legend.role}
                                        </span>
                                    </div>
                                    
                                    <div className="legend-info">
                                        <div className="text-center mb-6">
                                            <h3 className="legend-name">{legend.name}</h3>
                                            <p className="text-[10px] text-gray-500 font-orbitron tracking-widest mt-1 uppercase">{legend.realName}</p>
                                        </div>
                                        
                                        <div className="legend-stats-grid mb-6">
                                            <div className="stat-item">
                                                <span>K/D RATIO</span>
                                                <div className={`stat-value ${legend.roleClass}-text`}>{legend.kd}</div>
                                            </div>
                                            <div className="stat-item">
                                                <span>WIN RATE</span>
                                                <div className="stat-value">{legend.win}</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center gap-6 pt-4 border-t border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <Twitter size={16} className="text-white hover:text-red-500 cursor-pointer transition-colors" />
                                            <Twitch size={16} className="text-white hover:text-red-500 cursor-pointer transition-colors" />
                                            <MessageSquare size={16} className="text-white hover:text-red-500 cursor-pointer transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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

    return (
        <section className="py-32 bg-[#05010d] px-4 md:px-8 border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full"></div>
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
                {/* ACHIEVEMENTS */}
                <div className="animate-in-fade-up">
                    <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-6">
                        <h2 className="font-orbitron text-3xl font-black text-white uppercase tracking-tighter">
                            CORE <span className="text-red-600">ACHIEVEMENTS</span>
                        </h2>
                        <span className="text-[10px] text-gray-500 font-orbitron tracking-[0.3em] font-bold">HISTORICAL DATA</span>
                    </div>
                    <div className="space-y-6">
                        {achievements.map((item, idx) => (
                            <div key={idx} className="group flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-red-600/40 hover:bg-white/[0.04] transition-all duration-500 hover:-translate-y-1">
                                <div className={`w-16 h-16 flex items-center justify-center rounded-xl border ${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : idx === 1 ? 'bg-gray-400/10 border-gray-400/20 text-gray-400' : 'bg-orange-700/10 border-orange-700/20 text-orange-700'} shadow-2xl transition-transform group-hover:scale-110 group-hover:rotate-6`}>
                                    <Trophy size={32} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-orbitron text-[10px] font-black text-red-600 tracking-[0.3em] uppercase">{item.rank} PLACE</h4>
                                        <span className="bg-white/5 px-3 py-1 rounded text-white font-orbitron text-[10px] font-black border border-white/5">{item.prize}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-orbitron text-lg font-black text-white group-hover:text-red-500 transition-colors">{item.title}</h3>
                                        <span className="text-[10px] text-gray-500 font-orbitron font-bold tracking-widest">{item.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LATEST NEWS */}
                <div className="animate-in-fade-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-6">
                        <h2 className="font-orbitron text-3xl font-black text-white uppercase tracking-tighter">
                            INTEL <span className="text-red-600">FEED</span>
                        </h2>
                        <span className="text-[10px] text-gray-500 font-orbitron tracking-[0.3em] font-bold">LATEST UPDATES</span>
                    </div>
                    <div className="space-y-8">
                        <div className="flex gap-6 group cursor-pointer">
                            <div className="w-32 h-32 bg-[#0f0a1a] rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-red-600/40 transition-all duration-500">
                                <img src="https://picsum.photos/seed/vctnews/300/300" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] text-red-600 font-orbitron font-black tracking-[0.3em] mb-2 uppercase">CHAMPIONSHIP</span>
                                <h3 className="font-orbitron text-xl font-black text-white group-hover:text-red-500 transition-colors leading-tight mb-3">BloodLovers Esports wins VCT Pacific 2024!</h3>
                                <div className="flex items-center gap-4 text-gray-500 text-[10px] font-orbitron font-bold tracking-widest">
                                    <span>DECEMBER 16, 2024</span>
                                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                    <span className="group-hover:text-white transition-colors">READ INTEL →</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-6 group cursor-pointer">
                            <div className="w-32 h-32 bg-[#0f0a1a] rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-red-600/40 transition-all duration-500">
                                <img src="https://picsum.photos/seed/roster28/300/300" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[10px] text-red-600 font-orbitron font-black tracking-[0.3em] mb-2 uppercase">ROSTER</span>
                                <h3 className="font-orbitron text-xl font-black text-white group-hover:text-red-500 transition-colors leading-tight mb-3">Welcome our new IGL BLOODKING!</h3>
                                <div className="flex items-center gap-4 text-gray-500 text-[10px] font-orbitron font-bold tracking-widest">
                                    <span>NOVEMBER 28, 2024</span>
                                    <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                    <span className="group-hover:text-white transition-colors">READ INTEL →</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
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
        <section className="relative py-48 bg-[#05010d] overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/joinbg/1920/1080')] bg-cover bg-fixed opacity-[0.03]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#05010d] via-transparent to-[#05010d]"></div>
                {/* Neon Glow Effects */}
                <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-red-600/10 blur-[150px] -translate-y-1/2 rounded-full"></div>
                <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] -translate-y-1/2 rounded-full"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <div className="inline-block px-4 py-1 bg-red-600/10 border border-red-500/20 rounded-full mb-8 animate-pulse">
                    <span className="text-[10px] font-black text-red-500 font-orbitron tracking-[0.4em] uppercase">Recruitment Live</span>
                </div>
                
                <h2 className="font-orbitron text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-none italic">
                    JOIN THE <span className="text-red-600 glow-text">BLOODLINE</span>
                </h2>
                
                <p className="max-w-2xl mx-auto text-gray-400 font-inter text-lg md:text-xl mb-12 leading-relaxed opacity-80">
                    Think you have what it takes to be a part of our legacy? <br className="hidden md:block" />
                    Forge your destiny with the ultimate esports family.
                </p>
                
                <div className="flex justify-center gap-6">
                    <button className="btn-primary group px-12 py-5 text-lg">
                        APPLY FOR TRIALS <ArrowRight className="inline ml-3 transition-transform group-hover:translate-x-2" size={24} />
                    </button>
                </div>
            </div>
        </section>
    );
};

const Footer = () => {
    return (
        <footer className="bg-black py-20 px-4 md:px-8 border-t border-white/5">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                <div className="col-span-1 lg:col-span-1">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="font-orbitron font-black text-2xl tracking-tighter text-white">BLOODLOVERS</div>
                    </div>
                    <p className="text-gray-500 text-xs font-inter leading-relaxed max-w-xs">
                        Built for domination. Driven by blood. United as one. 
                        The premier esports organization in the region.
                    </p>
                    <div className="flex gap-4 mt-8 text-gray-500">
                        <Twitter size={18} className="hover:text-red-600 cursor-pointer" />
                        <Twitch size={18} className="hover:text-red-600 cursor-pointer" />
                        <MessageSquare size={18} className="hover:text-red-600 cursor-pointer" />
                    </div>
                </div>

                <div>
                    <h4 className="font-orbitron text-[10px] font-bold text-white tracking-[0.3em] uppercase mb-8">Quick Links</h4>
                    <ul className="space-y-4 font-orbitron text-[11px] text-gray-500 font-bold tracking-widest">
                        <li className="hover:text-red-600 cursor-pointer transition-colors">HOME</li>
                        <li className="hover:text-red-600 cursor-pointer transition-colors">TEAM</li>
                        <li className="hover:text-red-600 cursor-pointer transition-colors">ACHIEVEMENTS</li>
                        <li className="hover:text-red-600 cursor-pointer transition-colors">MEDIA</li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-orbitron text-[10px] font-bold text-white tracking-[0.3em] uppercase mb-8">Contact Us</h4>
                    <ul className="space-y-4 font-inter text-xs text-gray-500">
                        <li className="flex items-center gap-3">
                            <span className="text-red-600">E:</span> hello@bloodlovers.gg
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-red-600">P:</span> +1 (555) 123-4567
                        </li>
                        <li className="flex items-center gap-3">
                            <span className="text-red-600">L:</span> Los Angeles, California, USA
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-orbitron text-[10px] font-bold text-white tracking-[0.3em] uppercase mb-8">Newsletter</h4>
                    <p className="text-gray-500 text-[10px] font-orbitron tracking-widest mb-6">SUBSCRIBE TO GET THE LATEST UPDATES</p>
                    <div className="flex flex-col gap-3">
                        <input type="email" placeholder="ENTER YOUR EMAIL" className="bg-[#0f0a1a] border border-white/10 px-4 py-3 text-[10px] font-orbitron text-white focus:border-red-600 outline-none" />
                        <button className="btn-primary w-full text-[10px] py-3">SUBSCRIBE</button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[9px] text-gray-600 font-orbitron tracking-widest">© 2024 BLOODLOVERS ESPORTS. ALL RIGHTS RESERVED.</p>
                <div className="flex gap-8 text-[9px] text-gray-600 font-orbitron tracking-widest">
                    <span className="hover:text-white cursor-pointer transition-colors">PRIVACY POLICY</span>
                    <span className="hover:text-white cursor-pointer transition-colors">TERMS OF SERVICE</span>
                </div>
            </div>
        </footer>
    );
};

export { OurLegends, Achievements, Sponsors, JoinSection, Footer };
