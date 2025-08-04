# backend/routers/arxiv.py

from fastapi import APIRouter, Query
import feedparser
import random

router = APIRouter()

ARXIV_FEEDS = {
    "AI": "http://export.arxiv.org/rss/cs.AI",
    "Space": "http://export.arxiv.org/rss/astro-ph",
    "Environmental": "http://export.arxiv.org/rss/q-bio.PE",
}

@router.get("/arxiv")
def get_arxiv(topic: str = "AI"):
    feed_url = ARXIV_FEEDS.get(topic, ARXIV_FEEDS["AI"])
    feed = feedparser.parse(feed_url)

    papers = []
    for entry in feed.entries[:30]:  # Increase to 30 or more
        papers.append({
            "title": entry.title,
            "summary": entry.summary,
            "published": entry.published,
            "link": entry.link,
            "authors": entry.author,
            "category": topic,
            "lat": random.uniform(-60, 60),
            "lng": random.uniform(-180, 180)
        })
    return papers
