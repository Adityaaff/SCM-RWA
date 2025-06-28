'use client';

import { Variants, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link'; // Import Link for navigation

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.2,
      type: 'spring', // Valid AnimationGeneratorType
      stiffness: 100,
      damping: 20,
      mass: 0.5,
    },
  }),
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        custom={0}
        className="flex flex-col items-center text-center pt-10"
      >
        <Image src="/file.svg" alt="RWA Icon" width={80} height={80} />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">
          Welcome to SCM-RWA
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
          Submit your scale data below
        </p>
      </motion.div>
      <div className="mt-8 text-center">
        <Link href="/submit">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            Go to Submit Page
          </Button>
        </Link>
      </div>
    </div>
  );
}