import urllib.request
import json
import os

TOKEN = "sbp_a0152b8c493d3ca2411692eeaaccb3012d0f6b1a"

def make_request(url):
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                return json.loads(response.read().decode())
    except Exception as e:
        return None

def get_projects():
    projects = make_request("https://api.supabase.com/v1/projects")
    return projects[0] if projects else None

project = get_projects()
if project:
    ref = project['id']
    keys = make_request(f"https://api.supabase.com/v1/projects/{ref}/api-keys") or \
           make_request(f"https://api.supabase.com/v1/projects/{ref}/api_keys")
    
    if keys:
        anon_key = next((k for k in keys if k['name'] == 'anon'), None)
        info = {
            "projectUrl": f"https://{ref}.supabase.co",
            "anonKey": anon_key['api_key'] if anon_key else ""
        }
        with open("supabase_config.json", "w") as f:
            json.dump(info, f, indent=2)
            print("Config saved to supabase_config.json")
    else:
        print("Keys fetch failed")
else:
    print("Project fetch failed")
