import React from 'react';
import { Footer } from '../components/HomeSections';

const EsportsPage = ({ title, description }) => {
    return (
        <div className="min-h-screen bg-[#05010d] flex flex-col">
            <div className="flex-1 container mx-auto px-4 pt-32 pb-20">
                <div className="text-center mb-16">
                    <span className="font-orbitron text-red-600 font-bold tracking-[0.4em] text-xs mb-4">BLOODLOVERS ESPORTS</span>
                    <h1 className="font-orbitron text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 italic">
                        {title}
                    </h1>
                    <p className="max-w-2xl mx-auto text-gray-500 font-inter text-lg">
                        {description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="group bg-[#0f0a1a] border border-white/5 overflow-hidden hover:border-red-600/30 transition-all">
                            <div className="aspect-video bg-black/50 overflow-hidden">
                                <div className="w-full h-full bg-gradient-to-br from-red-900/20 to-black flex items-center justify-center text-white/10 font-orbitron text-4xl italic font-black">
                                    {title.split(' ')[0]} {i}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-orbitron text-lg font-black text-white mb-2 group-hover:text-red-500 transition-colors">
                                    CONTENT ITEM #{i}
                                </h3>
                                <p className="text-gray-500 text-sm font-inter">
                                    Stay tuned for upcoming {title.toLowerCase()} content and exclusive updates from the team.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default EsportsPage;
