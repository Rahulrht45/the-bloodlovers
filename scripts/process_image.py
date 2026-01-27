from PIL import Image, ImageDraw
import sys

def process_image(input_path, output_path):
    print(f"Processing {input_path} to {output_path}")
    img = Image.open(input_path).convert("RGBA")
    
    # Create a mask for flood filling
    # We want to flood fill from (0,0), (w-1, 0), (0, h-1), (w-1, h-1) to ensure we get all surrounding black.
    
    # Alternatively, since we know it's a solid black background,
    # we can iterate pixels. But flood fill is safer to avoid removing internal blacks.
    
    ImageDraw.floodfill(img, (0, 0), (0, 0, 0, 0), thresh=20)
    ImageDraw.floodfill(img, (img.width-1, 0), (0, 0, 0, 0), thresh=20)
    ImageDraw.floodfill(img, (0, img.height-1), (0, 0, 0, 0), thresh=20)
    ImageDraw.floodfill(img, (img.width-1, img.height-1), (0, 0, 0, 0), thresh=20)

    # Optional: Soften edges?
    # For now, let's just save.
    img.save(output_path, "PNG")
    print("Done")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        process_image(sys.argv[1], sys.argv[2])
