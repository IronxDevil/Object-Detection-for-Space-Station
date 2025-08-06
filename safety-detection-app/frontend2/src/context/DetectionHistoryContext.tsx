'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

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

interface PreviewCache {
  [key: string]: {
    input?: string;
    output?: string;
  };
}

interface DetectionHistoryContextType {
  history: Detection[];
  previewCache: PreviewCache;
  addDetection: (detection: Detection, inputPreview?: string, outputPreview?: string) => void;
  clearHistory: () => void;
  deleteDetection: (id: string) => void;
}

export const DetectionHistoryContext = createContext<DetectionHistoryContextType>(
  {} as DetectionHistoryContextType
);

interface DetectionHistoryProviderProps {
  children: ReactNode;
}

export function DetectionHistoryProvider({ children }: DetectionHistoryProviderProps) {
  const [history, setHistory] = useState<Detection[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('detection_history') || '[]');
    }
    return [];
  });
  
  // Session-only cache for image previews
  const [previewCache, setPreviewCache] = useState<PreviewCache>({});

  useEffect(() => {
    // Only store metadata, not images
    const metaHistory = history.map(({ id, detections, class_counts, confidences, date, filename }) => ({
      id, detections, class_counts, confidences, date, filename
    }));
    localStorage.setItem('detection_history', JSON.stringify(metaHistory.slice(0, 10)));
  }, [history]);

  const addDetection = (detection: Detection, inputPreview?: string, outputPreview?: string) => {
    setHistory((prev) => [detection, ...prev].slice(0, 10));
    setPreviewCache((prev) => ({ 
      ...prev, 
      [detection.id]: { 
        input: inputPreview, 
        output: outputPreview 
      } 
    }));
  };

  const clearHistory = () => {
    setHistory([]);
    setPreviewCache({});
    localStorage.removeItem('detection_history');
  };

  const deleteDetection = (id: string) => {
    setHistory((prev) => prev.filter(item => item.id !== id));
    setPreviewCache((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <DetectionHistoryContext.Provider value={{ history, addDetection, previewCache, clearHistory, deleteDetection }}>
      {children}
    </DetectionHistoryContext.Provider>
  );
}