---
title: "Run a Minecraft Server on Raspberry Pi"
description: "Set up a private Minecraft Java or Bedrock server on a Raspberry Pi 4 or 5 — play with friends on your own server with no monthly hosting fees."
publishDate: "2026-04-10"
difficulty: "intermediate"
duration: "45 min"
tags: ["raspberry pi", "minecraft", "gaming", "server", "java"]
---

## Pi 4 vs Pi 5 for Minecraft

- **Pi 4 (4GB):** Handles 2–4 players on a small world comfortably. View distance of 6–8 chunks recommended.
- **Pi 5 (8GB):** Handles 4–8 players. The faster CPU makes a noticeable difference for chunk generation.
- **Pi 3:** Not recommended — too slow for a usable experience.

---

## Minecraft Java vs Bedrock

| | Java Edition | Bedrock Edition |
|---|---|---|
| Platform | PC only | PC, Console, Mobile |
| Pi server software | PaperMC (recommended) | Nukkit / PocketMine |
| Performance on Pi | Good with PaperMC | Good with Nukkit |
| Mods | Yes (Forge, Fabric) | Limited |

This guide covers **Java Edition with PaperMC** — the most popular choice.

---

## Step 1: Prepare Your Pi

Make sure Raspberry Pi OS is installed and up to date:

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Java

PaperMC requires Java 21 for Minecraft 1.21+:

```bash
sudo apt install -y openjdk-21-jdk-headless
java -version
```

---

## Step 2: Download PaperMC

Create a dedicated directory:

```bash
mkdir ~/minecraft && cd ~/minecraft
```

Download the latest PaperMC build (check [papermc.io](https://papermc.io/downloads) for the latest version):

```bash
wget -O paper.jar "https://api.papermc.io/v2/projects/paper/versions/1.21.4/builds/latest/downloads/paper-1.21.4-latest.jar"
```

---

## Step 3: First Run and EULA

Run the server once to generate config files:

```bash
java -Xms512M -Xmx2G -jar paper.jar --nogui
```

It will stop with an error about the EULA. Accept it:

```bash
nano eula.txt
```

Change `eula=false` to `eula=true`. Save and exit.

---

## Step 4: Start the Server

```bash
java -Xms512M -Xmx2G -jar paper.jar --nogui
```

**RAM allocation guide:**
- Pi 4 (4GB): `-Xmx2G` (leave 2GB for the OS)
- Pi 5 (8GB): `-Xmx4G` or `-Xmx5G`

Wait for `Done (Xs)! For help, type "help"` — the server is ready.

---

## Step 5: Configure the Server

Edit `server.properties` to tune performance for the Pi:

```bash
nano server.properties
```

Recommended settings:

```properties
view-distance=6
simulation-distance=4
max-players=8
difficulty=normal
gamemode=survival
online-mode=true
```

Lower `view-distance` is the most impactful performance setting. Default is 10 — drop to 6 for smoother gameplay on a Pi.

---

## Step 6: Connect to Your Server

### From the Same Network

Find your Pi's IP:

```bash
hostname -I
```

In Minecraft → **Multiplayer → Add Server** → enter `192.168.1.x:25565`.

### From the Internet (Friends Outside Your Network)

1. Forward **TCP port 25565** on your router to your Pi's local IP
2. Share your **public IP address** (check [whatismyip.com](https://whatismyip.com)) or set up a dynamic DNS hostname (see our [PiVPN guide](/tutorials/pivpn-raspberry-pi) for DuckDNS setup)

---

## Step 7: Keep the Server Running (Systemd Service)

Create a startup script:

```bash
nano ~/minecraft/start.sh
```

```bash
#!/bin/bash
cd /home/pi/minecraft
java -Xms512M -Xmx2G -jar paper.jar --nogui
```

```bash
chmod +x ~/minecraft/start.sh
```

Create a systemd service:

```bash
sudo nano /etc/systemd/system/minecraft.service
```

```ini
[Unit]
Description=Minecraft Server
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/minecraft
ExecStart=/home/pi/minecraft/start.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable minecraft
sudo systemctl start minecraft
sudo systemctl status minecraft
```

The server now starts automatically on boot.

---

## Step 8: Server Admin Commands

Connect to the server console via SSH and use `systemctl`:

```bash
# View live console output
sudo journalctl -u minecraft -f

# Stop the server
sudo systemctl stop minecraft

# Restart the server
sudo systemctl restart minecraft
```

Common in-game admin commands (run in console or as op):

```
/op username       — give operator status
/deop username     — remove operator status
/ban username      — ban a player
/whitelist add username  — add to whitelist
/difficulty hard   — change difficulty
/weather clear     — clear weather
```

---

## Performance Tips

**Use an SSD:** SD card I/O is a bottleneck for world saves. A USB SSD dramatically improves chunk loading.

**Optimize PaperMC:** Edit `config/paper-world-defaults.yml` and reduce `mob-spawn-range` and `entity-activation-range` values.

**Backups:** Set up a cron job to back up the `world/` folder regularly:

```bash
crontab -e
```

```
0 4 * * * tar -czf ~/backups/world-$(date +\%Y\%m\%d).tar.gz ~/minecraft/world/
```
