'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';

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

export default function HeroSection() {
  return (
    <motion.div
      custom={0}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex flex-col items-center text-center"
    >
      <motion.div custom={0.5} variants={fadeInUp}>
        <Image src="/file.svg" alt="RWA Icon" width={80} height={80} />
      </motion.div>
      <motion.h1 custom={1} variants={fadeInUp} className="text-4xl font-bold mt-4">
        SCM for Good Blockchain
      </motion.h1>
      <motion.p
        custom={1.5}
        variants={fadeInUp}
        className="mt-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg"
      >
        Tokenize real-world physical goods using IoT-connected weight scales. Submit your asset data and mint
        on-chain RWA tokens securely and transparently.
      </motion.p>
    </motion.div>
  );
}