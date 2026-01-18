"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import JournalBook from '@/components/JournalBook';
import LandingExperience from '@/components/LandingExperience';

export default function Home() {
  const [stage, setStage] = useState<'landing' | 'opening' | 'app'>('landing');

  return (
    <main className={`relative w-full ${stage === 'app' ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-[#E6E2D6]`}>
      <AnimatePresence mode="wait">
        {stage !== 'app' && (
          <motion.div
            key="landing"
            className="absolute inset-0 z-10"
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <LandingExperience
              onOpen={() => setStage('opening')}
              onFinishOpen={() => setStage('app')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === 'app' && (
          <motion.div
            key="app"
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <JournalBook />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}