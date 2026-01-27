import os
import io
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from scanner import FreeFireScanner
from supabase import create_client, Client

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")

supabase: Client = None
if url and key:
    supabase = create_client(url, key)
else:
    print("Warning: Supabase credentials not found. Database saving will be disabled.")

# Initialize Scanner
scanner = FreeFireScanner()

@app.post("/upload")
async def extract_api(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        
        # 1. STRICT Extraction (Just raw data)
        raw_data = scanner.extract_data(contents)
        players = raw_data.get("players", [])
        
        # 2. Add 'survival_time' key for frontend compatibility if needed
        for p in players:
            if 'survival' in p:
                p['survival_time'] = p['survival']

        response_data = {
            "match_type": "Battle Royale",
            "map": "Bermuda",
            "players": players
        }
        
        # 3. Save to Database
        if supabase:
            save_results(response_data)
            
        return {"success": True, "data": response_data}

    except ValueError as ve:
        return {"success": False, "error": str(ve)}
    except Exception as e:
        print(f"Server Error: {e}")
        return {"success": False, "error": "Internal Server Error processing image."}

def save_results(data):
    """Save match and player stats to Supabase."""
    try:
        # Save Match Log (Simplified for MVP, ideally strict schematic)
        # Note: You need a 'matches' table in Supabase for this to persist logs.
        # supabase.table('matches').insert({...}) 
        
        for p in data['players']:
            # Upsert Player Stats
            # Check if player exists
            res = supabase.table('players').select('*').eq('ign', p['name']).execute()
            
            if res.data:
                # Update
                existing = res.data[0]
                new_kills = existing.get('kills', 0) + p['kills']
                # new_damage = existing.get('damage', 0) + p['damage'] # If damage column exists
                
                supabase.table('players').update({
                    'kills': new_kills,
                    # 'damage': new_damage 
                }).eq('id', existing['id']).execute()
            else:
                # Create New Player
                supabase.table('players').insert({
                    'ign': p['name'],
                    'kills': p['kills'],
                    # 'damage': p['damage']
                }).execute()
                
    except Exception as e:
        print(f"Database Sync Error: {e}")

@app.get("/health")
def health():
    return {"status": "ok", "engine": "FreeFireScanner v1.0", "database": "Connected" if supabase else "Offline"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
