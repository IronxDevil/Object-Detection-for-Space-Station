'use client';

import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { DetectionHistoryContext } from '@/context/DetectionHistoryContext';

interface Detection {
  class: string;
  conf: number;
  box: number[];
}

interface DetectionResult {
  detections: Detection[];
  image: string;
  class_counts: Record<string, number>;
  confidences: number[];
}

// Helper function to download files
function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export default function DetectPage() {
  const { addDetection } = useContext(DetectionHistoryContext);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const detectionResult = response.data;
      setResult(detectionResult);
      
      // Save to history
      if (detectionResult) {
        const timestamp = new Date();
        const detection = {
          id: `detection-${timestamp.getTime()}`,
          detections: detectionResult.detections,
          class_counts: detectionResult.class_counts,
          confidences: detectionResult.confidences,
          date: timestamp.toLocaleString(),
          filename: file.name
        };
        
        addDetection(detection, preview, `data:image/png;base64,${detectionResult.image}`);
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!result?.image) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${result.image}`;
    link.download = "detection_result.png";
    link.click();
  };

  const handleDownloadJSON = () => {
    if (!result?.detections) return;
    downloadFile("detections.json", JSON.stringify(result.detections, null, 2));
  };

  const handleDownloadCSV = () => {
    if (!result?.detections) return;
    const csv = [
      "class,confidence,box",
      ...result.detections.map(d => `${d.class},${d.conf},[${d.box.join(" ")}]`)
    ].join("\n");
    downloadFile("detections.csv", csv);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Static Gradient Background - Early Retirement */}
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
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-heading mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SAFETY DETECTION
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-body">
              Upload an image to detect fire extinguishers, toolboxes, and oxygen tanks using our advanced YOLOv8 model.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="space-y-6"
            >
              <div className="card-3d p-8">
                <h2 className="text-2xl font-heading mb-6">Upload Image</h2>
                
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 font-body file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200"
                  />
                  
                  {preview && (
                    <div className="mt-4">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-w-md rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={!file || loading}
                    className="btn-3d btn-3d-success w-full text-lg font-body disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Detect Safety Equipment'}
                  </motion.button>
                  
                  {error && (
                    <div className="text-red-400 text-sm mt-2 font-body">{error}</div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="space-y-6"
            >
              {result && (
                <div className="card-3d p-8">
                  <h2 className="text-2xl font-heading mb-6">Detection Results</h2>
                  
                  {/* Processed Image */}
                  <div className="mb-6">
                    <img
                      src={`data:image/png;base64,${result.image}`}
                      alt="Detection Result"
                      className="w-full rounded-lg border border-gray-600"
                    />
                  </div>
                  
                  {/* Detection Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {Object.entries(result.class_counts).map(([className, count]) => (
                      <div key={className} className="text-center">
                        <div className="text-2xl font-heading text-white">{count}</div>
                        <div className="text-sm text-gray-400 capitalize font-body">{className}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Detection Details */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-heading mb-3">Detected Objects:</h3>
                    {result.detections.map((detection, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                        <span className="capitalize font-body">{detection.class}</span>
                        <span className="text-green-400 font-body">{(detection.conf * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Detailed Detection Table and Download Section */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-12 space-y-8"
            >
              {/* Detection Table */}
              <div className="card-3d p-8">
                <h2 className="text-2xl font-heading mb-6">Detailed Detection Results</h2>
                {result.detections && result.detections.length > 0 ? (
                  <div className="w-full overflow-x-auto">
                    <table className="min-w-full bg-gray-800/30 rounded-lg text-white border border-gray-600/40 shadow-lg text-lg font-body">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 border-b border-gray-600/40 text-left">Class</th>
                          <th className="px-4 py-3 border-b border-gray-600/40 text-left">Confidence</th>
                          <th className="px-4 py-3 border-b border-gray-600/40 text-left">Bounding Box [x1, y1, x2, y2]</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.detections.map((det, idx) => (
                          <tr key={idx} className="hover:bg-gray-700/30 transition-all">
                            <td className="px-4 py-3 border-b border-gray-600/20 font-semibold capitalize">{det.class}</td>
                            <td className="px-4 py-3 border-b border-gray-600/20 text-green-400">{(det.conf * 100).toFixed(1)}%</td>
                            <td className="px-4 py-3 border-b border-gray-600/20 font-mono text-sm">{det.box.map((v) => v.toFixed(0)).join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-gray-400 mt-4 text-lg font-body">No detections found</div>
                )}
                
                {/* Additional Stats */}
                <div className="mt-8 space-y-2 text-gray-300 text-lg font-body">
                  <div>
                    <span className="font-semibold">Class Counts:</span> {Object.entries(result.class_counts).map(([cls, cnt]) => `${cls}: ${cnt}`).join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Confidences:</span> {result.confidences && result.confidences.map(c => (c * 100).toFixed(1) + "%").join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Total Detections:</span> {result.detections.length}
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadImage}
                  className="btn-3d btn-3d-primary px-6 py-3 text-lg font-body"
                >
                  Download Labeled Image
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadJSON}
                  className="btn-3d btn-3d-secondary px-6 py-3 text-lg font-body"
                >
                  Download JSON
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadCSV}
                  className="btn-3d btn-3d-accent px-6 py-3 text-lg font-body"
                >
                  Download CSV
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}