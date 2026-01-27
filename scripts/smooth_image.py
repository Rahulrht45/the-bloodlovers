from PIL import Image, ImageFilter

def smooth_edges(input_path, output_path):
    print(f"Smoothing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # Split channels
    r, g, b, a = img.split()
    
    # Blur the alpha channel for softness
    # A small blur removes the jagged pixel steps from flood fill
    a_blurred = a.filter(ImageFilter.GaussianBlur(1))
    
    # Recombine
    img_smooth = Image.merge("RGBA", (r, g, b, a_blurred))
    
    img_smooth.save(output_path, "PNG")
    print("Done.")

if __name__ == "__main__":
    import sys
    smooth_edges(sys.argv[1], sys.argv[2])
