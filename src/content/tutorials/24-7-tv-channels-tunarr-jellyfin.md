---
title: "Make Your Own 24/7 TV Channels from Your Jellyfin Library"
description: "Turn your movies and shows into always-on TV channels, like a Saturday-morning cartoons channel or a 90s sitcom marathon, with a channel guide, using the free Tunarr and Jellyfin's Live TV."
publishDate: "2026-10-20"
difficulty: "intermediate"
duration: "1 hour"
tags: ["jellyfin", "tunarr", "live tv", "media server", "docker", "self-hosted"]
---

## Why Bother?

Sometimes the best thing about old-fashioned TV was not choosing. You flicked it on and something was already playing. **Tunarr**, a free, open-source project, brings that back: it builds channels from your own library ("Cartoons", "Sitcoms", "Christmas Movies"), plays them on a schedule around the clock, and publishes a channel guide. Jellyfin then shows them in its **Live TV** section next to your movies, on every TV box with the Jellyfin app.

## What You'll Need

- A Jellyfin server with your shows and movies, such as our [Jellyfin on Raspberry Pi 5](/tutorials/jellyfin-raspberry-pi-5) setup
- Docker on the same machine (on Raspberry Pi OS: `curl -fsSL https://get.docker.com | sh`, then log out and back in)

**A note on performance:** to make one continuous channel out of many separate files, Tunarr converts the video as it plays. A Raspberry Pi has no hardware video encoder for this, so it manages one viewer at a time, best at 720p. A PC or mini PC with an Intel processor (Quick Sync) handles several channels at once.

---

## Step 1: Start Tunarr

On the Jellyfin machine, create a folder for Tunarr's settings and start it. Set `TZ` to your time zone (such as `Europe/London`), so the guide shows the right times:

```bash
mkdir -p ~/tunarr
docker run -d --name tunarr --restart unless-stopped \
  -p 8000:8000 \
  -e TZ=America/New_York \
  -v ~/tunarr:/config/tunarr \
  chrisbenincasa/tunarr:latest-arm64
```

On a PC (Intel or AMD processor), use the image `chrisbenincasa/tunarr:latest` instead; the `-arm64` tag is for the Raspberry Pi. For hardware encoding on Intel graphics, use `chrisbenincasa/tunarr:latest-vaapi` and add `--device /dev/dri:/dev/dri` to the command, then pick VA-API in Tunarr's transcoding settings.

Open `http://YOUR-SERVER-IP:8000` in a browser for Tunarr's web interface.

---

## Step 2: Connect Tunarr to Jellyfin

1. In Jellyfin, go to **Dashboard → API Keys**, click **+**, and name it "Tunarr". Copy the key.
2. In Tunarr, go to **Settings → Sources**, add a **Jellyfin** source, enter your Jellyfin address (such as `http://192.168.1.50:8096`) and paste the key.

Tunarr can now see your Jellyfin libraries. It only reads from Jellyfin; it never changes anything there.

---

## Step 3: Create Your First Channel

1. Go to **Channels** and create a new channel. Give it a number and a name, such as "1 – Cartoons", and optionally an icon.
2. On the channel's programming page, choose **Add Media**, pick a library, and add shows: **Add Series** for whole shows, or expand a show to add only some seasons or episodes. Movies work the same way.
3. Save.

By default, Tunarr plays shows one after another, in episode order. To make it feel like real TV, use Tunarr's **scheduling tools** to shuffle, interleave shows, or put things in time slots ("cartoons until noon, then movies"). Tunarr's documentation covers each option.

Make a few channels; that's where the fun is. A channel of short episodes is a good first test.

---

## Step 4: Add the Channels to Jellyfin

Jellyfin sees Tunarr as if it were a TV tuner. In Jellyfin, go to **Dashboard → Live TV**:

1. Under **Tuner Devices**, click **+** and choose **HD Homerun** as the tuner type (Tunarr's documentation recommends this over M3U). Use **Detect My Devices**, or enter `http://YOUR-SERVER-IP:8000` yourself. Save.
2. Under **TV Guide Data Providers**, click **+**, choose **XMLTV**, and enter `http://YOUR-SERVER-IP:8000/api/xmltv.xml` as the file or URL. Save.

Jellyfin refreshes the guide. Go back to Jellyfin's home screen: a **Live TV** section now shows what's on, the channel list and the guide.

If you already use [Jellyfin Live TV for antenna TV](/tutorials/ota-tv-dvr-hdhomerun-jellyfin), Tunarr's channels appear alongside your broadcast channels. Untick **Enable for all tuner devices** when adding the guide, so each tuner keeps its own guide.

---

## Step 5: Channel Surf on the TV

Open Jellyfin on your TV box, pick **Live TV**, and choose a channel. Whatever's "on" starts playing, mid-episode, just like broadcast TV. Leave it on as background TV, or check the guide for what's next.

---

## Tips

- **Lower the resolution on a Pi.** In Tunarr's **Settings → FFmpeg**, a 720p target keeps a Raspberry Pi from falling behind.
- **Theme the channels.** Holiday specials in December, a "Movie Night" channel that only plays films after 8pm, a kids' channel that only runs during the day: time-slot scheduling makes these easy.
- **Back up your channels.** Everything lives in the `~/tunarr` folder; copy it somewhere safe once you've built channels you like.

---

## Troubleshooting

**Jellyfin finds no channels:** check `http://YOUR-SERVER-IP:8000` opens from another device, then re-add the tuner with that address.

**The guide is empty:** open `http://YOUR-SERVER-IP:8000/api/xmltv.xml` in a browser; it should list programs. Then **Refresh Guide Data** in Jellyfin's Live TV settings.

**The picture stutters or buffers:** the server can't convert the video fast enough. Lower the resolution in Tunarr's FFmpeg settings, or run Tunarr on a machine with hardware video encoding.

**Playback stops at the end of each episode:** some users see this when Tunarr is added as an M3U tuner; re-add it as **HD Homerun**, as in Step 4.
