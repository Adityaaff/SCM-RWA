'use client';

import { motion, Variants } from 'framer-motion';

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

export default function FooterSection() {
  return (
    <motion.div
      custom={4}
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-600 dark:text-gray-400"
    >
      <motion.a
        custom={4.5}
        variants={fadeInUp}
        href="https://nextjs.org"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline underline-offset-4"
      >
        Built with Next.js
      </motion.a>
      <motion.a
        custom={5}
        variants={fadeInUp}
        href="https://tailwindcss.com"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline underline-offset-4"
      >
        Styled with Tailwind
      </motion.a>
      <motion.a
        custom={5.5}
        variants={fadeInUp}
        href="https://framer.com/motion"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline underline-offset-4"
      >
        Animated with Framer Motion
      </motion.a>
    </motion.div>
  );
}