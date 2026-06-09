---
title: "Install Kodi on Raspberry Pi: Build a Full Media Center"
description: "Turn your Raspberry Pi into a powerful media center with Kodi — play local videos, music, photos, and stream from dozens of add-ons, all from your TV."
publishDate: "2026-03-10"
difficulty: "beginner"
duration: "25 min"
tags: ["raspberry pi", "kodi", "media center", "streaming"]
---

## What Is Kodi?

Kodi is a free, open-source media center application that organizes and plays your local media library — movies, TV shows, music, photos — and extends via add-ons to stream from online sources. It runs on nearly everything, but Raspberry Pi is one of the most popular platforms for it.

## Two Ways to Run Kodi on Pi

**Option A: LibreELEC** (recommended for dedicated media centers)
LibreELEC is a minimal Linux OS built specifically for Kodi. It boots directly into Kodi in seconds and uses minimal resources. Best if the Pi will only be used as a media center.

**Option B: Kodi on Raspberry Pi OS**
Install Kodi as an app on top of Raspberry Pi OS. Best if you want to use the Pi for other things too.

This guide covers both.

---

## Option A: LibreELEC (Recommended)

### Step 1: Flash LibreELEC

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Click **Choose OS → Media player OS → LibreELEC**
3. Select your Pi model
4. Select your SD card
5. Write the image

### Step 2: First Boot

Insert the SD card, connect HDMI and power. LibreELEC boots directly into the Kodi setup wizard in about 20 seconds.

Follow the wizard:
- Set hostname (e.g. `kodi-pi`)
- Connect to Wi-Fi
- Enable SSH if you want remote access

That's it. You're in Kodi.

---

## Option B: Kodi on Raspberry Pi OS

### Step 1: Install Kodi

On a running Raspberry Pi OS:

```bash
sudo apt update
sudo apt install -y kodi
```

### Step 2: Run Kodi

Launch from the desktop menu, or from terminal:

```bash
kodi
```

### Step 3: Auto-start Kodi on Boot (Optional)

To launch Kodi automatically when the Pi boots:

```bash
sudo nano /etc/rc.local
```

Add before `exit 0`:

```bash
su pi -c 'kodi --standalone' &
```

---

## Setting Up Your Media Library

### Add a Local Source

1. In Kodi, go to **Movies** (or TV Shows / Music)
2. Click **Enter files section → Add videos**
3. Browse to your media folder (USB drive, NAS, or local path)
4. Let Kodi scan and download metadata automatically

### Add a Network Share (NAS / Samba)

1. **Add videos → Browse → Add network location**
2. Protocol: **SMB (Windows network)**
3. Enter your NAS IP, share name, username, and password
4. Kodi mounts it and scans your library

---

## Essential Settings

**Resolution:** Settings → System → Display → Resolution → 1920×1080 or 3840×2160

**HDR:** Settings → System → Display → Enable HDR (Pi 4/5 only)

**Audio passthrough:** Settings → System → Audio → Enable passthrough → choose your audio device

**Hardware acceleration:** Settings → Player → Videos → Allow hardware acceleration (reduces CPU load for H.265)

---

## Useful Add-ons

Install from **Add-ons → Download → Video add-ons**:

| Add-on | What it does |
|---|---|
| **YouTube** | Stream YouTube directly in Kodi |
| **Plex for Kodi** | Access your Plex library |
| **Twitch** | Watch live streams |
| **SoundCloud** | Music streaming |
| **Weather** | Display weather on the home screen |

---

## Remote Control Options

- **Kodi Remote** (iOS/Android) — official app, works over Wi-Fi
- **CEC** — if your TV supports HDMI-CEC, your TV remote controls Kodi automatically
- **Keyboard shortcuts** — space to play/pause, F to fullscreen, Backspace to go back

---

## Troubleshooting

**Video stuttering:** Enable hardware acceleration. Check resolution matches your TV.

**No sound:** Check audio settings → select the correct output device (HDMI or analog).

**Library not updating:** Go to **Videos → Library → Update Library**.

**Add-on not working:** Many third-party add-ons break when they rely on external services. Stick to official add-ons from the Kodi repository.
