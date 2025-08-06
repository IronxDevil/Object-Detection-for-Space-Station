'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/detect', label: 'Detect' },
    { href: '/realtime', label: 'Real Time Detect' },
    { href: '/history', label: 'History' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-nightclub backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center"
          >
            <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 transition-colors font-heading">
              Space Safety
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex space-x-8"
          >
            {navItems.map((item) => (
              <div
                key={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (pathname !== item.href && !isTransitioning) {
                    setIsTransitioning(true);
                    // Add a slight delay before navigation to allow transition to start
                    setTimeout(() => {
                      router.push(item.href);
                      // Reset after navigation completes
                      setTimeout(() => setIsTransitioning(false), 800);
                    }, 100);
                  }
                }}
                className={`relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  pathname === item.href
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/10 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </nav>
  );
}