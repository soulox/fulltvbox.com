---
title: "Build a Retro Gaming Console with RetroPie on Raspberry Pi"
description: "Turn a Raspberry Pi 4 into a retro gaming machine with RetroPie — play NES, SNES, N64, PlayStation, and thousands of classic games from your TV."
publishDate: "2026-02-15"
difficulty: "intermediate"
duration: "1 hour"
tags: ["raspberry pi", "retropie", "gaming", "emulation"]
---

## What You'll Need

- Raspberry Pi 4 (2GB or 4GB recommended) or Pi 5
- MicroSD card (32GB minimum — 64GB+ if you have many ROMs)
- Official Pi power supply
- MicroHDMI to HDMI cable
- USB or Bluetooth gamepad (Xbox, PlayStation, or 8BitDo controllers all work)
- A computer to flash the SD card
- ROMs (game files) — you must legally own the games you emulate

---

## Step 1: Download and Flash RetroPie

RetroPie provides a dedicated disk image — you don't install it on top of regular Raspberry Pi OS.

1. Download the RetroPie image for Raspberry Pi 4 from [retropie.org.uk/download](https://retropie.org.uk/download/)
2. Use [Balena Etcher](https://etcher.balena.io/) or Raspberry Pi Imager to flash it to your microSD card
3. Insert the card into your Pi, connect HDMI and a USB keyboard, and power on

---

## Step 2: First Boot and Expansion

RetroPie boots into EmulationStation — the frontend that organizes your game library by system. On first boot it'll ask you to configure a controller.

If you're using a USB keyboard for now, press any key to proceed. You'll set up your gamepad properly in a moment.

The system then expands the filesystem to use your full SD card automatically. **Wait for this to complete** before doing anything else.

---

## Step 3: Connect to Wi-Fi

Press **F4** to exit EmulationStation to the terminal, then:

```bash
sudo raspi-config
```

Go to **System Options → Wireless LAN**, enter your Wi-Fi SSID and password. Exit raspi-config and reboot.

Alternatively, connect via Ethernet for a simpler setup.

---

## Step 4: Configure Your Gamepad

In EmulationStation, press **Start** (or Enter on keyboard) → **Configure Input**. Hold a button on your controller to detect it, then map each button as prompted.

For **Bluetooth controllers** (PS4, Xbox, 8BitDo):

```bash
sudo ~/RetroPie/supplementary/bluetooth/connect.sh
```

Follow the pairing prompts. Once paired, the controller will reconnect automatically on boot.

---

## Step 5: Transfer Your ROMs

ROMs go in `/home/pi/RetroPie/roms/[system]/`. The simplest transfer methods:

### Option A: USB Drive
1. Create a folder called `retropie` on a USB drive
2. Plug it into the Pi — RetroPie auto-creates the folder structure
3. Unplug, add your ROMs to the appropriate system folders on your computer
4. Plug back in and RetroPie copies them automatically

### Option B: Network Transfer (SFTP)
Connect from your computer using an SFTP client like FileZilla or WinSCP:
- Host: your Pi's IP address
- Username: `pi`
- Password: `raspberry` (change this!)
- Navigate to `/home/pi/RetroPie/roms/`

Drop ROMs into the correct system folders:
- `nes/` — Nintendo NES
- `snes/` — Super Nintendo
- `n64/` — Nintendo 64
- `psx/` — PlayStation 1
- `gba/` — Game Boy Advance

---

## Step 6: Scrape Game Artwork

RetroPie can download box art, screenshots, and descriptions for your games automatically:

In EmulationStation: **Start → Scraper → Scrape Now**

Choose **ScreenScraper** as the source (requires a free account at screenscraper.fr for best results). Select which systems to scrape and let it run.

---

## Step 7: Install a RetroArch Shader (Optional)

RetroArch shaders simulate the look of old CRT TVs, which makes retro games look more authentic:

In a game, press **Hotkey + X** to open the RetroArch menu → **Shaders → Load Shader Preset**. The `crt-pi` shader is popular for Pi hardware.

---

## Performance Tips

**N64 games:** N64 emulation is demanding on Pi 4. Enable overclocking in raspi-config → Performance Options. Most games run well at 2.0 GHz.

**PlayStation games:** PS1 emulation is excellent on Pi 4. Use the PCSX-ReARMed core for best compatibility.

**Reduce input lag:** In RetroArch, set **Video → Hard GPU Sync** to enabled. Set **Frame Delay** to 3–5ms.

---

## Useful Shortcuts

| Shortcut | Action |
|---|---|
| Hotkey + Start | Exit game (return to EmulationStation) |
| Hotkey + R1 | Save state |
| Hotkey + L1 | Load state |
| Hotkey + X | RetroArch menu |
| Hotkey + A | Reset game |

Hotkey is usually the **Select** button.
