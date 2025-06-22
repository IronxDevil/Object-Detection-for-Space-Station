# Object Detection for Space Station

A comprehensive object detection system using YOLOv8 for detecting safety equipment including Fire Extinguishers, Tool Boxes, and Oxygen Tanks. This project includes dataset preparation, model training utilities, and ensemble detection capabilities.

## Project Overview

This project implements a multi-class object detection system specifically designed for safety equipment detection in industrial or emergency settings. The system uses YOLOv8 architecture and supports both individual class training and ensemble detection.

### Detected Classes
- **FireExtinguisher** 
- **ToolBox**  
- **OxygenTank** 

## 🏗️ Project Structure

```
Object-Detection-Station/
├── ENV_SETUP/                 # Environment setup scripts
│   ├── create_env.bat         # Creates conda environment
│   ├── install_packages.bat   # Installs required packages
│   └── setup_env.bat          # Complete setup automation
├── data/                      # Dataset directory
│   ├── classes.txt            # Class definitions
│   ├── test/                  # Test dataset
│   │   ├── images/
│   │   └── labels/
│   └── separated_dataset/     # Class-separated datasets
├── test_images/               # Input images for testing
├── result_photos/             # Detection results output
├── runs/                      # Training results (auto-generated)
├── grouping.py                # Dataset organization utility
├── generate_oneclass_yamls.py # YAML config generator
├── testing.py                 # Ensemble detection script
├── visualize.py               # Dataset visualization tool
└── classes.txt                # Class names file
```

## 🚀 Quick Start

### 1. Environment Setup

Run the automated setup script (Windows):

```bash
cd ENV_SETUP
setup_env.bat
```

Or manually create the environment:

```bash
conda create --name EDU python=3.10 -y
conda activate EDU
conda install -c pytorch -c nvidia -c conda-forge pytorch torchvision pytorch-cuda=11.8 ultralytics -y
pip install opencv-contrib-python
```

### 2. Dataset Preparation

Organize your dataset using the grouping utility:

```bash
python grouping.py
```

This script will:
- Read class definitions from `classes.txt`
- Separate images by class into individual folders
- Create proper directory structure for training

### 3. Generate Training Configurations

Create YAML configuration files for each class:

```bash
python generate_oneclass_yamls.py
```

### 4. Train Models

Train individual models for each class:

```bash
# Activate environment
conda activate EDU

# Train FireExtinguisher model
yolo detect train data=data/separated_dataset/FireExtinguisher/FireExtinguisher.yaml model=yolov8s.pt epochs=100 imgsz=640

# Train ToolBox model  
yolo detect train data=data/separated_dataset/ToolBox/ToolBox.yaml model=yolov8s.pt epochs=100 imgsz=640

# Train OxygenTank model
yolo detect train data=data/separated_dataset/OxygenTank/OxygenTank.yaml model=yolov8s.pt epochs=100 imgsz=640
```

### 5. Run Ensemble Detection

Place test images in `test_images/` folder and run:

```bash
python testing.py
```

Results will be saved in `result_photos/` with bounding boxes and confidence scores.

## Features

### Dataset Management
- **Automated Grouping**: Separates multi-class datasets into individual class folders
- **Visualization Tool**: Interactive viewer for dataset inspection with bounding boxes
- **YAML Generation**: Automatic creation of YOLOv8 training configuration files

### Detection System
- **Ensemble Detection**: Combines multiple specialized models for robust detection
- **Configurable Confidence**: Adjustable confidence threshold (default: 0.5)
- **Color-coded Results**: Different colors for each class in output images
- **Batch Processing**: Processes entire folders of test images

### Visualization & Analysis
- **Interactive Viewer**: Navigate through dataset with keyboard controls
- **Real-time Annotation Display**: View ground truth bounding boxes and labels
- **Dataset Statistics**: Automatic counting and reporting of images per class

## 🎮 Usage Guide

### Dataset Visualization

```bash
python visualize.py
```

**Controls:**
- `D` - Next image
- `A` - Previous image  
- `T` - Switch to train mode
- `V` - Switch to validation mode
- `Q` or `ESC` - Quit

### Ensemble Detection Configuration

Edit `testing.py` to customize:

```python:testing.py
# Model paths - update after training
fire_model_path = 'runs/detect/FireExtinguisher/weights/best.pt'
toolbox_model_path = 'runs/detect/ToolBox/weights/best.pt'
oxygen_model_path = 'runs/detect/OxygenTank/weights/best.pt'

# Confidence threshold
CONF_THRESHOLD = 0.5

# Color mapping for visualization
color_map = {
    'FireExtinguisher': (0, 255, 0),    # Green
    'ToolBox': (255, 0, 0),             # Blue  
    'OxygenTank': (0, 0, 255)           # Red
}
```

## 📊 Expected Dataset Structure

Your dataset should follow this structure:

```
data/
├── classes.txt
├── test/
│   ├── images/
│   │   ├── image001.png
│   │   ├── image002.png
│   │   └── ...
│   └── labels/
│       ├── image001.txt
│       ├── image002.txt
│       └── ...
```

**Label Format** (YOLO format):
```
class_id center_x center_y width height
0 0.5 0.5 0.3 0.4
```

## 🔧 Requirements

- **Python**: 3.10+
- **PyTorch**: Latest with CUDA 11.8 support
- **Ultralytics**: YOLOv8 implementation
- **OpenCV**: Computer vision operations
- **Conda/Miniconda**: Environment management

## 📈 Training Tips

1. **Data Quality**: Ensure high-quality, diverse training images
2. **Augmentation**: YOLOv8 includes built-in augmentation
3. **Epochs**: Start with 100 epochs, adjust based on validation metrics
4. **Image Size**: 640x640 is recommended for balance of speed/accuracy
5. **Model Size**: Start with `yolov8n.pt` (nano) for faster training, upgrade to `yolov8s.pt` or `yolov8m.pt` for better accuracy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Troubleshooting

### Common Issues

**Environment Setup Fails:**
- Ensure Conda/Miniconda is properly installed
- Check CUDA compatibility with your GPU
- Try manual installation if batch scripts fail

**Training Errors:**
- Verify dataset structure matches expected format
- Check YAML file paths are absolute
- Ensure sufficient disk space for model checkpoints

**Detection Issues:**
- Verify model paths in `testing.py` point to trained weights
- Check input image formats (supports .jpg, .jpeg, .png)
- Adjust confidence threshold if getting too many/few detections

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review YOLOv8 documentation: https://docs.ultralytics.com/
3. Open an issue in this repository

---

**Star this repository if you found it helpful!**