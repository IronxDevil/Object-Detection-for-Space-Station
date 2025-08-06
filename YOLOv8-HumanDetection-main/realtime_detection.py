import cv2
import numpy as np
from ultralytics import YOLO
import time
import argparse
import torch
import threading
from collections import deque
import os

class HumanDetector:
    def __init__(self, model_path='best.pt', device=None, conf_threshold=0.5, iou_threshold=0.45):
        """
        Initialize the human detector and ensemble object detector
        
        Args:
            model_path (str): Path to the YOLOv8 model file (for human detection)
            device (str): Device to run inference on ('cuda', 'cuda:0', or 'cpu'). If None, auto-selects GPU if available.
            conf_threshold (float): Confidence threshold for detections
            iou_threshold (float): IoU threshold for NMS
        """
        self.model_path = model_path
        self.model2_path = os.path.join('model2', 'best.pt')
        self.model2_class_names = ["fireextinguisher", "toolbox", "oxygen tank"]
        # Auto-select device: use 'cuda:0' if available, else 'cpu'
        if device is None:
            self.device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device
        self.conf_threshold = conf_threshold
        self.iou_threshold = iou_threshold
        
        # Check CUDA availability
        self.cuda_available = torch.cuda.is_available() if self.device.startswith('cuda') else False
        if self.device.startswith('cuda') and not self.cuda_available:
            print("⚠️  CUDA not available, falling back to CPU")
            self.device = 'cpu'
        
        # Load models
        self.load_models()
        
        # Performance tracking
        self.fps_queue = deque(maxlen=30)
        self.frame_times = deque(maxlen=30)
        
        # Detection colors
        self.colors = {
            'human': (128, 0, 128),  # Green for humans
            'fireextinguisher': (0, 0, 255),  # Red
            'toolbox': (255, 165, 0),         # Orange
            'oxygen tank': (0, 255, 0),     # Yellow
            'text': (255, 255, 255),  # White for text
            'background': (0, 0, 0)  # Black for background
        }
        
    def load_models(self):
        """Load the YOLOv8 models (human and object)"""
        try:
            print(f"🔄 Loading YOLOv8 model from {self.model_path}...")
            self.model = YOLO(self.model_path)
            if self.device.startswith('cuda'):
                self.model.to(self.device)
                print(f"✅ Model loaded on {self.device.upper()}")
            else:
                print("✅ Model loaded on CPU")
            print(f"🔄 Loading ensemble model from {self.model2_path}...")
            self.model2 = YOLO(self.model2_path)
            if self.device.startswith('cuda'):
                self.model2.to(self.device)
                print(f"✅ Ensemble model loaded on {self.device.upper()}")
            else:
                print("✅ Ensemble model loaded on CPU")
        except Exception as e:
            print(f"❌ Error loading model(s): {e}")
            raise
    
    def detect_all(self, frame):
        """
        Detect humans and objects in the frame using both models
        Args:
            frame (numpy.ndarray): Input frame
        Returns:
            tuple: (annotated_frame, detection_info)
        """
        try:
            # Run human detection
            results1 = self.model(frame, conf=self.conf_threshold, iou=self.iou_threshold, verbose=False)
            result1 = results1[0]
            boxes1 = result1.boxes
            detection_info = []
            if boxes1 is not None:
                num_detections = len(boxes1)
                confidences = boxes1.conf.cpu().numpy()
                classes = boxes1.cls.cpu().numpy()
                bboxes = boxes1.xyxy.cpu().numpy()
                for i in range(num_detections):
                    conf = confidences[i]
                    class_id = int(classes[i])
                    bbox = bboxes[i]
                    detection_info.append({
                        'class': 'human',
                        'confidence': conf,
                        'bbox': bbox,
                        'class_id': class_id
                    })
            # Run object detection (ensemble model)
            results2 = self.model2(frame, conf=self.conf_threshold, iou=self.iou_threshold, verbose=False)
            result2 = results2[0]
            boxes2 = result2.boxes
            if boxes2 is not None:
                num_detections2 = len(boxes2)
                confidences2 = boxes2.conf.cpu().numpy()
                classes2 = boxes2.cls.cpu().numpy()
                bboxes2 = boxes2.xyxy.cpu().numpy()
                for i in range(num_detections2):
                    conf = confidences2[i]
                    class_id = int(classes2[i])
                    bbox = bboxes2[i]
                    # Map class_id to class name
                    if 0 <= class_id < len(self.model2_class_names):
                        class_name = self.model2_class_names[class_id]
                    else:
                        class_name = f'class_{class_id}'
                    detection_info.append({
                        'class': class_name,
                        'confidence': conf,
                        'bbox': bbox,
                        'class_id': class_id
                    })
            # Draw detections on frame
            annotated_frame = self.draw_detections(frame, detection_info)
            return annotated_frame, detection_info
        except Exception as e:
            print(f"❌ Error in detection: {e}")
            return frame, []
    
    def draw_detections(self, frame, detections):
        """
        Draw detection boxes and labels on the frame
        
        Args:
            frame (numpy.ndarray): Input frame
            detections (list): List of detection dictionaries
            
        Returns:
            numpy.ndarray: Annotated frame
        """
        annotated_frame = frame.copy()
        
        for detection in detections:
            bbox = detection['bbox']
            confidence = detection['confidence']
            class_name = detection.get('class', 'object')
            
            # Extract coordinates
            x1, y1, x2, y2 = map(int, bbox)
            
            # Draw bounding box
            color = self.colors.get(class_name, (255, 255, 255))
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
            
            # Draw label background
            label = f"{class_name}: {confidence:.2%}"
            (label_width, label_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            
            # Draw label background rectangle
            cv2.rectangle(annotated_frame, 
                         (x1, y1 - label_height - 10), 
                         (x1 + label_width, y1), 
                         color, -1)
            
            # Draw label text
            cv2.putText(annotated_frame, label, 
                       (x1, y1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, 
                       self.colors['text'], 2)
        
        return annotated_frame
    
    def draw_stats(self, frame, fps, num_detections, device_info):
        """
        Draw performance statistics on the frame
        
        Args:
            frame (numpy.ndarray): Input frame
            fps (float): Current FPS
            num_detections (int): Number of detections
            device_info (str): Device information
            
        Returns:
            numpy.ndarray: Frame with stats
        """
        # Create stats overlay
        stats_frame = frame.copy()
        
        # Draw background for stats
        cv2.rectangle(stats_frame, (10, 10), (300, 120), (0, 0, 0), -1)
        cv2.rectangle(stats_frame, (10, 10), (300, 120), (255, 255, 255), 2)
        
        # Draw stats text
        cv2.putText(stats_frame, f"FPS: {fps:.1f}", (20, 35), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(stats_frame, f"Detections: {num_detections}", (20, 60), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(stats_frame, f"Device: {device_info}", (20, 85), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(stats_frame, f"Conf: {self.conf_threshold:.2f}", (20, 110), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        return stats_frame
    
    def calculate_fps(self):
        """Calculate current FPS from frame times"""
        if len(self.frame_times) < 2:
            return 0.0
        
        # Calculate average time between frames
        time_diffs = [self.frame_times[i] - self.frame_times[i-1] for i in range(1, len(self.frame_times))]
        avg_time = sum(time_diffs) / len(time_diffs)
        
        return 1.0 / avg_time if avg_time > 0 else 0.0
    
    def run_realtime_detection(self, camera_id=0, output_path=None):
        """
        Run real-time human detection on camera feed
        
        Args:
            camera_id (int): Camera device ID
            output_path (str): Optional path to save video output
        """
        # Initialize camera
        cap = cv2.VideoCapture(camera_id)
        
        if not cap.isOpened():
            print(f"❌ Error: Could not open camera {camera_id}")
            return
        
        # Get camera properties
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps_camera = cap.get(cv2.CAP_PROP_FPS)
        
        print(f"📹 Camera initialized: {frame_width}x{frame_height} @ {fps_camera:.1f} FPS")
        print(f"🎯 Device: {self.device.upper()}")
        print(f"⚙️  Confidence threshold: {self.conf_threshold}")
        print("🚀 Starting real-time detection... Press 'q' to quit, 's' to save screenshot")
        
        # Initialize video writer if output path is provided
        video_writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            video_writer = cv2.VideoWriter(output_path, fourcc, 30.0, (frame_width, frame_height))
            print(f"📹 Recording to: {output_path}")
        
        # Performance tracking
        frame_count = 0
        start_time = time.time()
        
        try:
            while True:
                # Read frame
                ret, frame = cap.read()
                if not ret:
                    print("❌ Error reading frame from camera")
                    break
                
                # Record frame time for FPS calculation
                frame_time = time.time()
                self.frame_times.append(frame_time)
                
                # Detect humans and objects
                annotated_frame, detections = self.detect_all(frame)
                
                # Calculate FPS
                current_fps = self.calculate_fps()
                self.fps_queue.append(current_fps)
                
                # Draw statistics
                device_info = f"{self.device.upper()}" + (" (CUDA)" if self.cuda_available else "")
                final_frame = self.draw_stats(annotated_frame, current_fps, len(detections), device_info)
                
                # Display frame
                cv2.imshow('YOLOv8 Human Detection - Real-time', final_frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    print("👋 Quitting...")
                    break
                elif key == ord('s'):
                    # Save screenshot
                    timestamp = time.strftime("%Y%m%d_%H%M%S")
                    screenshot_path = f"human_detection_{timestamp}.jpg"
                    cv2.imwrite(screenshot_path, final_frame)
                    print(f"📸 Screenshot saved: {screenshot_path}")
                elif key == ord('c'):
                    # Toggle confidence threshold
                    self.conf_threshold = 0.3 if self.conf_threshold > 0.5 else 0.7
                    print(f"⚙️  Confidence threshold changed to: {self.conf_threshold}")
                
                # Write frame to video if recording
                if video_writer:
                    video_writer.write(final_frame)
                
                frame_count += 1
                
        except KeyboardInterrupt:
            print("\n👋 Interrupted by user")
        
        finally:
            # Cleanup
            cap.release()
            if video_writer:
                video_writer.release()
            cv2.destroyAllWindows()
            
            # Print final statistics
            total_time = time.time() - start_time
            avg_fps = frame_count / total_time if total_time > 0 else 0
            print(f"\n📊 Final Statistics:")
            print(f"   Total frames processed: {frame_count}")
            print(f"   Total time: {total_time:.2f} seconds")
            print(f"   Average FPS: {avg_fps:.1f}")
            print(f"   Device used: {self.device.upper()}")

def main():
    """Main function to run the real-time human detection"""
    parser = argparse.ArgumentParser(description='Real-time YOLOv8 Human Detection')
    parser.add_argument('--model', type=str, default='best.pt', 
                       help='Path to YOLOv8 model file (default: best.pt)')
    # Remove device argument, always auto-select in code
    parser.add_argument('--conf', type=float, default=0.5,
                       help='Confidence threshold (default: 0.5)')
    parser.add_argument('--iou', type=float, default=0.45,
                       help='IoU threshold for NMS (default: 0.45)')
    parser.add_argument('--camera', type=int, default=0,
                       help='Camera device ID (default: 0)')
    parser.add_argument('--output', type=str, default=None,
                       help='Output video path (optional)')
    
    args = parser.parse_args()
    
    # Check if model file exists
    if not os.path.exists(args.model):
        print(f"❌ Error: Model file '{args.model}' not found!")
        print("Please make sure the model file exists in the current directory.")
        return
    
    # Create detector (device auto-selected)
    try:
        detector = HumanDetector(
            model_path=args.model,
            conf_threshold=args.conf,
            iou_threshold=args.iou
        )
        
        # Run real-time detection
        detector.run_realtime_detection(
            camera_id=args.camera,
            output_path=args.output
        )
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Please check your model file and camera setup.")

if __name__ == "__main__":
    main() 