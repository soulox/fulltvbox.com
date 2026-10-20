---
title: "Generate Missing Subtitles with AI (Whisper + Jellyfin)"
description: "Use Subgen and OpenAI's open-source Whisper speech model to create subtitles for movies and shows that don't have any, locally on your media server, and have Jellyfin pick them up automatically."
publishDate: "2026-10-20"
difficulty: "intermediate"
duration: "30 min (plus processing time)"
tags: ["ai", "jellyfin", "subtitles", "whisper", "media server", "docker"]
---

## What This Does

Some files in every library have no subtitles: home videos, older rips, obscure releases. **Whisper** is OpenAI's free, open-source speech recognition model, and it's good enough to write usable subtitles from the audio. **Subgen** is a free tool that runs Whisper over your media folders and saves an `.srt` subtitle file next to each video, which Jellyfin (or Plex) then offers like any other subtitle track.

Everything runs on your own hardware; no audio is uploaded anywhere.

**Set expectations:** AI subtitles are very good for clear dialogue and weaker with music, crosstalk and names. They're timed from the audio, not hand-made, so treat them as "much better than nothing", not a replacement for official subtitles.

## What You'll Need

- A Jellyfin server with your media, such as our [Jellyfin on Raspberry Pi 5](/tutorials/jellyfin-raspberry-pi-5) setup
- Docker on the same machine (on Raspberry Pi OS: `curl -fsSL https://get.docker.com | sh`)
- Patience on a Pi, or a PC with an NVIDIA graphics card for speed (see "Speed" below)

---

## Step 1: Choose a Model for Your Hardware

Whisper comes in sizes from `tiny` to `large-v3`. Bigger is more accurate and much slower:

- **Raspberry Pi 5 or other low-power box:** `small`, or `base` if `small` is too slow. Run it overnight; a feature film can take hours.
- **PC with an NVIDIA graphics card (8GB+ VRAM):** `large-v3-turbo`, which is accurate and fast on a GPU.
- **Modern PC without a suitable GPU:** `small` or `medium`.

You can change the model later, so start small.

---

## Step 2: Start Subgen

On the Pi (or any Linux machine running Jellyfin), run the following. It assumes your media lives in `/mnt/media/Movies` and `/mnt/media/Shows`, as in our Jellyfin tutorial; adjust the paths to yours.

```bash
docker run -d --name subgen --restart unless-stopped \
  -p 9000:9000 \
  -v /mnt/media:/mnt/media \
  -v subgen-models:/models \
  -e MODEL_PATH=/models \
  -e WHISPER_MODEL=small \
  -e TRANSCRIBE_DEVICE=cpu \
  -e TRANSCRIBE_FOLDERS="/mnt/media/Movies|/mnt/media/Shows" \
  -e MONITOR=True \
  -e SUBTITLE_LANGUAGE_NAME=en \
  -e SHOW_IN_SUBNAME_SUBGEN=True \
  -e SKIP_IF_EXTERNAL_SUBTITLES_EXIST=True \
  -e SKIP_IF_INTERNAL_SUBTITLES_LANGUAGE=eng \
  mccloud/subgen:cpu
```

What the settings do:

- `-v /mnt/media:/mnt/media` gives Subgen your media **at the same path Jellyfin uses**, which keeps everything simple.
- `TRANSCRIBE_FOLDERS` and `MONITOR=True` process everything already in those folders, then watch for new files.
- `SUBTITLE_LANGUAGE_NAME=en` labels the files as English. (Subgen's default label is `aa`, which Jellyfin would show as a different language.)
- `SHOW_IN_SUBNAME_SUBGEN=True` adds `.subgen` to the filename, so you can tell AI subtitles from real ones.
- The two `SKIP_` settings skip videos that already have English subtitles, as a separate file or built in, so Subgen only works on what's missing.
- `mccloud/subgen:cpu` is the smaller CPU-only image, and it's the one that runs on a Raspberry Pi.

This setup is for English-language media. Subgen writes subtitles in the language being spoken; for a library in another language, change `SUBTITLE_LANGUAGE_NAME` and `SKIP_IF_INTERNAL_SUBTITLES_LANGUAGE` to match (for example `es` and `spa`).

---

## Step 3: Watch It Work

Follow Subgen's progress:

```bash
docker logs -f subgen
```

The first run downloads the Whisper model, then it works through your files one at a time. As each finishes, an `.srt` file appears next to the video, named with `en` and `subgen` in it. Press `Ctrl+C` to stop watching the log; Subgen keeps running.

---

## Step 4: See the Subtitles in Jellyfin

Jellyfin notices new subtitle files on its next library scan. To see them straight away, go to **Dashboard → Libraries → Scan All Libraries**. Then play a video, open the subtitle menu, and pick the English track marked "subgen".

---

## Speed: Using a PC with an NVIDIA Graphics Card

On a Pi, Subgen is a slow overnight job. A PC with an NVIDIA card is many times faster. Run Subgen there instead with the full image (`mccloud/subgen:latest`), `TRANSCRIBE_DEVICE=cuda`, `WHISPER_MODEL=large-v3-turbo`, and Docker's GPU support enabled, and give it access to the same media through a network share. When Subgen and Jellyfin see the files at different paths, Subgen's `USE_PATH_MAPPING`, `PATH_MAPPING_FROM` and `PATH_MAPPING_TO` settings translate between them; the Subgen README covers this.

---

## Troubleshooting

**Nothing is happening:** check `docker logs subgen`. If it says files were skipped, they already have English subtitles; that's working as intended.

**Subtitles are in the wrong place or missing:** make sure the paths inside the container match where the files really are (`-v /mnt/media:/mnt/media`), and that the media folder is writable; Subgen saves the `.srt` next to the video.

**Subtitles are out of sync or full of nonsense in quiet scenes:** try a larger model, such as `medium` instead of `small`, and delete the old `.srt` so Subgen redoes it.

**The Pi is too slow or gets hot:** use `base`, make sure it has active cooling, or move Subgen to a faster machine.
