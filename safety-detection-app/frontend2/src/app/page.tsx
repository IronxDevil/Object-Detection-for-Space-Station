'use client';

import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);

  return (
    <div className="min-h-screen text-white flex" style={{ background: 'linear-gradient(135deg, #414141 0%, #000000 100%)' }}>
      {/* Main Content (Left Side) */}
      <div className="flex-1 relative z-10 p-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-heading mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SPACE STATION
            </h1>
            <h2 className="text-4xl md:text-6xl font-heading text-gray-300 mb-8">
              SAFETY DETECTION
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl leading-relaxed font-body">
              Real-time detection of fire extinguishers, toolboxes, and oxygen tanks using advanced YOLOv8 technology.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid md:grid-cols-2 gap-8 mb-16"
          >
            <div className="card-3d nightclub-card p-8 hover:bg-gray-800/50 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4 text-white font-heading">Real-Time Detection</h3>
              <p className="text-gray-300 leading-relaxed font-body">
                Advanced YOLOv8 model achieving 0.983 mAP@50 for accurate safety equipment detection.
              </p>
            </div>
            <div className="card-3d nightclub-card p-8 hover:bg-gray-800/50 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4 text-white">Single Model Approach</h3>
              <p className="text-gray-300 leading-relaxed">
                One highly-optimized model for all safety classes - no ensemble complexity.
              </p>
            </div>
            <div className="card-3d nightclub-card p-8 hover:bg-gray-800/50 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4 text-white">Edge Device Ready</h3>
              <p className="text-gray-300 leading-relaxed">
                Optimized for real-time inference on space station monitoring systems.
              </p>
            </div>
            <div className="card-3d nightclub-card p-8 hover:bg-gray-800/50 transition-all duration-300">
              <h3 className="text-2xl font-bold mb-4 text-white">Safety Critical</h3>
              <p className="text-gray-300 leading-relaxed">
                Designed for reliability in safety-critical space station environments.
              </p>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center"
          >
            <Link href="/detect">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-3d btn-3d-primary px-12 py-4 text-xl shadow-lg"
              >
                Start Detection
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Spline 3D Element (Right Side) - Enhanced Size and Positioning */}
      <div className="hidden lg:block w-1/2 min-w-[650px] relative overflow-visible">
        <div className="sticky top-0 h-screen overflow-visible">
          {!isSplineLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg font-mono">Loading 3D Experience...</p>
              </div>
            </div>
          )}
          <div className="w-[140%] h-[140%] transform scale-100 -translate-x-16 -translate-y-8 overflow-visible">
            <Spline
              scene="https://prod.spline.design/Yodja9ynt1-zimF3/scene.splinecode"
              onLoad={() => setIsSplineLoaded(true)}
              className="w-full h-full overflow-visible"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
