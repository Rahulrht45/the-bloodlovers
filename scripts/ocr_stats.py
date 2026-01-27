import easyocr
import json
import cv2
import numpy as np
import os

def extract_game_stats(image_path):
    # Initialize easyocr reader (English)
    reader = easyocr.Reader(['en'])
    
    # Read the image
    results = reader.readtext(image_path)
    
    # Data structures to hold our raw extracted data
    data = []
    for (bbox, text, prob) in results:
        # Get coordinates
        (tl, tr, br, bl) = bbox
        top_left = (int(tl[0]), int(tl[1]))
        bottom_right = (int(br[0]), int(br[1]))
        
        # Center Y for row grouping
        center_y = (top_left[1] + bottom_right[1]) // 2
        
        data.append({
            "text": text,
            "y": center_y,
            "x": top_left[0],
            "h": bottom_right[1] - top_left[1]
        })

    # Group by rows (items within ~20 pixels of each other vertically)
    data.sort(key=lambda x: x['y'])
    rows = []
    if data:
        current_row = [data[0]]
        for i in range(1, len(data)):
            if abs(data[i]['y'] - current_row[0]['y']) < 30:
                current_row.append(data[i])
            else:
                rows.append(sorted(current_row, key=lambda x: x['x']))
                current_row = [data[i]]
        rows.append(sorted(current_row, key=lambda x: x['x']))

    # Filter rows to find player stats
    # Looking for rows that have at least 4 items and contain numbers for K/DMG
    players = []
    for row in rows:
        row_text = [item['text'] for item in row]
        # Heuristic: Player rows in this specific screenshot usually have a Name, then K, A, DMG etc.
        # We look for a pattern where we have a string followed by digits
        
        # In the screenshot, columns are roughly: NAME, K, A, DMG, REVIVAL, SURVIVAL
        # We filter for rows that look like player data
        digit_count = sum(1 for item in row_text if item.isdigit() or ("'" in item and '"' in item))
        
        if len(row) >= 3 and digit_count >= 2:
            # Simple mapping logic for this specific layout
            # Name is usually the first or second element (sometimes the icon is detected first)
            name = ""
            kills = "0"
            damage = "0"
            
            # Find the first item that looks like a name (not just 1 digit)
            for item in row:
                t = item['text']
                if len(t) > 3 and not t.isdigit():
                    name = t
                    break
            
            # Find Kills and Damage
            # Kills is usually the first digit after the name or in the 30% - 40% area of the image width
            # Damage is usually a larger number in the middle
            numeric_items = [item for item in row if item['text'].isdigit()]
            if len(numeric_items) >= 2:
                # Based on the screenshot: K is 1st number, DMG is 3rd number (usually largest)
                # But let's be smarter: DMG is usually > 100
                kills = numeric_items[0]['text']
                for n in numeric_items:
                    if int(n['text']) > 100:
                        damage = n['text']
                        break
            
            if name:
                players.append({
                    "player_name": name,
                    "kills": kills,
                    "damage": damage
                })

    return players

if __name__ == "__main__":
    image_file = "uploaded_image_1769006402652.jpg" # Update with actual filename
    if os.path.exists(image_file):
        stats = extract_game_stats(image_file)
        
        # Save to JSON
        with open('stats.json', 'w') as f:
            json.dump(stats, f, indent=4)
        
        print(f"Successfully extracted {len(stats)} players.")
        print(json.dumps(stats, indent=4))
    else:
        print(f"Error: {image_file} not found.")
