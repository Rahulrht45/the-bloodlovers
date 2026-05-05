import React from 'react';
// Cache bust: Scroll indicator removed
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection = () => {

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-[#05010d]">
            {/* ── Background layers ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Grid */}
                <div className="absolute inset-0 bg-grid opacity-60" />
                {/* Red radial glow — top left */}
                <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-red-600/10 rounded-full blur-[160px]" />
                {/* Purple radial glow — bottom right */}
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-purple-700/8 rounded-full blur-[160px]" />
                {/* Scanline sweep */}
                <div
                    className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent animate-scan z-10"
                    style={{ top: '0' }}
                />
            </div>

            {/* ── Main content ── */}
            <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">

                {/* Eyebrow badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 bg-red-600/10 border border-red-600/20 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="font-orbitron text-[10px] font-black text-red-500 tracking-[0.4em] uppercase">
                        Season 4 · Now Active
                    </span>
                </div>

                {/* Main heading */}
                <h1 className="hero-h1 mb-6 max-w-4xl">
                    WE <span className="hero-accent">BLEED.</span><br />
                    WE <span className="hero-muted-text">RISE.</span><br />
                    WE <span className="hero-accent">DOMINATE.</span>
                </h1>

                {/* Subtitle */}
                <p className="hero-desc max-w-xl mx-auto mb-12 text-center">
                    Not just a team — a{' '}
                    <span className="text-red-500 font-bold">bloodline</span>. Built through
                    sacrifice, strategy, and the hunger to be the best.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-20">
                    <Link to="/members" className="btn-primary group flex items-center gap-3 px-8 py-4 text-sm">
                        MEET THE TEAM
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to="/mvp" className="btn-outline flex items-center gap-3 px-8 py-4 text-sm">
                        <Play size={16} />
                        VIEW LEADERBOARD
                    </Link>
                </div>

                </div>
        </section>
    );
};

export default HeroSection;
