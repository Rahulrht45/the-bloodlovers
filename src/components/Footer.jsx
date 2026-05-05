import { Twitter, Twitch, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#020105] pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                    
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div className="flex flex-col leading-none">
                            <span className="font-orbitron font-black text-2xl tracking-tighter text-white">BLOODLOVERS</span>
                            <span className="font-orbitron text-[10px] tracking-[0.4em] text-red-600 font-bold uppercase mt-1">Esports</span>
                        </div>
                        <p className="text-gray-500 text-xs font-inter leading-relaxed max-w-xs">
                            Built for domination. Driven by blood. United as one. 
                            We are more than an organization — we are a legacy in the making.
                        </p>
                        <div className="flex gap-5 text-gray-500">
                            {[Twitter, Twitch, MessageSquare].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:text-red-500 hover:border-red-600/30 transition-all group">
                                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-orbitron text-[10px] font-black text-white tracking-[0.3em] uppercase mb-10 border-l-2 border-red-600 pl-4">Quick Links</h4>
                        <ul className="space-y-5 font-orbitron text-[10px] text-gray-500 font-bold tracking-[0.2em]">
                            {['Home', 'Team', 'Achievements', 'Media', 'Matches', 'News', 'Sponsors'].map((item) => (
                                <li key={item} className="hover:text-red-600 cursor-pointer transition-colors flex items-center gap-2 group">
                                    <span className="w-0 h-px bg-red-600 transition-all group-hover:w-3" />
                                    {item.toUpperCase()}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h4 className="font-orbitron text-[10px] font-black text-white tracking-[0.3em] uppercase mb-10 border-l-2 border-red-600 pl-4">Contact Us</h4>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 group">
                                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <Mail size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-600 font-orbitron font-bold tracking-widest uppercase mb-1">Email Intel</p>
                                    <p className="text-xs text-gray-300 font-inter">hello@bloodlovers.gg</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <Phone size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-600 font-orbitron font-bold tracking-widest uppercase mb-1">Secure Line</p>
                                    <p className="text-xs text-gray-300 font-inter">+1 (555) 123-4567</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4 group">
                                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <MapPin size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-600 font-orbitron font-bold tracking-widest uppercase mb-1">HQ Location</p>
                                    <p className="text-xs text-gray-300 font-inter leading-relaxed">Los Angeles, California, USA</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-orbitron text-[10px] font-black text-white tracking-[0.3em] uppercase mb-10 border-l-2 border-red-600 pl-4">Newsletter</h4>
                        <p className="text-gray-500 text-[10px] font-orbitron font-bold tracking-widest mb-6 leading-relaxed uppercase">
                            Subscribe to receive the latest <br /> operational updates.
                        </p>
                        <div className="flex flex-col gap-3">
                            <input 
                                type="email" 
                                placeholder="ENTER YOUR EMAIL" 
                                className="bg-white/[0.02] border border-white/10 px-5 py-4 text-[10px] font-orbitron text-white focus:border-red-600/50 outline-none transition-all rounded-xl" 
                            />
                            <button className="relative group overflow-hidden bg-red-600 px-5 py-4 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                                <span className="relative font-orbitron font-black text-white text-[10px] tracking-[0.2em]">SUBSCRIBE NOW</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[9px] text-gray-600 font-orbitron font-bold tracking-[0.3em] uppercase">
                        © 2024 BLOODLOVERS ESPORTS. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex gap-10 text-[9px] text-gray-600 font-orbitron font-bold tracking-[0.3em] uppercase">
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Cookie Policy</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
