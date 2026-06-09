---
title: "Turn Your Raspberry Pi into a Plex Media Server"
description: "Install Plex Media Server on a Raspberry Pi 4 or 5, mount your external drive, and start streaming your movie and TV library to any device in your home."
publishDate: "2026-01-20"
difficulty: "intermediate"
duration: "45 min"
tags: ["raspberry pi", "plex", "media server", "linux"]
---

## What You'll Need

- Raspberry Pi 4 (4GB+ recommended) or Raspberry Pi 5
- Raspberry Pi OS installed ([see our setup guide](/tutorials/raspberry-pi-5-getting-started))
- External USB hard drive with your media files
- Ethernet connection (strongly recommended over Wi-Fi for media streaming)
- Plex account (free at plex.tv)

---

## Step 1: Prepare Your External Drive

Connect your USB hard drive to the Pi. Find the drive's device name:

```bash
lsblk
```

Look for your drive — it'll appear as something like `sda` with a partition `sda1`. Note the size to confirm it's the right drive.

Create a mount point and mount it:

```bash
sudo mkdir -p /mnt/media
sudo mount /dev/sda1 /mnt/media
```

Verify it mounted correctly:

```bash
ls /mnt/media
```

You should see your media files.

### Make the Mount Permanent

To mount automatically on every boot, get the drive's UUID:

```bash
sudo blkid /dev/sda1
```

Copy the UUID value, then edit fstab:

```bash
sudo nano /etc/fstab
```

Add this line at the bottom (replace YOUR-UUID and adjust the filesystem type if needed):

```
UUID=YOUR-UUID /mnt/media ext4 defaults,nofail 0 2
```

Save with `Ctrl+X`, then `Y`, then `Enter`.

---

## Step 2: Install Plex Media Server

Plex provides an official ARM package for Raspberry Pi. First, add the Plex repository:

```bash
# Add Plex GPG key
curl https://downloads.plex.tv/plex-keys/PlexSign.key | gpg --dearmor | sudo tee /usr/share/keyrings/plex-archive-keyring.gpg > /dev/null

# Add the repository
echo deb [signed-by=/usr/share/keyrings/plex-archive-keyring.gpg] https://downloads.plex.tv/repo/deb public main | sudo tee /etc/apt/sources.list.d/plexmediaserver.list
```

Install Plex:

```bash
sudo apt update
sudo apt install -y plexmediaserver
```

Start and enable the service:

```bash
sudo systemctl enable plexmediaserver
sudo systemctl start plexmediaserver
```

Verify it's running:

```bash
sudo systemctl status plexmediaserver
```

---

## Step 3: Set Permissions for Your Media

Plex runs as the `plex` user and needs read access to your media folder:

```bash
sudo chown -R plex:plex /mnt/media
sudo chmod -R 755 /mnt/media
```

---

## Step 4: Initial Setup in the Browser

Find your Pi's IP address:

```bash
hostname -I
```

On a computer **on the same network**, open a browser and go to:

```
http://YOUR-PI-IP:32400/web
```

Sign in with your Plex account and follow the setup wizard:

1. Name your server (e.g. "Home Pi")
2. Click **Add Library**
3. Choose the type (Movies, TV Shows, Music)
4. Click **Browse for media folder** and navigate to `/mnt/media/Movies` (or wherever your files are)
5. Click **Add Library** and let Plex scan your files

Plex will scan your library, download artwork, and metadata. This may take a while for large libraries.

---

## Step 5: Access Plex Anywhere

Install the Plex app on your TV box, phone, or tablet. Sign in with your Plex account — your Pi server will appear automatically when you're on the same network.

For **remote access** (streaming outside your home), Plex handles it automatically via Plex Relay. For better performance, enable **port forwarding** on port 32400 in your router settings.

---

## Performance Tips

**Use Ethernet:** Wi-Fi introduces latency and packet loss that causes buffering. Plug your Pi directly into your router.

**Enable hardware transcoding (Plex Pass):** The Pi 5's H.265 hardware decoder helps with transcoding. Requires a Plex Pass subscription.

**Choose compatible formats:** Files in H.264 MP4 containers direct-play on almost every device without transcoding. H.265/HEVC requires more powerful clients.

**Keep the Pi cool:** Plex under load generates heat. Use a case with a heatsink or fan — the official Pi 5 active cooler is worth it.

---

## Troubleshooting

**Can't access the web UI:** Check that Plex is running (`sudo systemctl status plexmediaserver`). Check your firewall (`sudo ufw status`).

**Media not showing up:** Check folder permissions. Make sure the path you added in Plex matches where your files actually are.

**Buffering on playback:** Switch to Ethernet. Reduce streaming quality. Check if the file is being transcoded vs. direct playing (Plex dashboard → Now Playing).
