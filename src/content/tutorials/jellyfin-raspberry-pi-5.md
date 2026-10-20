---
title: "Set Up Jellyfin on a Raspberry Pi 5: A Free Media Server"
description: "Install Jellyfin on a Raspberry Pi 5 with the official script, add your movie and TV libraries, and stream to any TV box for free. Plus the honest limit: the Pi 5 can't hardware-transcode."
publishDate: "2026-10-20"
difficulty: "intermediate"
duration: "40 min"
tags: ["raspberry pi", "jellyfin", "media server", "self-hosted", "linux"]
---

## Why Jellyfin?

Jellyfin is a free, open-source media server: it organizes your movie, TV and music files, fetches artwork and descriptions, and streams them to your TV, phone or browser. Unlike Plex there's no account, no subscription and no premium tier; every feature is free. Our [Plex vs Jellyfin comparison](/guides/plex-vs-jellyfin-raspberry-pi-2026) covers the trade-offs; this tutorial gets Jellyfin running.

**One limit to know before you start:** the Raspberry Pi 5 has no hardware video encoder, and Jellyfin has deprecated its Raspberry Pi hardware acceleration. The Pi can't convert video on the fly for a device that can't play the original file, except slowly in software. A Pi 5 Jellyfin server works best when your TV box plays your files as they are ("direct play"). More on that below.

## What You'll Need

- Raspberry Pi 5 (4GB or 8GB) with Raspberry Pi OS (64-bit) installed. See our [Pi 5 getting-started tutorial](/tutorials/raspberry-pi-5-getting-started)
- A USB 3 hard drive or SSD with your media
- Ethernet connection (Wi-Fi works, but wired avoids buffering)
- Active cooling, such as the official Active Cooler

---

## Step 1: Mount Your Media Drive

Plug the drive into one of the Pi's blue USB 3 ports and find it:

```bash
lsblk
```

Your drive shows up as something like `sda` with a partition `sda1`. Create a mount point and mount it:

```bash
sudo mkdir -p /mnt/media
sudo mount /dev/sda1 /mnt/media
ls /mnt/media
```

To mount it automatically at boot, get its UUID and add it to `/etc/fstab`:

```bash
sudo blkid /dev/sda1
sudo nano /etc/fstab
```

Add a line like this (use your UUID, and your filesystem type if it isn't ext4):

```
UUID=YOUR-UUID /mnt/media ext4 defaults,nofail 0 2
```

The `nofail` option lets the Pi still boot if the drive is unplugged.

Jellyfin works best with one folder per library type and one folder per movie or show:

```
/mnt/media/Movies/Arrival (2016)/Arrival (2016).mkv
/mnt/media/Shows/Severance/Season 01/Severance S01E01.mkv
```

---

## Step 2: Install Jellyfin

Jellyfin's official installer script supports Raspberry Pi OS. Download it with its checksum, verify it, then run it:

```bash
cd ~
curl -s https://repo.jellyfin.org/install-debuntu.sh -O
curl -s https://repo.jellyfin.org/install-debuntu.sh.sha256sum -O
sha256sum -c install-debuntu.sh.sha256sum
```

You should see `install-debuntu.sh: OK`. If you do, run it:

```bash
sudo bash install-debuntu.sh
```

The script adds Jellyfin's repository, installs the server and starts it. Check it's running:

```bash
sudo systemctl status jellyfin
```

Because it's installed from Jellyfin's repository, future updates arrive with the usual `sudo apt update && sudo apt upgrade`.

---

## Step 3: Give Jellyfin Access to Your Media

Jellyfin runs as the `jellyfin` user, which needs to be able to read your files:

```bash
sudo chmod -R o+rX /mnt/media
```

That adds read access for everyone without changing who owns the files. If your drive is formatted exFAT or NTFS, permissions come from the mount options instead. Add `uid=jellyfin,gid=jellyfin` to the options in your fstab line.

---

## Step 4: Run the Setup Wizard

Find the Pi's address:

```bash
hostname -I
```

On a computer on the same network, open `http://YOUR-PI-IP:8096` and follow the wizard:

1. Pick your display language and create an admin username and password.
2. Click **Add Media Library**, choose a content type (Movies, Shows or Music), and add the matching folder, such as `/mnt/media/Movies`.
3. Set your metadata language and country, so titles and artwork are matched correctly.
4. Leave **Allow remote connections** on if you'll ever stream from outside your home network.
5. Finish, sign in, and let the first library scan run. Large libraries take a while.

---

## Step 5: Watch on Your TV

Install a Jellyfin app on your TV device, then sign in with the address `http://YOUR-PI-IP:8096` and your Jellyfin user:

- **Google TV, Android TV and Fire TV (Fire OS):** the official Jellyfin for Android TV app, from Google Play or the Amazon Appstore.
- **Roku:** the official Jellyfin channel. Jellyfin notes the Roku listing may say a cable or satellite subscription is required; none is needed.
- **Apple TV:** Swiftfin, Jellyfin's free app for Apple devices.
- **Phones and computers:** the Jellyfin mobile apps, or just the browser.

Create a separate Jellyfin user for each person in **Dashboard → Users**, so everyone gets their own watch history and "Continue Watching" row.

---

## Getting Smooth Playback on a Pi

Because the Pi 5 can't hardware-transcode, aim for files your TV box can play directly:

- **H.264 or H.265 (HEVC) video in an MKV or MP4 container** plays directly on nearly every modern TV box.
- **Leave client quality on Auto or Maximum.** Picking a lower quality in the app forces a transcode, which the Pi does in software and can only manage for about one 1080p stream.
- **Check what's happening:** during playback, **Dashboard → Activity** shows whether a stream is direct playing or transcoding, and why.
- **Subtitles:** image-based subtitles (PGS, from Blu-ray rips) have to be "burned in" by transcoding on most devices. Text subtitles (SRT) don't.

If your household regularly needs transcoding (several remote viewers, older devices), a Pi is the wrong box for it. An Intel mini PC with Quick Sync handles many streams at once.

---

## Troubleshooting

**The web page won't load:** check the service with `sudo systemctl status jellyfin` and make sure you're using port 8096 and the right IP address.

**A library is empty:** the `jellyfin` user probably can't read the folder. Re-run Step 3, then **Dashboard → Libraries → Scan All Libraries**.

**Wrong titles or posters:** name folders as `Title (Year)`; for a mismatch, open the item, click the three-dot menu and choose **Identify**.

**Playback stutters:** look at **Dashboard → Activity**. If it says "Transcoding", the Pi's CPU is the bottleneck; change the client's quality setting, or the file, so it can direct play. If it's direct playing and still stutters, switch the Pi (and ideally the TV box) to Ethernet.

**Want to record live TV too?** Add an antenna tuner. See our [over-the-air DVR tutorial](/tutorials/ota-tv-dvr-hdhomerun-jellyfin).
