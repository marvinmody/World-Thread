from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scraper.github import fetch_github_trending  # make sure this import works

app = FastAPI()

# Allow frontend requests from your development origin (e.g., React on localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Worldthread backend is running."}

@app.get("/trending")
def get_trending():
    return fetch_github_trending()
