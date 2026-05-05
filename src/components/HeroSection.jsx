import React from 'react';
// Cache bust: Scroll indicator removed
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection = () => {

    return (
        <section 
            className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-[var(--bg-dark)]"
            style={{ 
                backgroundImage: 'var(--hero-bg-image)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            {/* ── Background layers ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Grid */}
                <div className="absolute inset-0 bg-grid opacity-60" />
                {/* Red radial glow — top left */}
                <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-[var(--accent-red)]/10 rounded-full blur-[160px]" />
                {/* Purple radial glow — bottom right */}
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[var(--accent-purple)]/10 rounded-full blur-[160px]" />
                {/* Scanline sweep */}
                <div
                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-red)]/40 to-transparent animate-scan z-10"
                    style={{ top: '0' }}
                />
            </div>

            {/* ── Main content ── */}
            <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">

                {/* Eyebrow badge */}
                <div className="flex flex-col items-center mb-6">
                    <span className="font-orbitron text-[10px] font-black text-[var(--accent-red)] tracking-[0.6em] uppercase mb-2">
                        BUILT FOR DOMINATION
                    </span>
                    <div className="w-12 h-0.5 bg-[var(--accent-red)]/40"></div>
                </div>

                {/* Main heading */}
                <h1 className="hero-h1 mb-8 max-w-5xl">
                    <span className="text-[var(--text-main)] block mb-2 italic">BLOODLOVERS</span>
                    <span className="text-[var(--accent-red)] block italic opacity-90">ESPORTS</span>
                </h1>

                {/* Subtitle */}
                <div className="hero-desc max-w-xl mx-auto mb-14 text-center">
                    <p className="text-[var(--text-main)]/80 mb-2 font-medium tracking-tight">
                        We are not just a team. We are a family.
                    </p>
                    <p className="font-orbitron text-xs font-bold tracking-widest uppercase">
                        We <span className="text-[var(--accent-red)]">bleed</span> together. We <span className="text-[var(--accent-purple)]">win</span> together.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 mb-20 items-center">
                    <Link to="/mvp" className="btn-primary group flex items-center gap-3 px-10 py-5 text-sm shadow-2xl shadow-[var(--accent-red)]/20">
                        <Play size={18} fill="currentColor" />
                        WATCH HIGHLIGHTS
                    </Link>
                    <Link to="/signup" className="btn-outline flex items-center gap-3 px-10 py-5 text-sm border-[var(--text-main)]/20 hover:border-[var(--accent-red)] hover:text-[var(--accent-red)]">
                        JOIN TEAM
                    </Link>
                </div>

                </div>
        </section>
    );
};

export default HeroSection;
