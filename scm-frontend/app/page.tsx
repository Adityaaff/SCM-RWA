'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion'; // Import Variants
import Link from 'next/link';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.15,
      type: 'spring' as const, // Use 'as const' to ensure literal type
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
        <p className="text-lg font-semibold animate-pulse">Loading RWA Minter...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-8 sm:p-20 flex flex-col items-center gap-16">
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col items-center text-center"
      >
        <Image src="/file.svg" alt="RWA Icon" width={80} height={80} />
        <h1 className="text-4xl font-bold mt-4">SCM for Good Blockchain</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg">
          Tokenize real-world physical goods using IoT-connected weight scales.
          Submit your asset data and mint on-chain RWA tokens securely and transparently.
        </p>
      </motion.div>

      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex gap-4 flex-wrap justify-center"
      >
        <Link href="/submit" passHref>
          <button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-medium transition">
            Submit Scale Data
          </button>
        </Link>
        <Link href="/mint" passHref>
          <button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-sm font-medium transition">
            Mint RWA Token
          </button>
        </Link>
        <Link href="/view" passHref>
          <button className="rounded-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-sm font-medium transition">
            View Latest Data
          </button>
        </Link>
      </motion.div>

      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-600 dark:text-gray-400"
      >
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline underline-offset-4"
        >
          Built with Next.js
        </a>
        <a
          href="https://tailwindcss.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline underline-offset-4"
        >
          Styled with Tailwind
        </a>
        <a
          href="https://framer.com/motion"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline underline-offset-4"
        >
          Animated with Framer Motion
        </a>
      </motion.div>
    </div>
  );
}