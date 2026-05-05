import React from 'react';
// Cache bust: Scroll indicator removed
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection = () => {

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-[#05010d]">
            {/* ── Background layers ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Background Image from reference */}
                <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/esportsbg/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                
                {/* Grid */}
                <div className="absolute inset-0 bg-grid opacity-40" />
                
                {/* Red radial glow — center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/15 rounded-full blur-[180px]" />
                
                {/* Purple radial glow — center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-[160px]" />
                
                {/* Scanline sweep */}
                <div
                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent animate-scan z-10"
                    style={{ top: '0' }}
                />
            </div>

            {/* ── Main content ── */}
            <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">

                {/* Eyebrow badge */}
                <div className="flex flex-col items-center mb-6">
                    <span className="font-orbitron text-[10px] font-black text-red-600 tracking-[0.6em] uppercase mb-4">
                        BUILT FOR DOMINATION
                    </span>
                    <div className="w-12 h-[1px] bg-red-600/40"></div>
                </div>

                {/* Main heading */}
                <div className="mb-8">
                    <h1 className="hero-h1 mb-2 leading-none">
                        <span className="text-white">BLOODLOVERS</span><br />
                        <span className="hero-accent tracking-[0.2em] text-red-600">ESPORTS</span>
                    </h1>
                </div>

                {/* Subtitle */}
                <p className="hero-desc max-w-xl mx-auto mb-12 text-center text-gray-400">
                    We are not just a team. We are a family.<br />
                    We <span className="text-red-500 font-bold">bleed</span> together. We <span className="text-purple-500 font-bold">win</span> together.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 mb-24">
                    <button className="btn-primary flex items-center gap-3 px-10 py-4 text-xs font-black tracking-widest uppercase">
                        <Play size={16} fill="currentColor" />
                        WATCH HIGHLIGHTS
                    </button>
                    <Link to="/signup" className="btn-outline flex items-center gap-3 px-10 py-4 text-xs font-black tracking-widest uppercase border-white/20 hover:border-white">
                        JOIN TEAM
                    </Link>
                </div>

                {/* Scroll Indicator */}
                <div className="flex flex-col items-center gap-4 opacity-40 animate-bounce">
                    <div className="w-[20px] h-[30px] border-2 border-white rounded-full flex justify-center p-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-scroll-dot"></div>
                    </div>
                    <span className="font-orbitron text-[8px] font-black tracking-[0.4em] uppercase text-white">Scroll Down</span>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;
