'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useWallet } from '../lib/context/WalletContext';
import { FaChevronDown, FaUser, FaSignOutAlt, FaWallet } from 'react-icons/fa';

const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: (custom: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, type: 'spring', stiffness: 120, damping: 12, mass: 0.8 },
  }),
};

interface MenuItem {
  label: string;
  href?: string;
  subMenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { label: 'Create Product', href: '/add' },
  { label: 'Products', href: '/products' },
  { label: 'Confirm Delivery', href: '/confirm' },
  { label: 'Submit Scale Data', href: '/submit' },
];

export default function Header() {
  const { address, connect, disconnect } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    document.documentElement.classList.toggle('dark', mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderMenu = (items: MenuItem[], isSubMenu: boolean = false) => {
    return items.map((item, index) => (
      <motion.li
        key={index}
        custom={index + 1}
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        className={isSubMenu ? 'p-2' : ''}
      >
        <Link href={item.href!} className="block font-semibold text-gray-800 dark:text-white hover:underline">
          {item.label}
        </Link>
      </motion.li>
    ));
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeInDown}
      className="bg-white dark:bg-gray-900 shadow-lg p-4 sticky top-0 z-10"
    >
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <motion.div custom={0} variants={fadeInDown}>
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
            <img src="/img/logo.png" alt="DEX Marketplace" className="h-8 inline-block" />
            <span className="ml-2">DEX Marketplace</span>
          </Link>
        </motion.div>
        <div className="flex items-center gap-6">
          {/* Desktop Menu */}
          <ul className="hidden lg:flex menu menu-horizontal gap-4">{renderMenu(menuItems)}</ul>
          {/* Mobile Menu */}
          <div className="lg:hidden dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost text-gray-800 dark:text-white">
              <img src="/img/logo.png" alt="Menu Icon" className="w-6 h-6" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white dark:bg-gray-800 rounded-box z-[1] mt-3 w-52 p-2 shadow-lg"
            >
              {renderMenu(menuItems)}
              {address && (
                <>
                  <motion.li
                    custom={menuItems.length + 1}
                    variants={fadeInDown}
                    initial="hidden"
                    animate="visible"
                    className="p-2"
                  >
                    <Link href="/profile" className="flex items-center gap-2">
                      <FaUser /> Profile
                    </Link>
                  </motion.li>
                  <motion.li
                    custom={menuItems.length + 2}
                    variants={fadeInDown}
                    initial="hidden"
                    animate="visible"
                    className="p-2"
                  >
                    <Link href="/settings" className="flex items-center gap-2">
                      <FaUser /> Settings
                    </Link>
                  </motion.li>
                  <motion.li
                    custom={menuItems.length + 3}
                    variants={fadeInDown}
                    initial="hidden"
                    animate="visible"
                    className="p-2"
                  >
                    <button onClick={handleDisconnect} className="flex items-center gap-2">
                      <FaSignOutAlt /> Disconnect
                    </button>
                  </motion.li>
                </>
              )}
            </ul>
          </div>
          {/* Theme Toggle */}
          <motion.label
            custom={menuItems.length + 1}
            variants={fadeInDown}
            className="swap swap-rotate text-gray-800 dark:text-white"
          >
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
            <svg
              className="swap-on fill-current w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg
              className="swap-off fill-current w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </motion.label>
          {/* Wallet Controls */}
          {address ? (
            <motion.div
              custom={menuItems.length + 2}
              variants={fadeInDown}
              className="dropdown dropdown-hover dropdown-end"
            >
              <div tabIndex={0} role="button" className="flex items-center gap-1 text-gray-800 dark:text-white">
                <FaWallet className="text-sm" />
                <span className="text-sm font-semibold">{shortenAddress(address)}</span>
                <FaChevronDown className="text-sm" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white dark:bg-gray-800 rounded-box z-[1] w-48 p-2 shadow-lg"
              >
                <motion.li
                  custom={menuItems.length + 3}
                  variants={fadeInDown}
                  initial="hidden"
                  animate="visible"
                >
                  <Link href="/profile" className="flex items-center gap-2">
                    <FaUser /> Profile
                  </Link>
                </motion.li>
                <motion.li
                  custom={menuItems.length + 4}
                  variants={fadeInDown}
                  initial="hidden"
                  animate="visible"
                >
                  <Link href="/settings" className="flex items-center gap-2">
                    <FaUser /> Settings
                  </Link>
                </motion.li>
                <motion.li
                  custom={menuItems.length + 5}
                  variants={fadeInDown}
                  initial="hidden"
                  animate="visible"
                >
                  <button onClick={handleDisconnect} className="flex items-center gap-2">
                    <FaSignOutAlt /> Disconnect
                  </button>
                </motion.li>
              </ul>
            </motion.div>
          ) : (
            <motion.button
              custom={menuItems.length + 2}
              variants={fadeInDown}
              onClick={handleConnect}
              disabled={isConnecting}
              className={`rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium transition ${
                isConnecting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </motion.button>
          )}
        </div>
      </nav>
    </motion.header>
  );
}