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

        # Repo name
        repo_link = article.select_one("h2 > a")
        if repo_link:
            repo_name = repo_link.get("href", "").strip("/")  # e.g. 'torvalds/linux'
        else:
            print("No repo link found")
            continue

        # Stars
        stars_tag = article.select_one("a[href$='/stargazers']")
        stars = stars_tag.text.strip().replace(",", "") if stars_tag else "0"

        # Description
        desc_tag = article.find("p")
        description = desc_tag.text.strip() if desc_tag else ""

        # Language
        lang_tag = article.select_one('span[itemprop="programmingLanguage"]')
        language = lang_tag.text.strip() if lang_tag else ""

        print(f"Repo: {repo_name}, Stars: {stars}")
        repos.append({
            "name": repo_name,
            "stars": stars,
            "description": description,
            "language": language
        })

    # Sort by stars
    repos.sort(key=lambda x: int(x["stars"]), reverse=True)

    return repos
