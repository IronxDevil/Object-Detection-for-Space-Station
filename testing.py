import os
import cv2
from ultralytics import YOLO
import matplotlib.pyplot as plt

# ------------------------------ Config ------------------------------
# Model paths
fire_model_path = 'runs/detect/FireExtinguisher/weights/best.pt'
toolbox_model_path = 'runs/detect/ToolBox/weights/best.pt'
oxygen_model_path = 'runs/detect/OxygenTank/weights/best.pt'

model_paths = [fire_model_path, toolbox_model_path, oxygen_model_path]
class_names = ['FireExtinguisher', 'ToolBox', 'OxygenTank']
color_map = {
    'FireExtinguisher': (0, 255, 0),
    'ToolBox': (255, 0, 0),
    'OxygenTank': (0, 0, 255)
}
# Input and output folders
input_folder = 'test_images'
output_folder = 'result_photos'
os.makedirs(output_folder, exist_ok=True)

# Confidence threshold
CONF_THRESHOLD = 0.5

# ------------------------------ Load Models ------------------------------
models = [YOLO(path) for path in model_paths]

# ------------------------------ Process All Images ------------------------------
image_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

print(f"\n📁 Found {len(image_files)} test images. Starting ensemble detection...\n")

for img_name in image_files:
    img_path = os.path.join(input_folder, img_name)
    image = cv2.imread(img_path)
    all_detections = []

    for model, class_name in zip(models, class_names):
        results = model(img_path)
        for r in results:
            if r.boxes is not None:
                boxes = r.boxes.xyxy.cpu().numpy()
                confs = r.boxes.conf.cpu().numpy()
                for box, conf in zip(boxes, confs):
                    if float(conf) > CONF_THRESHOLD:
                        det = {
                            'class': class_name,
                            'conf': float(conf),
                            'box': [float(x) for x in box]
                        }
                        all_detections.append(det)
                        
    # Draw all detections
    for det in all_detections:
        x1, y1, x2, y2 = map(int, det['box'])
        label = f"{det['class']} {det['conf']:.2f}"
        color = color_map.get(det['class'], (255, 255, 0))
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
        cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    # Save result image
    save_path = os.path.join(output_folder, img_name)
    cv2.imwrite(save_path, image)
    print(f"✅ Saved: {save_path}")

print(f"\n🎉 Ensemble detection completed for all images.\n🖼️ Output saved to: {output_folder}")