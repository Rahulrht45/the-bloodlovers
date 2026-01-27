import cv2
import numpy as np
import easyocr
import re

class FreeFireScanner:
    def __init__(self):
        self.reader = easyocr.Reader(['en'], gpu=False)
        self.TARGET_WIDTH = 1920
        self.TARGET_HEIGHT = 1080

    def preprocess_image(self, image_bytes):
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None: raise ValueError("Invalid image")
        
        # Resize to standard width, maintaining aspect ratio
        h, w = img.shape[:2]
        if w != self.TARGET_WIDTH:
            aspect = self.TARGET_WIDTH / w
            new_h = int(h * aspect)
            img = cv2.resize(img, (self.TARGET_WIDTH, new_h))
        return img

    def find_anchor(self, img):
        # Scan top half for headers
        crop = img[0:600, :] 
        results = self.reader.readtext(crop)
        
        name_pos = None
        dmg_pos = None
        
        for (bbox, text, prob) in results:
            t = text.upper().replace(" ", "")
            if "NAME" in t:
                name_pos = bbox
            if "DMG" in t or "DAMAGE" in t:
                dmg_pos = bbox
                
        # Calculate Grid Origin
        # Default fallback
        base_y = 360
        base_x = 100
        
        if name_pos:
            # Bottom of NAME text is the start of the list + padding
            base_y = int(name_pos[2][1]) + 20 
            base_x = int(name_pos[0][0])
        elif dmg_pos:
            # Back calculate if NAME is missing (DMG is approx +750px from Name)
            base_y = int(dmg_pos[2][1]) + 20
            base_x = int(dmg_pos[0][0]) - 900
            
        return base_x, base_y

    def extract_data(self, image_bytes):
        img = self.preprocess_image(image_bytes)
        
        # 1. Dynamic Anchor
        base_x, base_y = self.find_anchor(img)
        if base_x < 0: base_x = 50
        
        # 2. Define Fixed Grid relative to Anchor
        # Adjusted offsets for 1920w
        w_name = 450
        x_kill = base_x + 600  # K column
        x_asst = base_x + 750  # A column (approx 150px spacing)
        x_dmg = base_x + 880   # DMG column
        x_surv = base_x + 1300 # Survival
        
        row_h = 100 # Standard row height
        
        players = []
        
        for i in range(4):
            y = base_y + (i * row_h)
            h_crop = row_h - 15 # smaller gap
            
            # Crop Regions
            r_name = img[y:y+h_crop, base_x:base_x+w_name]
            r_kill = img[y:y+h_crop, x_kill:x_kill+120]
            r_asst = img[y:y+h_crop, x_asst:x_asst+120]
            r_dmg  = img[y:y+h_crop, x_dmg:x_dmg+200]
            r_surv = img[y:y+h_crop, x_surv:x_surv+200]
            
            p = {
                "name": self.clean_name(self._ocr(r_name)),
                "kills": self.clean_int(self._ocr(r_kill, nums=True)),
                "assists": self.clean_int(self._ocr(r_asst, nums=True)),
                "damage": self.clean_int(self._ocr(r_dmg, nums=True)),
                "survival": self.clean_time(self._ocr(r_surv))
            }
            
            # Basic validation
            if len(p['name']) > 1:
                # Sanity check: damage usually > kills
                players.append(p)
                
        return {"players": players}

    def _ocr(self, roi, nums=False):
        try:
            # Gray + Invert often helps with glowing text on dark background
            gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            # Contrast stretch
            gray = cv2.normalize(gray, None, 0, 255, cv2.NORM_MINMAX)
            # Invert usually helps white text on dark bg
            inverted = cv2.bitwise_not(gray)
            
            allow = '0123456789' if nums else None
            res = self.reader.readtext(inverted, detail=0, allowlist=allow)
            return " ".join(res)
        except: return ""

    def clean_int(self, text):
        t = ''.join(c for c in text if c.isdigit())
        return int(t) if t else 0

    def clean_time(self, text):
        # Handle 17'14" -> 17:14
        text = text.replace("'", ":").replace('"', "").replace(" ", "").replace(".", ":")
        m = re.search(r'\d{1,2}:\d{2}', text)
        return m.group() if m else "00:00"

    def clean_name(self, text):
        # Allow special chars seen in esports tags: #, •, !, -, |, spaces
        return ''.join(c for c in text if c.isalnum() or c in ['#', '•', '!', '-', '|', ' ', '_', '.']).strip()
