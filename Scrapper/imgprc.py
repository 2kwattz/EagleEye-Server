from playwright.sync_api import sync_playwright
from PIL import Image,ImageEnhance, ImageFilter
import pytesseract


# Test Screenshot (This is only for feasibility study, If idea is feasible. Screenshots would be taken
#  dynamically time to time for corresponding sets)

def preprocessImagePytesseract(image_path):
    try:
        image = Image.open(image_path)

        image = image.convert('L')
        base_width = 19000
        w_percent = (base_width / float(image.size[0]))
        h_size = int((float(image.size[1]) * float(w_percent)))
        image = image.resize((base_width, h_size), Image.ANTIALIAS)
        image = image.filter(ImageFilter.SHARPEN)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2)
        threshold = 160
        image = image.point(lambda x: 0 if x < threshold else 255)
        return image
    except Exception as e:
        pass

def extractTextFromImagePytesseract(image_path):
    try:
        image = Image.open(image_path)
        preprocessed_image = preprocessImagePytesseract(image_path)
        extractedText = pytesseract.image_to_string(preprocessed_image)
        return extractedText.strip()
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return None

imageText = extractTextFromImagePytesseract("ss.png")
print(imageText)