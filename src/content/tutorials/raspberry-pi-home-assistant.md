---
title: "Install Home Assistant on Raspberry Pi: Build Your Own Smart Home Hub"
description: "Set up Home Assistant OS on a Raspberry Pi 4 or 5 to control all your smart home devices — Philips Hue, smart plugs, sensors, and more — from one dashboard."
publishDate: "2026-03-01"
difficulty: "intermediate"
duration: "1 hour"
tags: ["raspberry pi", "home assistant", "smart home", "automation"]
---

## Why Home Assistant?

Home Assistant is an open-source smart home platform that runs locally — no cloud required. It integrates with over 3,000 devices and services: Philips Hue, IKEA Tradfri, Sonoff, Google Nest, Amazon Echo, Xiaomi, Zigbee, Z-Wave, and hundreds more. Your data stays on your device.

## What You'll Need

- Raspberry Pi 4 (4GB recommended) or Pi 5
- MicroSD card (32GB minimum) or USB SSD (preferred for reliability)
- Ethernet cable (strongly recommended)
- A computer to flash the image

---

## Step 1: Flash Home Assistant OS

Home Assistant OS (HAOS) is a dedicated operating system — flash it directly to your SD card or SSD, not on top of Raspberry Pi OS.

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Click **Choose OS → Other specific-purpose OS → Home assistants and home automation → Home Assistant**
3. Select your Pi model (Raspberry Pi 4 or 5)
4. Select your storage device
5. Click **Write**

For an SSD (recommended over SD card for longevity): use a USB 3.0 SSD enclosure and boot from USB. Set `BOOT_ORDER` to prefer USB boot via `raspi-config` on a temporary Raspberry Pi OS install.

---

## Step 2: First Boot

Insert the SD card or connect the USB SSD, plug in Ethernet, and power on. Home Assistant OS takes **5–10 minutes** on first boot to download additional components. Don't interrupt this process.

Once ready, open a browser on any computer on your network and navigate to:

```
http://homeassistant.local:8123
```

If that doesn't work, find your Pi's IP address (check your router's connected devices list) and use:

```
http://YOUR-PI-IP:8123
```

---

## Step 3: Initial Setup

The onboarding wizard walks you through:

1. **Create your account** — this is your local HA admin account
2. **Name your home** and set your location (used for sunset/sunrise automations)
3. **Select unit system** (metric or imperial)
4. **Auto-discovered devices** — HA will detect devices on your network automatically (Philips Hue bridges, Chromecasts, smart TVs, etc.)

Click **Finish** when done.

---

## Step 4: Add Your First Integration

Go to **Settings → Devices & Services → Add Integration** and search for your device brand.

### Philips Hue
1. Search for "Philips Hue"
2. HA will find your bridge automatically
3. Press the physical button on your Hue bridge when prompted
4. All your lights appear as entities

### Smart Plugs (TP-Link Kasa, Shelly, etc.)
Most work via auto-discovery. If not, add them manually via their integration page.

### Google Nest / Chromecast
Search for "Google Cast" — all Cast devices on your network appear automatically.

---

## Step 5: Create Your First Dashboard

Home Assistant's **Lovelace** dashboard is fully customizable.

Go to **Overview** → click the pencil icon (Edit mode) → **Add Card**.

Useful cards to start:
- **Light card** — toggle a light, adjust brightness and color
- **Entities card** — show multiple devices in a list
- **Weather card** — add your location for a weather widget
- **Media Player card** — control a Chromecast or smart speaker

Arrange cards by dragging. Click **Done** when finished.

---

## Step 6: Create an Automation

Automations are the real power of Home Assistant. Example: turn on a light when you arrive home.

1. Go to **Settings → Automations & Scenes → Create Automation**
2. Click **Add Trigger** → **Person** → select yourself → **Enters zone: Home**
3. Click **Add Action** → **Call Service** → `light.turn_on` → select your light
4. Name and save the automation

Other useful automations:
- **Turn off all lights at midnight**
- **Set thermostat when you leave**
- **Send a notification when a door sensor opens**

---

## Step 7: Remote Access with Nabu Casa (Optional)

To access HA outside your home without configuring port forwarding:

1. Go to **Settings → Home Assistant Cloud**
2. Sign up for [Nabu Casa](https://www.nabucasa.com/) ($6.50/month)
3. Enable remote access — you get a unique HTTPS URL

This subscription also funds Home Assistant development.

---

## Useful Add-ons

Install add-ons from **Settings → Add-ons**:

| Add-on | Purpose |
|---|---|
| **File editor** | Edit config files via the browser |
| **Terminal & SSH** | SSH access to HA |
| **Mosquitto broker** | MQTT broker for Zigbee2MQTT |
| **Zigbee2MQTT** | Connect Zigbee devices (IKEA, Aqara, etc.) via a USB stick |
| **Node-RED** | Visual automation editor |

---

## Troubleshooting

**Can't reach homeassistant.local:** mDNS may not work on your network. Use the IP address directly.

**Slow on SD card:** SD cards wear out under Home Assistant's database writes. Switch to a USB SSD — it's dramatically faster and more reliable.

**Integration not finding my device:** Check that your device is on the same network subnet. Some devices need manual IP entry.
