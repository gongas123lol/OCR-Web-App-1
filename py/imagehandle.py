import pytesseract
import sys
from PIL import Image
import os

path = os.path.join('C:\\Users\\ferra\\WebstormProjects\\OCR-web-app\\uploads', sys.argv[1])
# Open the image file
image = Image.open(path)


# Perform OCR using PyTesseract
text = pytesseract.image_to_string(image)

# Print the extracted text
print(text)
