---
title: "Let AI Pick Tonight's Movie from Your Jellyfin Library"
description: "End the 'what should we watch?' debate: a short script sends your unwatched Jellyfin movies to a local AI model, tell it your mood, and it suggests three films you already own. Private, free and offline."
publishDate: "2026-10-20"
difficulty: "intermediate"
duration: "20 min"
tags: ["ai", "jellyfin", "ollama", "llm", "python"]
---

## How It Works

You own plenty of movies you haven't watched, and still spend 20 minutes scrolling. This tutorial connects two things you may already run:

1. **Jellyfin** knows every movie you own and which ones you haven't watched.
2. **Ollama** runs an AI model on your own hardware.

A short Python script asks Jellyfin for a random batch of your **unwatched** movies, with their genres, ratings and descriptions, sends them to the AI along with the mood you type ("something funny and short", "a thriller, nothing too violent"), and prints its top three picks, **only from movies you own**. Nothing leaves your home.

## What You'll Need

- A Jellyfin server with a movie library, like our [Jellyfin on Raspberry Pi 5](/tutorials/jellyfin-raspberry-pi-5) setup
- Ollama with a model pulled, on the same machine or another one at home, set up with our [Pi LLM tutorial](/tutorials/run-local-llm-raspberry-pi) or [gaming PC tutorial](/tutorials/local-ai-gaming-pc-ollama)
- Python 3, which Raspberry Pi OS already includes. The script uses only Python's standard library, so there's nothing to install.

---

## Step 1: Create a Jellyfin API Key

In Jellyfin, go to **Dashboard → API Keys**, click **+**, and name it "movie-night". Copy the key. It gives full access to your server, so keep it private and on your home network.

---

## Step 2: Save the Script

On the Pi (or any computer at home), create the file:

```bash
nano ~/movie-night.py
```

Paste this in:

```python
#!/usr/bin/env python3
"""Ask a local AI to pick tonight's movie from your unwatched Jellyfin films."""
import json
import sys
import urllib.parse
import urllib.request

JELLYFIN = "http://localhost:8096"   # your Jellyfin address
API_KEY = "YOUR-JELLYFIN-API-KEY"    # Dashboard -> API Keys
JELLYFIN_USER = "YOUR-USERNAME"      # whose "unwatched" list to use
OLLAMA = "http://localhost:11434"    # your Ollama address
MODEL = "llama3.2:3b"                # any model you've pulled
HOW_MANY = 60                        # random unwatched movies to consider


def jellyfin(path, **params):
    url = f"{JELLYFIN}{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"Authorization": f'MediaBrowser Token="{API_KEY}"'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    mood = " ".join(sys.argv[1:]) or "something fun that most people would enjoy"

    users = jellyfin("/Users")
    user = next((u for u in users if u["Name"].lower() == JELLYFIN_USER.lower()), None)
    if user is None:
        sys.exit(f"No Jellyfin user called {JELLYFIN_USER!r}")

    items = jellyfin("/Items", userId=user["Id"], includeItemTypes="Movie", recursive="true",
                     isPlayed="false", sortBy="Random", limit=HOW_MANY,
                     fields="Genres,Overview,OfficialRating")["Items"]
    if not items:
        sys.exit("No unwatched movies found.")

    lines = []
    for m in items:
        genres = ", ".join(m.get("Genres", [])[:3])
        summary = (m.get("Overview") or "")[:200]
        lines.append(f"- {m['Name']} ({m.get('ProductionYear', '?')}, {m.get('OfficialRating', 'unrated')}, {genres}): {summary}")

    prompt = (
        "You are picking a movie for tonight from this list of films the viewer owns but hasn't watched.\n"
        f"What they're in the mood for: {mood}\n\n"
        "Only choose from the list. Suggest your top 3, best first. For each, give the title and year, "
        "then one sentence on why it fits the mood. Don't invent movies or facts that aren't in the list.\n\n"
        + "\n".join(lines)
    )
    body = json.dumps({"model": MODEL, "prompt": prompt, "stream": False}).encode()
    req = urllib.request.Request(f"{OLLAMA}/api/generate", data=body,
                                 headers={"Content-Type": "application/json"})
    print(f"Asking {MODEL} to choose from {len(items)} unwatched movies...\n")
    with urllib.request.urlopen(req, timeout=600) as r:
        print(json.load(r)["response"].strip())


if __name__ == "__main__":
    main()
```

Edit the settings at the top:

- `JELLYFIN`: your Jellyfin address. `http://localhost:8096` works if the script runs on the Jellyfin machine.
- `API_KEY`: the key from Step 1.
- `JELLYFIN_USER`: the Jellyfin user whose watched history counts.
- `OLLAMA` and `MODEL`: where Ollama runs and which model to use. If Ollama is on another machine, it must accept network connections (Step 4 of our Pi LLM tutorial, or Step 5 of the gaming PC one).

Save with `Ctrl+X`, `Y`, `Enter`.

---

## Step 3: Ask for a Movie

Run it with your mood after the script name:

```bash
python3 ~/movie-night.py "something funny under two hours"
```

Or with no mood for a general pick:

```bash
python3 ~/movie-night.py
```

After a few seconds (on a gaming PC) to a minute or two (on a Pi), you get three suggestions with a reason for each. Each run picks a different random batch of 60 unwatched movies, so ask again for new ideas.

---

## Step 4: Make It Even Easier (Optional)

Add a shortcut so you can just type `movie`:

```bash
echo 'alias movie="python3 ~/movie-night.py"' >> ~/.bashrc
source ~/.bashrc
movie "a cozy family film"
```

---

## Tips for Better Picks

- **Bigger models pick better.** A 3B model on a Pi does a decent job; an 8B or larger model on a gaming PC gives noticeably more thoughtful reasons.
- **Be specific about the mood.** "Something the kids and grandparents both enjoy" works better than "family".
- **More choice, slower answers.** Raise `HOW_MANY` for a wider selection; lower it if a Pi is slow. Movie descriptions are trimmed to keep the request short.
- **Can't agree on a show either?** Our [AI prompt library](/ai/prompts) has a "pick tonight's show" prompt you can paste into any chat app, including [Open WebUI](/tutorials/open-webui-private-chatgpt).

---

## Troubleshooting

**"No Jellyfin user called ...":** the `JELLYFIN_USER` name must match a user in **Dashboard → Users** (capital letters don't matter).

**HTTP Error 401:** the API key is wrong or was deleted; create a new one.

**"No unwatched movies found":** the user has watched everything in their libraries, or the user can't see your movie library (check their library access in **Dashboard → Users**).

**Connection refused on port 11434:** Ollama isn't running, or it's on another machine and only accepts local connections. Set `OLLAMA_HOST=0.0.0.0` on that machine.

**It suggests a movie you don't own:** small models occasionally ignore instructions. Try a larger model, or just run it again.
