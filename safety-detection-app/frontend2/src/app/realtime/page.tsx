'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RealtimePage() {
  const [isLaunching, setIsLaunching] = useState(false);
  const [message, setMessage] = useState('');

  const launchRealtimeDetection = async () => {
    setIsLaunching(true);
    setMessage('Launching real-time detection...');
    
    try {
      // Simple approach - create a minimal batch file and execute it
      const batchContent = `@echo off
cd /d "C:\\Users\\Ankur Rawat\\Downloads\\Duality_AI_Task\\Duality_ai\\YOLOv8-HumanDetection-main"
python realtime_detection.py
pause`;
      
      const blob = new Blob([batchContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'run_realtime.bat';
      link.click();
      
      URL.revokeObjectURL(url);
      
      setMessage('Batch file downloaded! Double-click "run_realtime.bat" to start detection.');
    } catch (error) {
      setMessage('Failed to create launch file. Please run the script manually.');
      console.error('Launch error:', error);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#414141] to-[#000000]"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
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
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-heading mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              REAL-TIME DETECTION
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-body">
              Launch the standalone real-time detection application for live safety equipment monitoring.
            </p>
          </motion.div>

          {/* Launch Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-center"
          >
            <div className="card-3d p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🚀</div>
              <h2 className="text-3xl font-heading mb-6">Launch Real-Time Detection</h2>
              <p className="text-gray-300 mb-8 font-body">
                Click the button below to launch the real-time detection application in a new terminal window.
                The application will use your camera for live detection of safety equipment.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={launchRealtimeDetection}
                disabled={isLaunching}
                className="btn-3d btn-3d-success text-xl px-8 py-4 font-body disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLaunching ? 'Launching...' : '🚀 Launch Real-Time Detection'}
              </motion.button>
              
              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-gray-800/50 rounded-lg text-gray-300 font-body"
                >
                  {message}
                </motion.div>
              )}
            </div>
          </motion.div>

                     {/* Instructions */}
           <motion.div
             initial={{ opacity: 0, y: 40 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6, duration: 0.8 }}
             className="mt-12"
           >
             <div className="card-3d p-8">
               <h2 className="text-2xl font-heading mb-6">How to Use</h2>
               <div className="grid md:grid-cols-3 gap-6 text-gray-300 font-body">
                 <div className="text-center">
                   <div className="text-3xl mb-2">🚀</div>
                   <h3 className="font-heading mb-2">1. Download & Run</h3>
                   <p>Click the launch button to download the batch file, then double-click it to run</p>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl mb-2">📹</div>
                   <h3 className="font-heading mb-2">2. Camera Access</h3>
                   <p>The application will open in a new window and request camera access</p>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl mb-2">⌨️</div>
                   <h3 className="font-heading mb-2">3. Controls</h3>
                   <p>Press 'q' to quit, 's' to save screenshot, 'c' to toggle confidence</p>
                 </div>
               </div>
             </div>
           </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8"
          >
            <div className="card-3d p-8">
              <h2 className="text-2xl font-heading mb-6">Features</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300 font-body">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Real-time human detection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Safety equipment detection (fire extinguishers, toolboxes, oxygen tanks)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Live FPS monitoring</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Screenshot capture (press 's')</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>Confidence threshold adjustment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">✓</span>
                    <span>GPU acceleration support</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 