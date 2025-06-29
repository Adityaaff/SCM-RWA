'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import HeroSection from '../components/sections/Hero';
import ActionsSection from '../components/sections/ActionsSection';
import FooterSection from '../components/sections/FooterSection';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.15,
      type: 'spring',
      stiffness: 120,
      damping: 12,
      mass: 0.8,
    },
  }),
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black text-gray-800 dark:text-white">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="text-lg font-semibold"
        >
          Loading RWA Minter...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex flex-col items-center gap-16">
      <HeroSection />
      <ActionsSection />
      <FooterSection />
    </div>
  );
}