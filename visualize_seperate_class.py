import os
import cv2
import argparse

def visualize_one_class(class_folder):
    images_folder = os.path.join(class_folder, "images")
    labels_folder = os.path.join(class_folder, "labels")
    class_name = os.path.basename(class_folder)
    image_names = sorted([f for f in os.listdir(images_folder) if f.endswith('.png')])
    label_names = sorted([f for f in os.listdir(labels_folder) if f.endswith('.txt')])
    assert len(image_names) == len(label_names), "Mismatch between images and labels."
    num_images = len(image_names)
    idx = 0
    while True:
        image_file = os.path.join(images_folder, image_names[idx])
        label_file = os.path.join(labels_folder, label_names[idx])
        image = cv2.imread(image_file)
        h, w = image.shape[:2]
        with open(label_file, 'r') as f:
            lines = f.read().splitlines()
        for line in lines:
            parts = line.strip().split()
            if len(parts) != 5:
                continue
            _, x, y, bw, bh = map(float, parts)
            cx = int(x * w)
            cy = int(y * h)
            bw = int(bw * w)
            bh = int(bh * h)
            x1 = cx - bw // 2
            y1 = cy - bh // 2
            x2 = cx + bw // 2
            y2 = cy + bh // 2
            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(image, class_name, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        print(f"Image: {image_names[idx]}, Boxes: {len(lines)}")
        image_resized = cv2.resize(image, (640, 480))
        cv2.imshow(f"One-Class Visualizer: {class_name}", image_resized)
        key = cv2.waitKey(0)
        if key == ord('q') or key == 27 or key == -1:
            break
        elif key == ord('d'):
            idx = (idx + 1) % num_images
        elif key == ord('a'):
            idx = (idx - 1) % num_images
    cv2.destroyAllWindows()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Visualize one-class YOLO dataset.")
    parser.add_argument('--class_folder', type=str, required=True, help='Path to the class folder (e.g., data/separated_dataset/toolbox)')
    args = parser.parse_args()
    visualize_one_class(args.class_folder) 