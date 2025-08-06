'use client';

import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { DetectionHistoryContext } from '@/context/DetectionHistoryContext';

interface Detection {
  id: string;
  detections: {
    class: string;
    conf: number;
    box: number[];
  }[];
  class_counts: Record<string, number>;
  confidences: number[];
  date: string;
  filename: string;
}

export default function HistoryPage() {
  const { history, previewCache, clearHistory, deleteDetection, addDetection } = useContext(DetectionHistoryContext);
  const [expanded, setExpanded] = useState<Detection | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoType, setUndoType] = useState<'delete' | 'clear' | null>(null);
  const [undoData, setUndoData] = useState<{ detection: Detection; inputPreview?: string; outputPreview?: string } | Detection[] | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  // Undo handler
  const handleUndo = () => {
    if (undoType === 'delete' && undoData && !Array.isArray(undoData)) {
      addDetection(
        undoData.detection, 
        undoData.inputPreview, 
        undoData.outputPreview
      );
    } else if (undoType === 'clear' && Array.isArray(undoData)) {
      // Restore all
      undoData.forEach(item => {
        if ('detection' in item) {
          addDetection(item.detection, item.inputPreview, item.outputPreview);
        }
      });
    }
    setShowUndo(false);
    setUndoType(null);
    setUndoData(null);
    if (undoTimeout) clearTimeout(undoTimeout);
  };

  // Delete with confirmation and undo
  const handleDelete = (item: Detection) => {
    if (!window.confirm('Are you sure you want to delete this detection?')) return;
    // Save for undo
    setUndoType('delete');
    setUndoData({
      detection: item,
      inputPreview: previewCache[item.id]?.input,
      outputPreview: previewCache[item.id]?.output
    });
    deleteDetection(item.id);
    setShowUndo(true);
    if (undoTimeout) clearTimeout(undoTimeout);
    setUndoTimeout(setTimeout(() => setShowUndo(false), 5000));
  };

  // Clear with confirmation and undo
  const handleClear = () => {
    if (!window.confirm('Are you sure you want to clear all detection history?')) return;
    // Save all for undo
    const all = history.map(item => ({
      detection: item,
      inputPreview: previewCache[item.id]?.input,
      outputPreview: previewCache[item.id]?.output
    }));
    setUndoType('clear');
    setUndoData(all);
    clearHistory();
    setShowUndo(true);
    if (undoTimeout) clearTimeout(undoTimeout);
    setUndoTimeout(setTimeout(() => setShowUndo(false), 5000));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Static Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#414141] to-[#000000]"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-heading mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              DETECTION HISTORY
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl font-body">
              View your past safety equipment detections and analysis results.
            </p>
          </motion.div>

          {/* Clear History Button */}
          <div className="flex justify-end mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="btn-3d px-6 py-3 text-lg font-body"
            >
              Clear History
            </motion.button>
          </div>

          {/* History Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {history.length === 0 && (
              <div className="col-span-3 text-center py-16">
                <p className="text-xl text-gray-400 font-body">No detection history yet.</p>
              </div>
            )}

            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card-3d p-6 cursor-pointer group transition-all hover:scale-[1.03]"
                onClick={() => setExpanded(item)}
                whileHover={{ scale: 1.03 }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  className="absolute top-3 right-3 bg-black/50 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10 transition-colors"
                  title="Delete"
                >
                  &times;
                </button>

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400 font-body">{item.date}</span>
                    <span className="text-sm text-gray-400 font-body">{item.filename}</span>
                  </div>

                  <div className="flex gap-4 items-center justify-center">
                    {previewCache[item.id]?.input ? (
                      <img
                        src={previewCache[item.id].input}
                        alt="Input"
                        className="rounded-lg border border-gray-700 w-24 h-24 object-cover bg-black/30"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-black/30 flex items-center justify-center text-gray-500 text-sm font-body">
                        No input
                      </div>
                    )}

                    <span className="text-gray-500 text-2xl">→</span>

                    {previewCache[item.id]?.output ? (
                      <img
                        src={previewCache[item.id].output}
                        alt="Output"
                        className="rounded-lg border border-gray-700 w-24 h-24 object-cover bg-black/30"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-black/30 flex items-center justify-center text-gray-500 text-sm font-body">
                        No output
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="text-base text-gray-300 font-body">
                      Class Counts: {item.class_counts && Object.entries(item.class_counts).map(([cls, cnt]) => `${cls}: ${cnt}`).join(', ')}
                    </div>
                    <div className="text-sm text-gray-400 font-body mt-1">
                      Detections: {item.detections?.length || 0}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Undo Snackbar */}
      {showUndo && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white px-8 py-4 rounded-xl shadow-lg flex items-center gap-4 z-50 border border-gray-700">
          <span className="font-body">History updated.</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            className="btn-3d btn-3d-primary px-4 py-2 text-sm font-body"
          >
            Undo
          </motion.button>
        </div>
      )}

      {/* Modal/Expand logic */}
      {expanded && (
        <motion.div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setExpanded(null)}
        >
          <div 
            className="card-3d p-8 max-w-lg text-white relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-3 right-3 text-2xl font-bold text-white hover:text-gray-300" 
              onClick={() => setExpanded(null)}
            >
              &times;
            </button>

            <div className="flex gap-8 items-center mb-8">
              {previewCache[expanded.id]?.input ? (
                <img
                  src={previewCache[expanded.id].input}
                  alt="Input"
                  className="rounded-lg border border-gray-700 w-32 h-32 object-cover bg-black/30"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-black/30 flex items-center justify-center text-gray-500 text-sm font-body">
                  No input
                </div>
              )}

              <span className="text-gray-500 text-3xl">→</span>

              {previewCache[expanded.id]?.output ? (
                <img
                  src={previewCache[expanded.id].output}
                  alt="Output"
                  className="rounded-lg border border-gray-700 w-32 h-32 object-cover bg-black/30"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-black/30 flex items-center justify-center text-gray-500 text-sm font-body">
                  No output
                </div>
              )}
            </div>

            <h2 className="text-2xl font-heading mb-4">{expanded.filename}</h2>
            <p className="text-sm text-gray-400 mb-4 font-body">{expanded.date}</p>

            <div className="space-y-2 mb-6">
              <div className="text-base text-gray-300 font-body">
                Class Counts: {expanded.class_counts && Object.entries(expanded.class_counts).map(([cls, cnt]) => `${cls}: ${cnt}`).join(', ')}
              </div>
              <div className="text-base text-gray-300 font-body">
                Confidences: {expanded.confidences && expanded.confidences.map(c => (c * 100).toFixed(1) + '%').join(', ')}
              </div>
              <div className="text-base text-gray-300 font-body">
                Detections: {expanded.detections?.length || 0}
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              <h3 className="text-lg font-heading mb-2">Detection Details:</h3>
              {expanded.detections && expanded.detections.map((det, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="capitalize font-body">{det.class}</span>
                  <span className="text-green-400 font-body">{(det.conf * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}