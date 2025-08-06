import streamlit as st
import cv2
import numpy as np
from ultralytics import YOLO
import tempfile
import os
from PIL import Image
import io

# Page configuration
st.set_page_config(
    page_title="YOLOv8 Human Detection",
    page_icon="👤",
    layout="wide"
)

# Title and description
st.title("👤 YOLOv8 Human Detection")
st.markdown("Upload an image to detect humans using YOLOv8 model")

# Load the model
@st.cache_resource
def load_model():
    """Load the YOLOv8 model"""
    try:
        model = YOLO('best.pt')
        return model
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None

# Function to process image
def process_image(image, model):
    """Process image and return detection results"""
    try:
        # Convert PIL image to numpy array
        if isinstance(image, Image.Image):
            image_np = np.array(image)
        else:
            image_np = image
            
        # Run inference
        results = model(image_np)
        
        # Get the first result
        result = results[0]
        
        # Draw detections on image
        annotated_image = result.plot()
        
        # Get detection info
        boxes = result.boxes
        if boxes is not None:
            num_detections = len(boxes)
            confidences = boxes.conf.cpu().numpy()
            classes = boxes.cls.cpu().numpy()
            
            detection_info = []
            for i in range(num_detections):
                conf = confidences[i]
                class_id = int(classes[i])
                detection_info.append({
                    'class': 'Human',
                    'confidence': f"{conf:.2%}",
                    'bbox': boxes.xyxy[i].cpu().numpy().tolist()
                })
        else:
            detection_info = []
            
        return annotated_image, detection_info
        
    except Exception as e:
        st.error(f"Error processing image: {e}")
        return None, []

# Load model
with st.spinner("Loading YOLOv8 model..."):
    model = load_model()

if model is None:
    st.error("Failed to load model. Please check if 'best.pt' file exists in the current directory.")
    st.stop()

# File uploader
uploaded_file = st.file_uploader(
    "Choose an image file",
    type=['png', 'jpg', 'jpeg', 'bmp', 'tiff'],
    help="Upload an image to detect humans"
)

# Sidebar for settings
with st.sidebar:
    st.header("⚙️ Settings")
    
    # Confidence threshold
    conf_threshold = st.slider(
        "Confidence Threshold",
        min_value=0.0,
        max_value=1.0,
        value=0.5,
        step=0.05,
        help="Minimum confidence score for detections"
    )
    
    # Model info
    st.header("📊 Model Info")
    st.info("Model: YOLOv8 Human Detection")
    st.info("Classes: Human")
    st.info("Input Size: 640x640")

# Main content
if uploaded_file is not None:
    # Create two columns
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("📸 Original Image")
        
        # Display original image
        image = Image.open(uploaded_file)
        st.image(image, caption="Original Image", use_column_width=True)
        
        # Image info
        st.info(f"Image size: {image.size[0]} x {image.size[1]} pixels")
    
    with col2:
        st.subheader("🎯 Detection Results")
        
        # Process image
        with st.spinner("Processing image..."):
            annotated_image, detection_info = process_image(image, model)
        
        if annotated_image is not None:
            # Convert numpy array to PIL Image for display
            if isinstance(annotated_image, np.ndarray):
                annotated_image = Image.fromarray(annotated_image)
            
            st.image(annotated_image, caption="Detected Humans", use_column_width=True)
            
            # Display detection information
            if detection_info:
                st.success(f"Found {len(detection_info)} human(s)")
                
                # Create a table for detection details
                detection_data = []
                for i, detection in enumerate(detection_info):
                    detection_data.append({
                        "Detection #": i + 1,
                        "Class": detection['class'],
                        "Confidence": detection['confidence'],
                        "BBox": f"[{detection['bbox'][0]:.1f}, {detection['bbox'][1]:.1f}, {detection['bbox'][2]:.1f}, {detection['bbox'][3]:.1f}]"
                    })
                
                st.dataframe(detection_data, use_container_width=True)
                
                # Download button for annotated image
                img_buffer = io.BytesIO()
                annotated_image.save(img_buffer, format='PNG')
                img_buffer.seek(0)
                
                st.download_button(
                    label="📥 Download Annotated Image",
                    data=img_buffer.getvalue(),
                    file_name="human_detection_result.png",
                    mime="image/png"
                )
            else:
                st.warning("No humans detected in the image")
        else:
            st.error("Failed to process image")

# Footer
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center'>
        <p>Built with ❤️ using YOLOv8 and Streamlit</p>
        <p>Model trained on human detection dataset</p>
    </div>
    """,
    unsafe_allow_html=True
) 