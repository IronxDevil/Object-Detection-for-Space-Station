@echo off
echo Starting YOLOv8 Human Detection Real-time App...
echo.
echo Make sure you have installed the requirements:
echo pip install -r requirements_apps.txt
echo.
echo Controls:
echo - Press 'Q' to quit
echo - Press 'S' to save screenshot
echo - Press 'C' to toggle confidence threshold
echo.
echo Starting with CUDA support (if available)...
python realtime_detection.py --device cuda
pause 