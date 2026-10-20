---
title: "Host a Movie Night with Faraway Friends Using Jellyfin SyncPlay"
description: "Watch the same movie at the same moment with friends in other homes: Jellyfin's built-in SyncPlay keeps everyone's play, pause and seek in sync. Here's how to set it up, which apps support it, and how to get it onto a TV."
publishDate: "2026-10-20"
difficulty: "intermediate"
duration: "30 min"
tags: ["jellyfin", "syncplay", "watch party", "media server", "tailscale"]
---

## How SyncPlay Works

**SyncPlay** is built into Jellyfin. Everyone joins a **group**, and when anyone presses play, pause or skips ahead, everybody's video does the same, kept within a fraction of a second. Each person streams the movie from your Jellyfin server to their own screen, so it works across town or across the world. Add a video or voice call alongside it and it's movie night.

## Which Apps Support It

This is the part to know before you invite people. SyncPlay works in:

- **Jellyfin in a web browser** (on any computer)
- **The Jellyfin app for Android phones and tablets**
- **Jellyfin Desktop**, the app for Windows, macOS and Linux

It's **not** available in the Jellyfin apps for Android TV and Fire TV, Roku, or Swiftfin on Apple TV. So for the big screen, use one of these:

- **Plug a laptop into the TV** with HDMI and run Jellyfin Desktop or a browser in full screen. This is the most reliable option.
- **An Android tablet or phone with screen mirroring or a USB-C to HDMI adapter**, if your device supports video out.

---

## What You'll Need

- A Jellyfin server, such as our [Jellyfin on Raspberry Pi 5](/tutorials/jellyfin-raspberry-pi-5) setup
- **A way for friends to reach it.** Our [Jellyfin + Tailscale tutorial](/tutorials/jellyfin-remote-access-tailscale) shows how to share your server privately, without opening ports on your router.
- **Enough upload speed.** Every remote viewer streams separately from your home connection, so three friends watching a 10 Mbps movie need about 30 Mbps of upload.

---

## Step 1: Give Each Friend a Jellyfin User

In Jellyfin, go to **Dashboard → Users** and add a user for each friend. On the **Access** tab, give them only the libraries you want to share, such as Movies.

SyncPlay is controlled per user. In each user's settings, check the **SyncPlay** option allows them to create or join groups. It's usually allowed by default.

---

## Step 2: Let Friends Reach the Server

With Tailscale, share the Jellyfin server with each friend (Tailscale's device sharing lets them reach only that one device). They install Tailscale, accept the share, and open Jellyfin at your server's Tailscale address, such as `http://100.101.102.103:8096`.

Ask everyone to sign in once before movie night, so you're not troubleshooting passwords while the popcorn gets cold.

---

## Step 3: Start a Group

1. In Jellyfin (browser, Android app or Jellyfin Desktop), click the **SyncPlay** button in the top bar.
2. Choose **New group**.
3. Pick the movie and press play. Playback waits until everyone is ready.

---

## Step 4: Friends Join

Each friend clicks the **SyncPlay** button and selects your group from the list. Their player opens the same movie at the same point. From now on, whoever pauses or seeks controls it for everyone; agree who holds the remote.

To leave, click the SyncPlay button again and choose **Leave group**.

---

## Making It Smooth

- **Pick files everyone can play directly.** If a friend's device can't play your file as it is, the server converts it for them, and on a Raspberry Pi that's slow, which makes the whole group wait. Common H.264 MP4 or MKV files are the safest choice.
- **Set a sensible quality.** Remote viewers on slow connections can lower the quality in the player's settings, but that also means converting; a better fix is choosing a smaller version of the file.
- **Run the call separately.** Use your usual video-call app for chatting; SyncPlay only syncs the movie.
- **Do a two-minute test** with one friend before a big group night.

---

## Troubleshooting

**No SyncPlay button:** the app doesn't support it (see the list above), or the user isn't allowed to use SyncPlay. Try a web browser, and check the user's settings.

**Someone keeps falling behind:** their connection or the server can't keep up. Ask them to switch to a wired connection, or check **Dashboard → Activity** on the server to see whether their stream is being converted.

**Friends can't see the group:** they must be signed in to the same Jellyfin server, with SyncPlay allowed for their user.

**Playback stalls for everyone:** your home upload speed is the limit. Fewer remote viewers or a smaller file will help.
