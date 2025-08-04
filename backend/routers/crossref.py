# backend/routers/crossref.py
from fastapi import APIRouter
import requests

router = APIRouter()

@router.get("")
def get_crossref(topic: str = "AI"):
    url = f"https://api.crossref.org/works?query={topic}&rows=10"
    r = requests.get(url)
    return r.json()
