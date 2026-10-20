---
title: "Move from Plex to Jellyfin (and Keep Your Watched History)"
description: "Switch your media server from Plex to the free Jellyfin without starting over: reuse the same media folders, set up users, copy watched history with JellyPlex-Watched, and retire Plex when you're ready."
publishDate: "2026-10-20"
difficulty: "intermediate"
duration: "1 hour"
tags: ["jellyfin", "plex", "media server", "self-hosted", "raspberry pi", "docker"]
---

## Before You Start

Plex's price rises have pushed a lot of self-hosters toward Jellyfin; our [Plex vs Jellyfin guide](/guides/plex-vs-jellyfin-raspberry-pi-2026) covers whether switching makes sense for you. The good news is that moving is low-risk:

- **Your media files don't move.** Jellyfin reads the same folders Plex does, and both use similar folder naming.
- **Both can run side by side** on the same machine (Plex on port 32400, Jellyfin on 8096), so nobody loses access while you switch.
- **Watched history can come with you** using a free tool, JellyPlex-Watched.

What doesn't carry over: Plex's own extras (Discover, its free ad-supported channels, Plex-to-Plex sharing with friends) and any Plex playlists, which you recreate by hand.

This tutorial assumes Plex runs on a Raspberry Pi as in our [Plex tutorial](/tutorials/raspberry-pi-plex-media-server), but the same steps work on any Linux server.

---

## Step 1: Install Jellyfin Alongside Plex

Follow Steps 2–4 of our [Jellyfin on Raspberry Pi 5 tutorial](/tutorials/jellyfin-raspberry-pi-5) on the same machine. Leave Plex running.

When the setup wizard asks for libraries, add **the same folders Plex uses**, such as `/mnt/media/Movies`. Choose the matching content type (Movies or Shows) for each.

Running both servers uses more memory; on a 4GB Pi, avoid streaming from both at once until you retire Plex.

---

## Step 2: Check the Libraries Matched

Jellyfin builds its own catalog and downloads its own artwork, so give the first scan time to finish, then spot-check:

- **Mismatched titles:** open the item → three-dot menu → **Identify**, and search for the right one.
- **Missing items:** Jellyfin expects `Movie Title (Year)` folders and `Show/Season 01/Show S01E01` episodes, close to what Plex uses. Files Plex matched by guesswork may need renaming.

Library names don't need to match Plex's, but keeping them the same ("Movies", "TV Shows") makes the next step simpler.

---

## Step 3: Create the Same Users

In Jellyfin, go to **Dashboard → Users** and add a user for each person who used Plex. Using **the same usernames as in Plex** lets the history tool match people automatically.

---

## Step 4: Copy Watched History with JellyPlex-Watched

JellyPlex-Watched is a free, open-source tool that copies watched status (and in-progress positions) between Plex and Jellyfin. It's a community project, not part of either one, so start with a dry run that changes nothing.

### Get the two access tokens

- **Plex token:** in Plex's web app, open any movie, choose **Get Info → View XML**, and copy the value after `X-Plex-Token=` in the address bar. Treat it like a password.
- **Jellyfin API key:** in Jellyfin, **Dashboard → API Keys → +**, name it "jellyplex-watched".

### Write the config

On the Pi, make a folder and a config file:

```bash
mkdir -p ~/jellyplex && cd ~/jellyplex
nano config.yaml
```

Paste this, replacing the IP addresses, token and key:

```yaml
dryrun: true          # log what would change, change nothing
run_only_once: true   # one pass, then exit

plex:
  - name: plex-main
    baseurl: http://192.168.1.50:32400
    token: "YOUR-PLEX-TOKEN"
    sync_to: [jellyfin-main]   # copy Plex -> Jellyfin

jellyfin:
  - name: jellyfin-main
    baseurl: http://192.168.1.50:8096
    token: "YOUR-JELLYFIN-API-KEY"
    sync_to: []                # nothing copied back to Plex
```

Then protect it, because it contains your tokens:

```bash
chmod 600 config.yaml
```

### Run the dry run

```bash
docker run --rm -it \
  --env PUID="$(id -u)" --env PGID="$(id -g)" \
  -v "$(pwd)/config.yaml:/app/config/config.yaml:ro" \
  luigi311/jellyplex-watched:latest
```

(No Docker yet? `curl -fsSL https://get.docker.com | sh`, then log out and back in.)

Read the output: it lists what it **would** mark as watched for each user. If users or libraries don't line up because their names differ, the project's sample config shows how to map them with `user_mappings` and `library_mappings`.

### Do it for real

When the dry run looks right, change `dryrun: true` to `dryrun: false` in `config.yaml` and run the same command again. Afterwards, check a few shows in Jellyfin: watched episodes should have a check mark.

---

## Step 5: Switch Your Devices

Install the Jellyfin app on each TV box and phone, and sign in with your Jellyfin users:

- **Google TV, Android TV, Fire TV (Fire OS):** Jellyfin for Android TV
- **Roku:** the Jellyfin channel (ignore any "subscription required" wording; none is needed)
- **Apple TV:** Swiftfin

For access away from home, Plex's relay doesn't exist in Jellyfin. Set it up with our [Jellyfin + Tailscale tutorial](/tutorials/jellyfin-remote-access-tailscale) instead of opening ports.

---

## Step 6: Retire Plex

Give it a week or two of using Jellyfin. If you change your mind in the meantime, Plex is untouched. When you're sure, stop Plex and keep it from starting at boot:

```bash
sudo systemctl disable --now plexmediaserver
```

That keeps Plex installed, with its database, in case you want it back. To remove it completely later:

```bash
sudo apt remove plexmediaserver
```

If you pay for Plex Pass, remember to cancel the subscription in your Plex account.

---

## Troubleshooting

**The dry run matches nothing:** check both `baseurl` addresses open in a browser from the Pi, and the token and key are correct. Usernames and library names must match, or be mapped.

**Only some episodes were marked watched:** items are matched by file and by online IDs; episodes Jellyfin identified differently from Plex won't match. Fix the identification in Jellyfin (Step 2) and run the tool again.

**Jellyfin shows duplicates:** two files for one title, or a show split into two entries; merge or rename the folders so each title has one folder.
