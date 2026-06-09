---
title: "Getting Started with Raspberry Pi 5: Complete Beginner's Guide"
description: "Set up your Raspberry Pi 5 from scratch — install Raspberry Pi OS, connect to Wi-Fi, enable SSH, and get a working desktop in under 30 minutes."
publishDate: "2026-01-10"
difficulty: "beginner"
duration: "30 min"
tags: ["raspberry pi", "linux", "beginner", "setup"]
---

## What You'll Need

- Raspberry Pi 5 (4GB or 8GB model)
- MicroSD card (32GB minimum, 64GB recommended — Class 10 or better)
- USB-C power supply (27W official Pi 5 adapter recommended)
- MicroHDMI to HDMI cable
- USB keyboard and mouse (for initial setup)
- A computer to flash the SD card

---

## Step 1: Flash Raspberry Pi OS

The easiest way to set up a Pi is with **Raspberry Pi Imager**, a free tool from the Raspberry Pi Foundation.

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/) on your computer
2. Insert your microSD card into your computer
3. Open Imager and click **Choose OS**
4. Select **Raspberry Pi OS (64-bit)** — the full desktop version
5. Click **Choose Storage** and select your microSD card
6. Click the **gear icon** (⚙️) before writing to pre-configure:
   - Set hostname (e.g. `raspberrypi`)
   - Enable SSH
   - Set username and password
   - Configure Wi-Fi (SSID and password)
   - Set locale and timezone
7. Click **Write** and wait for the process to complete (~5 minutes)

---

## Step 2: First Boot

Insert the microSD card into your Pi 5, connect the HDMI cable, keyboard, mouse, and power supply. The Pi will boot automatically.

On first boot, Raspberry Pi OS runs a setup wizard. If you pre-configured everything in Imager, most steps are already done. Otherwise:

- Connect to Wi-Fi
- Update software when prompted (this takes several minutes)
- Reboot when asked

You'll land at the XFCE desktop.

---

## Step 3: Update the System

Open a terminal (right-click the desktop → Open Terminal) and run:

```bash
sudo apt update && sudo apt upgrade -y
```

This updates all installed packages. On a fresh install this may take 5–10 minutes. Do this before installing anything else.

---

## Step 4: Enable SSH for Remote Access

If you enabled SSH in Imager, you can already connect remotely. Test it from another computer:

```bash
ssh pi@raspberrypi.local
```

Replace `pi` with your username and `raspberrypi` with your hostname. You'll be prompted for your password.

If SSH wasn't enabled during flashing:
```bash
sudo systemctl enable ssh
sudo systemctl start ssh
```

---

## Step 5: Find Your Pi's IP Address

To connect remotely without using the hostname:

```bash
hostname -I
```

This prints your Pi's IP address (e.g. `192.168.1.42`). You can then SSH with `ssh pi@192.168.1.42`.

---

## Step 6: Install Essential Tools

A few tools that make Pi life easier:

```bash
# Better text editor
sudo apt install -y nano

# Network tools
sudo apt install -y net-tools

# Git (for cloning projects)
sudo apt install -y git

# Python pip (for Python projects)
sudo apt install -y python3-pip
```

---

## What's Next?

Now that your Pi is running, here are some great next projects:

- **[Turn your Pi into a Plex Media Server](/tutorials/raspberry-pi-plex-media-server)** — stream your media library to any device
- **[Install Pi-hole ad blocker](/tutorials/raspberry-pi-pihole-ad-blocker)** — block ads across your entire network
- **[Install Home Assistant](/tutorials/raspberry-pi-home-assistant)** — build a smart home hub

---

## Troubleshooting

**No display on boot:** Check the HDMI connection — Pi 5 uses micro-HDMI, not full-size HDMI. Try port 1 (closest to USB-C).

**Pi won't power on:** The Pi 5 requires a 5V/5A (27W) power supply. A phone charger won't work reliably.

**SD card not recognized:** Re-flash with Raspberry Pi Imager. Some off-brand cards are unreliable — stick with SanDisk or Samsung.

**Can't connect via SSH:** Make sure you're on the same network. Try the IP address instead of the hostname.
