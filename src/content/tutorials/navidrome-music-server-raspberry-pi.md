---
title: "Your Own Spotify for Your Own Music: Navidrome on a Raspberry Pi"
description: "Stream your music collection to your phone, computer and speakers with Navidrome, a free and lightweight music server. Install it on a Raspberry Pi with Docker, then pick a great app for Android or iPhone."
publishDate: "2026-10-20"
difficulty: "beginner"
duration: "30 min"
tags: ["raspberry pi", "music", "navidrome", "self-hosted", "docker", "media server"]
---

## Why Navidrome?

If you have a music collection (ripped CDs, Bandcamp purchases, years of downloads), **Navidrome** gives it a modern, Spotify-like home: search, albums with artwork, playlists, favorites, and streaming to your phone anywhere. It's free, open source, and light enough to run happily on a Raspberry Pi alongside other things.

Navidrome speaks the **Subsonic** standard, so instead of one official app you can choose from many good ones, for Android, iPhone and desktop.

## What You'll Need

- A Raspberry Pi 4 or 5 with Raspberry Pi OS (a Pi 3 works too for smaller libraries)
- Your music on a USB drive or the Pi's storage, in folders such as `Artist/Album/01 Track.flac`
- Docker (on Raspberry Pi OS: `curl -fsSL https://get.docker.com | sh`, then log out and back in)

Navidrome reads your music files' **tags** (artist, album, track number, artwork), not the folder names, so well-tagged files give the best results. MP3, FLAC, AAC, Ogg, Opus and other common formats are supported.

---

## Step 1: Prepare the Folders

This example assumes your music is in `/mnt/media/Music` (see our [Plex tutorial](/tutorials/raspberry-pi-plex-media-server) for mounting a USB drive). Create a folder for Navidrome's own data:

```bash
mkdir -p ~/navidrome
```

---

## Step 2: Start Navidrome

```bash
docker run -d --name navidrome --restart unless-stopped \
  --user $(id -u):$(id -g) \
  -p 4533:4533 \
  -v ~/navidrome:/data \
  -v /mnt/media/Music:/music:ro \
  navidrome/navidrome:latest
```

What the options do:

- `--user` runs Navidrome as your user, which owns the `~/navidrome` data folder.
- `-v /mnt/media/Music:/music:ro` gives it your music **read-only**, so it can never change your files.
- `-p 4533:4533` serves it on port 4533.

The image runs on the Raspberry Pi as well as PCs.

---

## Step 3: Create Your Admin Account

Open `http://YOUR-PI-IP:4533` in a browser. The first screen asks you to create the **admin** user: choose a username and password, and click **Create Admin**.

Navidrome scans your music in the background. Albums appear as it goes: a library of a few thousand songs takes minutes; a very large one longer. You can play music straight away in the web player.

Add a separate user for each person in the house in Navidrome's **Users** settings (available to the admin), so everyone gets their own favorites and playlists.

---

## Step 4: Get an App

Any Subsonic-compatible app works with Navidrome. Popular choices:

- **Android:** Symfonium (polished, paid after a free trial, also casts to Chromecast and other speakers), Substreamer, or Tempo
- **iPhone and iPad:** Amperfy (free), play:Sub (paid) or Substreamer
- **Windows, Mac and Linux:** Feishin or Supersonic

In the app, add a server with the address `http://YOUR-PI-IP:4533` and your Navidrome username and password. Most apps can also download music to your phone for offline listening.

---

## Step 5: Listen Away from Home

To stream outside your home Wi-Fi without opening ports on your router, use Tailscale, exactly as in our [Jellyfin remote access tutorial](/tutorials/jellyfin-remote-access-tailscale): install it on the Pi and your phone, and use the Pi's `100.x.x.x` Tailscale address in the music app.

---

## Tips

- **Tidy tags first.** A free tag editor such as MusicBrainz Picard can fix artists, album names and artwork across a whole collection, and makes Navidrome much nicer to browse.
- **Playlists:** `.m3u` playlist files in your music folder are imported automatically, after the admin user exists.
- **Play on your speakers:** combine it with our [wireless speakers tutorial](/tutorials/wireless-speakers-airplay-spotify-raspberry-pi): stream from an iPhone app to the Pi over AirPlay, or cast from Symfonium.

---

## Troubleshooting

**No music appears:** check the folder in `-v ... :/music` is where your music really is, and wait for the first scan. `docker logs navidrome` shows scan progress and errors.

**"Unable to open database file":** the data folder isn't owned by the user Navidrome runs as. Fix it with `sudo chown -R $(id -u):$(id -g) ~/navidrome`, then `docker restart navidrome`.

**Albums are split or mislabeled:** that's the tags. Make sure all tracks on an album share the same album and album artist tags.

**The app can't connect:** check the address includes `http://` and port `4533`, and that your phone is on the same network (or on Tailscale away from home).
