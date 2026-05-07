import React from 'react';
// Cache bust: Scroll indicator removed
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import logo from '../assets/logo.png';

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



                {/* Top Heading: THE */}
                <h1 className="hero-h1 select-none flex flex-col items-center">
                    <span className="font-orbitron text-white font-bold tracking-[0.8em] text-[10px] mb-6 uppercase opacity-90">BUILT FOR DOMINATION</span>
                    <span className="text-[var(--text-main)] flex items-center justify-center gap-1 italic tracking-[0.05em]">
                        <span className="glow-char inline-block">T</span>
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-[clamp(80px,20vw,180px)] w-auto object-contain filter drop-shadow-[0_0_40px_var(--accent-red)] animate-bounce-slow mix-blend-screen"
                        />
                        <span className="glow-char inline-block">E</span>
                    </span>
                    {/* Tactical Underline */}
                    <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#ff1a1a] via-[#ffffff] via-[#ff1a1a] to-transparent mt-2 shadow-[0_0_20px_var(--accent-red)] opacity-90"></div>
                </h1>

                {/* Main Brand: BLOODLOVERS ESPORTS */}
                <h1 className="hero-h1 mb-8 max-w-5xl select-none">
                    <span className="text-[var(--text-main)] block mb-2 italic tracking-[0.05em]">
                        {"BLOODLOVERS".split('').map((char, i) => (
                            <span
                                key={i}
                                className="glow-char inline-block"
                                style={{ '--index': i }}
                            >
                                {char}
                            </span>
                        ))}
                    </span>
                    <span className="bg-gradient-to-r from-[#ff1a1a] via-[#ffffff] to-[#ff1a1a] bg-clip-text text-transparent block italic font-black tracking-[0.2em] opacity-95">E-SPORTS</span>
                </h1>

                {/* Subtitle */}
                <div className="hero-desc max-w-xl mx-auto mb-14 text-center">
                    <p className="font-orbitron text-xs font-bold tracking-[0.3em] uppercase flex flex-wrap justify-center gap-x-2">
                        {"We bleed together. We win together.".split(' ').map((word, wi) => (
                            <span key={wi} className="whitespace-nowrap">
                                {word.split('').map((char, ci) => (
                                    <span
                                        key={ci}
                                        className="glow-char inline-block"
                                        style={{ '--index': wi * 10 + ci }}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </span>
                        ))}
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
