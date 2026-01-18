"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

interface LandingExperienceProps {
    onOpen?: () => void;
    onFinishOpen?: () => void;
}

// --- ASSETS ---
const ASSET_COVER = "/landing/diary-cover.png";
const ASSET_OPEN = "/landing/diary-open.png";
const ASSET_TEXTURE = "/landing/page-texture.png";

// Updated Background Color: Darker Tan / Notebook color
// Updated Background Color: Light Cream / User Preferred
const BG_COLOR = "#edeae0";

function HeroContent({ onOpen, setHovering, isHovering }: { onOpen?: () => void, setHovering: (h: boolean) => void, isHovering: boolean }) {
    return (
        <section className="relative z-10 w-full h-full flex flex-col items-center justify-between py-[12vh]">
            {/* Top Section: Title */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="text-center px-6 max-w-4xl mx-auto z-20"
            >
                <h1 className="font-serif text-4xl md:text-6xl text-[#1F1B18] leading-tight mix-blend-multiply tracking-widest"> 
                    Protag-a-Me 
                </h1>
            </motion.div>

            {/* Center Section: Diary Image */}
            <div className="relative flex-1 flex items-center justify-center w-full max-h-[70vh] z-10 p-4">
                {/* Diary Container */}
                {/* Expanded width to accommodate the directional shadow in the asset */}
                {/* Diary Container */}
                <div
                    className="relative w-full max-w-[1000px] h-full"
                >
                    {/* Closed Book (Default) */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: isHovering ? 0 : 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Image
                            src={ASSET_COVER}
                            alt="Closed Diary"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                            style={{
                                mixBlendMode: "normal",
                                opacity: 1,
                                filter: "drop-shadow(-20px 30px 20px rgba(31, 27, 24, 0.25))"
                            }}
                        />
                    </motion.div>

                    {/* Open Book (On Hover) */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovering ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Image
                            src={ASSET_OPEN}
                            alt="Open Diary"
                            fill
                            className="object-contain"
                            priority
                            unoptimized
                            style={{
                                mixBlendMode: "normal",
                                opacity: 1,
                                // Slightly different shadow for the open flat book
                                filter: "drop-shadow(-20px 10px 15px rgba(31, 27, 24, 0.2))"
                            }}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Bottom Section: Subhead + Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className="text-center px-6 max-w-4xl mx-auto flex flex-col items-center z-20"
            >
                <p className="font-serif text-xl md:text-2xl text-[#1F1B18] max-w-2xl mx-auto mb-10 tracking-wide">
                    Your life is a story worth telling...
                </p>

                <div className="pointer-events-auto">
                    <button
                        onClick={onOpen}
                        onMouseEnter={() => setHovering(true)}
                        onMouseLeave={() => setHovering(false)}
                        className="
                        group relative overflow-hidden
                        px-10 py-4
                        bg-[#1F1B18] text-[#FCFAF8]
                        font-serif text-sm tracking-[0.2em] uppercase
                        shadow-lg
                        transition-all duration-300 ease-out
                        hover:shadow-xl
                        flex items-center gap-3
                        rounded-full
                    ">
                        <span className="relative z-10">Open Your Journal</span>
                        <span className="relative z-10 text-[#D4AF37] text-lg">✦</span>

                        {/* Golden Glow Hover Effect */}
                        <div className="absolute inset-0 bg-[#D4AF37]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl scale-150" />
                        <div className="absolute inset-0 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                </div>
            </motion.div>
        </section>
    );
}

export default function LandingExperience({ onOpen, onFinishOpen }: LandingExperienceProps) {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#F4F1EA]">
            {/* Background Texture Layer - Global 5% Opacity */}
            <div
                className="absolute inset-0 z-0 mix-blend-multiply pointer-events-none opacity-50"
                style={{
                    backgroundImage: `url(${ASSET_TEXTURE})`,
                    backgroundSize: 'cover',
                }}
            />

            {/* Main Content */}
            <HeroContent onOpen={onFinishOpen} setHovering={setIsHovering} isHovering={isHovering} />
        </div>
    );
}
