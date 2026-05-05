import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Play, ArrowRight, Twitter, Twitch, MessageSquare } from 'lucide-react';

const OurLegends = () => {
    const legends = [
        { name: 'BLOODKING',  realName: 'Alex Chen',    role: 'IGL',     roleClass: 'role-igl',     kd: '1.87', win: '78%', img: 'https://picsum.photos/seed/bloodking/600/600' },
        { name: 'DEATHSHOT', realName: 'Maria Lopez',  role: 'DUELIST', roleClass: 'role-duelist', kd: '2.14', win: '82%', img: 'https://picsum.photos/seed/deathshot/600/600' },
        { name: 'SHADOW',    realName: 'Liam Park',    role: 'RIFLER',  roleClass: 'role-rifler',  kd: '1.65', win: '75%', img: 'https://picsum.photos/seed/shadow99/600/600' },
        { name: 'VAMPIRE',   realName: 'Sophia Reed',  role: 'SUPPORT', roleClass: 'role-support', kd: '1.42', win: '71%', img: 'https://picsum.photos/seed/vampire7/600/600' }
    ];

    return (
        <section className="legends-section pt-12 pb-24">
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

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex justify-between items-center mb-16">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-red-600 rounded-full" />
                        <h2 className="font-orbitron text-2xl font-black text-white uppercase tracking-tighter">Our Legends</h2>
                    </div>
                    <Link to="/members" className="font-orbitron text-[10px] font-black text-gray-500 hover:text-white tracking-[0.3em] flex items-center gap-2 transition-all">
                        VIEW ALL PLAYERS <ArrowRight size={14} className="text-red-600" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {legends.map((legend, index) => (
                        <div 
                            key={legend.name} 
                            className={`legend-card-container animate-in ${legend.roleClass}-border`}
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            <div className="legend-card group">
                                <div className="legend-img-wrap overflow-hidden relative">
                                    <img src={legend.img} alt={legend.name} className="legend-img transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <span className={`legend-role ${legend.roleClass} absolute top-4 left-4 z-20`}>
                                        {legend.role}
                                    </span>
                                </div>
                                
                                <div className="legend-info p-6">
                                    <div className="text-center mb-6">
                                        <h3 className="legend-name font-orbitron text-xl font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{legend.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-orbitron tracking-[0.3em] mt-1 uppercase font-bold">{legend.realName}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-white/5">
                                        <div className="text-center">
                                            <p className="text-[8px] text-gray-500 font-orbitron font-bold tracking-widest uppercase mb-1">K/D Ratio</p>
                                            <div className={`font-orbitron text-lg font-black ${legend.roleClass}-text`}>{legend.kd}</div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[8px] text-gray-500 font-orbitron font-bold tracking-widest uppercase mb-1">Win Rate</p>
                                            <div className="font-orbitron text-lg font-black text-white">{legend.win}</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-6 pt-4 border-t border-white/5 opacity-30 group-hover:opacity-100 transition-opacity">
                                        <Twitter size={14} className="text-white hover:text-red-500 cursor-pointer transition-colors" />
                                        <Twitch size={14} className="text-white hover:text-red-500 cursor-pointer transition-colors" />
                                        <MessageSquare size={14} className="text-white hover:text-red-500 cursor-pointer transition-colors" />
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

const AchievementAndIntel = () => {
    return (
        <section className="relative py-24 bg-[#05010d] overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    
                    {/* CORE ACHIEVEMENTS */}
                    <div className="animate-in fade-in slide-in-from-left duration-1000">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-8 bg-red-600 rounded-full" />
                                <h2 className="font-orbitron text-2xl font-black text-white uppercase tracking-tighter">Core Achievements</h2>
                            </div>
                            <span className="font-orbitron text-[9px] text-gray-600 font-black tracking-[0.4em] uppercase">Historical Data</span>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                { rank: '1ST', title: 'VALORANT CHAMPIONS 2024', prize: '$250,000', date: 'DEC 15, 2024', color: 'text-yellow-500' },
                                { rank: '2ND', title: 'VCT PACIFIC LEAGUE', prize: '$120,000', date: 'SEP 10, 2024', color: 'text-gray-400' },
                                { rank: '3RD', title: 'ESL PRO LEAGUE SEASON 19', prize: '$80,000', date: 'JUL 22, 2024', color: 'text-orange-600' }
                            ].map((item, idx) => (
                                <div key={idx} className="group flex items-center gap-6 p-6 bg-white/[0.01] border border-white/5 rounded-2xl hover:border-red-600/30 hover:bg-white/[0.03] transition-all duration-500">
                                    <div className={`w-14 h-14 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 font-orbitron font-black text-lg ${item.color} group-hover:scale-110 transition-transform`}>
                                        <Trophy size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-orbitron text-[9px] font-black text-red-600 tracking-[0.3em] uppercase">{item.rank} PLACE</span>
                                            <span className="font-orbitron text-sm font-black text-white tracking-tight italic">{item.prize}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-orbitron text-base font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight">{item.title}</h4>
                                            <span className="font-orbitron text-[9px] text-gray-600 font-bold uppercase tracking-widest">{item.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link to="/achievement" className="mt-8 inline-flex items-center gap-2 font-orbitron text-[10px] font-black text-gray-500 hover:text-white tracking-[0.3em] transition-all uppercase">
                            VIEW ALL RECORDS <ArrowRight size={14} className="text-red-600" />
                        </Link>
                    </div>

                    {/* INTEL FEED */}
                    <div className="animate-in fade-in slide-in-from-right duration-1000">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-8 bg-red-600 rounded-full" />
                                <h2 className="font-orbitron text-2xl font-black text-white uppercase tracking-tighter">Intel Feed</h2>
                            </div>
                            <span className="font-orbitron text-[9px] text-gray-600 font-black tracking-[0.4em] uppercase">Latest Updates</span>
                        </div>
                        
                        <div className="space-y-8">
                            {[
                                { tag: 'CHAMPIONSHIP', title: 'BloodLovers Esports wins VCT Pacific 2024!', date: 'DECEMBER 16, 2024', img: 'https://picsum.photos/seed/vctwin1/300/300' },
                                { tag: 'ROSTER', title: 'Welcome our new IGL BLOODKING!', date: 'NOVEMBER 28, 2024', img: 'https://picsum.photos/seed/iglking1/300/300' },
                                { tag: 'PARTNERSHIP', title: 'BloodLovers partners with ROG!', date: 'NOVEMBER 15, 2024', img: 'https://picsum.photos/seed/rogpartner1/300/300' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 group cursor-pointer">
                                    <div className="w-24 h-24 bg-[#0f0a1a] rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-red-600/40 transition-all duration-500">
                                        <img src={item.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <span className="text-[9px] text-red-600 font-orbitron font-black tracking-[0.3em] mb-2 uppercase italic">{item.tag}</span>
                                        <h3 className="font-orbitron text-lg font-black text-white group-hover:text-red-500 transition-colors leading-tight mb-2 uppercase tracking-tight">{item.title}</h3>
                                        <div className="flex items-center gap-4 text-gray-500 text-[9px] font-orbitron font-bold tracking-widest uppercase">
                                            <span>{item.date}</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                            <span className="group-hover:text-white transition-colors">READ INTEL →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const MediaGallery = () => {
    const videos = [
        { title: 'VCT Pacific Finals Highlights', img: 'https://picsum.photos/seed/vcth/400/225' },
        { title: 'Insane 1v4 Clutch - DeathShot', img: 'https://picsum.photos/seed/clutch1/400/225' },
        { title: 'Team Comms: Funny Moments', img: 'https://picsum.photos/seed/comms1/400/225' },
        { title: 'Epic Comeback vs DRX', img: 'https://picsum.photos/seed/drx1/400/225' },
        { title: 'Best Plays of 2024 Montage', img: 'https://picsum.photos/seed/montage1/400/225' }
    ];

    return (
        <section className="relative py-24 bg-[#020105] overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-red-600 rounded-full" />
                        <h2 className="font-orbitron text-2xl font-black text-white uppercase tracking-tighter">Media Gallery</h2>
                    </div>
                    <Link to="/media" className="font-orbitron text-[10px] font-black text-gray-500 hover:text-white tracking-[0.3em] transition-all uppercase">VIEW ALL VIDEO →</Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {videos.map((vid, idx) => (
                        <div key={idx} className="group cursor-pointer">
                            <div className="relative aspect-video bg-[#0f0a1a] rounded-2xl overflow-hidden border border-white/5 group-hover:border-red-600/40 transition-all duration-500">
                                <img src={vid.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                        <Play size={20} className="text-white ml-1 fill-white" />
                                    </div>
                                </div>
                            </div>
                            <h4 className="font-orbitron text-[10px] font-black text-white/50 group-hover:text-white transition-colors mt-4 uppercase tracking-[0.2em] leading-tight text-center">{vid.title}</h4>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const SponsorsSection = () => {
    const sponsors = [
        { name: 'Republic of Gamers', logo: 'https://picsum.photos/seed/roglogo1/200/60' },
        { name: 'HyperX', logo: 'https://picsum.photos/seed/hxlogo1/200/60' },
        { name: 'Monster Energy', logo: 'https://picsum.photos/seed/monsterlogo1/200/60' },
        { name: 'Zowie', logo: 'https://picsum.photos/seed/zowie1/200/60' },
        { name: 'Corsair', logo: 'https://picsum.photos/seed/corsair1/200/60' },
        { name: 'XPG', logo: 'https://picsum.photos/seed/xpglogo1/200/60' }
    ];

    return (
        <section className="py-16 bg-[#05010d] border-t border-b border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30">
                    {sponsors.map((s, idx) => (
                        <div key={idx} className="h-6 md:h-8 hover:opacity-100 transition-opacity grayscale brightness-200">
                            <img src={s.logo} alt={s.name} className="h-full w-auto object-contain" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const JoinSection = () => {
    return (
        <section className="relative py-48 bg-[#05010d] overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/joinbg1/1920/1080')] bg-cover bg-fixed opacity-[0.03]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#05010d] via-transparent to-[#05010d]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="max-w-4xl mx-auto">
                    <span className="font-orbitron text-red-600 font-black tracking-[0.5em] text-[10px] mb-8 block animate-pulse uppercase italic">Operational Status: Recruitment Live</span>
                    <h2 className="font-orbitron text-7xl md:text-9xl font-black text-white mb-10 tracking-tighter uppercase italic leading-none">
                        JOIN THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">BLOODLINE</span>
                    </h2>
                    <p className="font-inter text-gray-400 text-lg md:text-xl mb-14 leading-relaxed max-w-2xl mx-auto opacity-80">
                        Think you have what it takes to be a part of our legacy? <br />
                        Show us your skills and <span className="text-red-500 font-bold">bleed</span> with us.
                    </p>
                    <button className="group relative px-12 py-6 bg-red-600 overflow-hidden rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(220,38,38,0.4)]">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="relative font-orbitron font-black text-white tracking-[0.3em] flex items-center gap-4 text-sm">
                            APPLY FOR TRIALS
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export { OurLegends, AchievementAndIntel, MediaGallery, SponsorsSection, JoinSection };
