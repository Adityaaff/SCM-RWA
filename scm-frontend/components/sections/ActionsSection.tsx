'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

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

export default function ActionsSection() {
  return (
    <motion.div
      custom={2}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex gap-4 flex-wrap justify-center"
    >
      <motion.div custom={2.5} variants={fadeInUp}>
        <Link href="/submit" passHref>
          <button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-sm font-medium transition">
            Submit Scale Data
          </button>
        </Link>
      </motion.div>
      <motion.div custom={3} variants={fadeInUp}>
        <Link href="/mint" passHref>
          <button className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-sm font-medium transition">
            Mint RWA Token
          </button>
        </Link>
      </motion.div>
      <motion.div custom={3.5} variants={fadeInUp}>
        <Link href="/view" passHref>
          <button className="rounded-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-sm font-medium transition">
            View Latest Data
          </button>
        </Link>
      </motion.div>
    </motion.div>
  );
}