
import asyncio
from backend.scanner import FreeFireScanner

async def test_extraction():
    image_path = "C:/Users/h/.gemini/antigravity/brain/3a98bc86-1d98-4dc6-a99a-a5ef2abdcd05/uploaded_media_1769433989622.jpg"
    
    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()
            
        scanner = FreeFireScanner()
        # Initialize reader explicitly (usually done in __init__ but good to be sure)
        
        result = scanner.extract_data(image_bytes)
        print("\n--- EXTRACTION RESULT ---")
        import json
        print(json.dumps(result, indent=2))
        
    except FileNotFoundError:
        print(f"Error: Could not find image at {image_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_extraction())
