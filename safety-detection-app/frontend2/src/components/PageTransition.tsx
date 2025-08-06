'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect, useRef } from 'react';
import Particles from './Particles';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Enhanced video-like transition effect
  const variants = {
    hidden: { 
      opacity: 0,
      filter: 'blur(15px)',
      scale: 0.92,
    },
    enter: { 
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 1, 0.5, 1], // Enhanced cubic-bezier easing for smoother motion
      }
    },
    exit: { 
      opacity: 0,
      filter: 'blur(15px)',
      scale: 1.08,
      transition: {
        duration: 0.7,
        ease: [0.25, 1, 0.5, 1],
      }
    },
  };

  // Handle transition state with enhanced timing
  useEffect(() => {
    setIsTransitioning(true);
    
    // Play transition video if available
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => console.error('Video play error:', err));
    }
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 900); // Longer duration for more noticeable transition
    
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Video-like transition overlay */}
      <div className={`video-transition-overlay ${isTransitioning ? 'active' : ''}`}>
        {/* Video element is commented out until the actual file is available */}
        {/* <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover z-[102] opacity-0 transition-opacity duration-700"
          style={{ opacity: isTransitioning ? 0.8 : 0 }}
          muted 
          playsInline
        >
          <source src="/transitions/page-transition.mp4" type="video/mp4" />
        </video> */}
      </div>
      
      {/* Enhanced aurafarming overlay with stronger effect */}
      <div className={`aurafarming-overlay ${isTransitioning ? 'active' : ''}`} />
      
      {/* Enhanced particles with more intensity during transitions */}
      <Particles active={isTransitioning} intensity={isTransitioning ? 1.5 : 1} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial="hidden"
          animate="enter"
          exit="exit"
          variants={variants}
          className="min-h-screen w-full"
          onAnimationStart={() => setIsTransitioning(true)}
          onAnimationComplete={() => setIsTransitioning(false)}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
}