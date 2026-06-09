---
title: "Build a NAS with Raspberry Pi and OpenMediaVault"
description: "Turn a Raspberry Pi and a hard drive into a full network-attached storage server using OpenMediaVault — access your files from any device on your network."
publishDate: "2026-04-01"
difficulty: "intermediate"
duration: "1 hour"
tags: ["raspberry pi", "nas", "networking", "storage", "openmediavault"]
---

## What You'll Need

- Raspberry Pi 4 (4GB+ recommended) or Pi 5
- microSD card (16GB minimum — just for the OS)
- One or more USB hard drives (for storage)
- Powered USB hub (recommended if using multiple drives — Pi USB ports have limited power)
- Ethernet cable (strongly recommended)
- A computer on the same network

---

## Step 1: Install Raspberry Pi OS Lite

Flash **Raspberry Pi OS Lite (64-bit)** — the headless, no-desktop version. Use Raspberry Pi Imager and pre-configure:

- Enable SSH
- Set username and password
- Set hostname (e.g. `nas`)
- Configure Wi-Fi (though Ethernet is strongly preferred for a NAS)

Boot the Pi and SSH in:

```bash
ssh pi@nas.local
```

---

## Step 2: Update the System

```bash
sudo apt update && sudo apt upgrade -y
```

Reboot after upgrading:

```bash
sudo reboot
```

---

## Step 3: Install OpenMediaVault

OMV provides a one-line installer script:

```bash
wget -O - https://raw.githubusercontent.com/OpenMediaVault-Plugin-Developers/installScript/master/install | sudo bash
```

This takes 10–15 minutes. The Pi will reboot automatically when done.

---

## Step 4: Access the OMV Dashboard

From your computer's browser, navigate to:

```
http://nas.local
```

Or use the Pi's IP address. Default login:
- **Username:** `admin`
- **Password:** `openmediavault`

**Change the password immediately:** System → General Settings → Web Administrator Password

---

## Step 5: Set Up Your Storage Drive

Plug your USB hard drive into the Pi.

### Wipe and Format the Drive

**⚠️ This erases all data on the drive.**

1. Go to **Storage → Disks** — your drive should appear
2. Go to **Storage → File Systems → Create**
3. Select your drive and choose **ext4** as the filesystem
4. Click **Save** then apply pending changes (yellow banner)
5. Mount the filesystem: **Storage → File Systems → Mount**

---

## Step 6: Create a Shared Folder

1. Go to **Storage → Shared Folders → Add**
2. Name it (e.g. `Media`, `Backups`, `Photos`)
3. Select the filesystem you just mounted
4. Set the relative path (e.g. `media/` )
5. Set permissions to your preference
6. Save and apply

---

## Step 7: Enable SMB/CIFS Sharing (Windows / Mac / Linux)

SMB lets any device on your network access the NAS like a normal network drive.

1. Go to **Services → SMB/CIFS → Settings** → Enable
2. Go to **Services → SMB/CIFS → Shares → Add**
3. Select your shared folder
4. Enable the share and save

### Create a User Account

1. Go to **Users → Users → Add**
2. Create a username and password
3. The user needs access to your shared folder: **Storage → Shared Folders → Privileges**

### Connect from Windows

Open File Explorer → address bar → type:

```
\\nas.local\Media
```

Enter your OMV username and password when prompted. Optionally map it as a network drive.

### Connect from Mac

Finder → **Go → Connect to Server** → `smb://nas.local/Media`

---

## Step 8: Enable SSH Access to OMV (Optional)

By default OMV manages its own SSH config. Enable it via:

**Services → SSH → Enable → Save**

---

## Useful Plugins

Install the OMV Extras plugin for additional functionality:

```bash
wget -O - https://raw.githubusercontent.com/OpenMediaVault-Plugin-Developers/packages/master/install | sudo bash
```

Then in the OMV dashboard under **System → Plugins**, install:

| Plugin | Purpose |
|---|---|
| **openmediavault-sharerootfs** | Use the SD card partition as a share |
| **openmediavault-downloader** | Schedule downloads to the NAS |
| **openmediavault-docker-gui** | Run Docker containers via OMV |

---

## Drive Health Monitoring

Go to **Storage → S.M.A.R.T.** → Enable → configure scheduled tests. OMV will alert you if a drive shows signs of failure.

---

## Troubleshooting

**Drive not appearing:** Check USB connection. Powered hub may be needed for large drives drawing more than 900mA.

**Can't connect via SMB:** Check that the SMB service is enabled and running. Check Windows firewall if connecting from Windows.

**Slow transfer speeds:** Ethernet is essential. Over Wi-Fi, Pi NAS speeds top out at 20–30 MB/s. Wired gigabit gets 50–80 MB/s (USB 3.0 drive limit).

**OMV dashboard unreachable:** SSH into the Pi and run `sudo systemctl restart openmediavault-engined`.
