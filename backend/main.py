import requests
import time
import os
import random
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env.local")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Configuration ===
SEMANTIC_SCHOLAR_API_KEY = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
HEADERS = {"x-api-key": SEMANTIC_SCHOLAR_API_KEY} if SEMANTIC_SCHOLAR_API_KEY else {}

TOPIC_QUERIES = {
    "AI": "artificial intelligence",
    "Space": "space exploration OR astronomy OR astrophysics",
    "Environment": "climate change OR environmental science OR ecology",
    "Technology": "machine learning OR computer science",
    "Climate": "climate change OR global warming",
    "Medicine": "medical research OR healthcare",
    "Quantum": "quantum computing OR quantum physics",
}

affiliation_cache = {}

def semantic_request_with_retry(url, headers, params=None, retries=3):
    """Make request to Semantic Scholar with exponential backoff retry"""
    for attempt in range(retries):
        try:
            # Log full URL
            full_url = requests.Request('GET', url, params=params).prepare().url
            print(f"🌐 Requesting: {full_url}")

            res = requests.get(full_url, headers=headers, timeout=10)
            if res.status_code == 200:
                return res
            elif res.status_code == 429:
                wait_time = (2 ** attempt) + random.uniform(0.5, 1.5)
                print(f"⏳ Rate limited (attempt {attempt + 1}/{retries}). Waiting {wait_time:.2f}s...")
                time.sleep(wait_time)
            else:
                res.raise_for_status()
        except requests.exceptions.Timeout:
            print(f"⏰ Request timeout (attempt {attempt + 1}/{retries})")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
        except requests.exceptions.RequestException as e:
            print(f"❌ Request error (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)

    raise Exception(f"Failed after {retries} attempts")


def geocode_affiliation(affiliation_name):
    """Geocode affiliation with caching and rate limiting"""
    if not affiliation_name or len(affiliation_name.strip()) < 3:
        return None
    
    # Clean affiliation name
    clean_name = affiliation_name.strip()
    if clean_name in affiliation_cache:
        return affiliation_cache[clean_name]

    print(f"🌍 Geocoding: {clean_name}")
    try:
        # Rate limit for Nominatim (1 request per second)
        time.sleep(1.1)
        
        nominatim_url = f"https://nominatim.openstreetmap.org/search"
        params = {
            "q": clean_name,
            "format": "json",
            "limit": 1,
            "addressdetails": 1
        }
        
        r = requests.get(
            nominatim_url, 
            params=params,
            headers={"User-Agent": "Worldthread/1.0"},
            timeout=10
        )
        r.raise_for_status()
        results = r.json()
        
        if results and len(results) > 0:
            lat = float(results[0]['lat'])
            lng = float(results[0]['lon'])  # Changed from 'lon' to 'lng' for consistency
            coords = {"lat": lat, "lng": lng}
            affiliation_cache[clean_name] = coords
            print(f"✅ Geocoded {clean_name} -> {lat:.2f}, {lng:.2f}")
            return coords
        else:
            print(f"❌ No geocoding results for: {clean_name}")
            
    except Exception as e:
        print(f"❌ Geocoding error for '{clean_name}': {e}")
    
    # Cache negative results to avoid repeated failures
    affiliation_cache[clean_name] = None
    return None

@app.get("/papers")
def get_topic_papers(request: Request):
    print("🔥 /papers endpoint hit")
    query_topic = request.query_params.get("topic")
    all_nodes = []

    # Determine which topics to search
    if query_topic and query_topic in TOPIC_QUERIES:
        topics_to_search = {query_topic: TOPIC_QUERIES[query_topic]}
        print(f"🎯 Filtering for topic: {query_topic}")
    else:
        topics_to_search = TOPIC_QUERIES
        print("🔄 No topic filter, fetching all topics")

    # Dev mode throttling
    if os.getenv("DEV_MODE") == "true":
        print("🧪 Dev mode: additional throttling")
        time.sleep(2)

    for i, (topic, query) in enumerate(topics_to_search.items()):
        print(f"🔍 Querying topic {i+1}/{len(topics_to_search)}: {topic} -> {query}")
        
        try:
            # Respect Semantic Scholar rate limit (1 req/sec)
            if i > 0:  # Don't sleep before first request
                print("⏳ Respecting rate limit...")
                time.sleep(1.5)  # Extra buffer for safety
            
            url = f"https://api.semanticscholar.org/graph/v1/paper/search"
            params = {
                "query": query,
                "limit": 8,  # Increased limit to get more results
                "fields": "title,abstract,url,authors.name,authors.affiliations,year,publicationDate"
            }
            
            # Use retry mechanism
            res = semantic_request_with_retry(url, HEADERS, params=params)
            data = res.json()
            
            papers = data.get('data', [])
            print(f"📄 Found {len(papers)} papers for {topic}")

            processed_count = 0
            for paper in papers:
                if not paper.get("authors"):
                    continue

                # Try to get a usable affiliation from any author
                affiliation_name = None
                for author in paper["authors"]:
                    affiliations = author.get("affiliations", [])
                    if affiliations and len(affiliations) > 0:
                        # Take first non-empty affiliation
                        affiliation_name = affiliations[0]
                        if affiliation_name and len(affiliation_name.strip()) > 3:
                            break

                if not affiliation_name:
                    continue

                coords = geocode_affiliation(affiliation_name)
                if coords:
                    # Format authors list
                    authors_list = []
                    for author in paper["authors"]:
                        if "name" in author and author["name"]:
                            authors_list.append(author["name"])
                    
                    # Create publication date
                    pub_date = paper.get("publicationDate") or paper.get("year") or "Unknown"
                    
                    node = {
                        "type": "semantic_scholar",
                        "title": paper.get("title", "Untitled Paper"),
                        "abstract": paper.get("abstract", "No abstract available"),
                        "summary": paper.get("abstract", "No abstract available"),  # Alias for compatibility
                        "link": paper.get("url", ""),
                        "authors": ", ".join(authors_list) if authors_list else "Unknown Authors",
                        "published": str(pub_date),
                        "topic": topic,
                        "lat": coords["lat"],
                        "lng": coords["lng"]
                    }
                    all_nodes.append(node)
                    processed_count += 1
                    
                    # Limit nodes per topic to avoid overwhelming the map
                    if processed_count >= 5:
                        break

            print(f"✅ Added {processed_count} nodes for {topic}")

        except requests.exceptions.HTTPError as e:
            print(f"❌ HTTP error for topic {topic}: {e}")
            if hasattr(e.response, 'status_code') and e.response.status_code == 429:
                print("⚠️  Rate limited - consider reducing request frequency")
        except Exception as e:
            print(f"❌ Unexpected error for topic {topic}: {e}")

    print(f"✅ Returning {len(all_nodes)} total nodes")
    return all_nodes

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "cache_size": len(affiliation_cache),
        "api_key_configured": bool(SEMANTIC_SCHOLAR_API_KEY)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)