import requests
from bs4 import BeautifulSoup

def fetch_github_trending():
    url = "https://github.com/trending"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")

    repos = []

    for article in soup.select("article.Box-row"):
        print("Article found")

        # Updated repo name parsing
        repo_link = article.select_one("h2 > a")
        if repo_link:
            repo_name = repo_link.get("href", "").strip("/")  # e.g. 'torvalds/linux'
        else:
            print("No repo link found")
            continue

        # Updated stars parsing
        stars_tag = article.select_one("a[href$='/stargazers']")
        stars = stars_tag.text.strip().replace(",", "") if stars_tag else "0"

        print(f"Repo: {repo_name}, Stars: {stars}")
        repos.append({"name": repo_name, "stars": stars})

    return repos
