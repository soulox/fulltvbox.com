---
title: "Set Up Your Own VPN Server with PiVPN on Raspberry Pi"
description: "Run your own WireGuard VPN server on a Raspberry Pi to securely access your home network from anywhere — no subscription, no third-party logging."
publishDate: "2026-03-20"
difficulty: "intermediate"
duration: "40 min"
tags: ["raspberry pi", "vpn", "networking", "privacy", "wireguard"]
---

## Why Run Your Own VPN?

Commercial VPNs route your traffic through someone else's server. A self-hosted VPN on your home Pi lets you:

- **Securely access your home network** from anywhere (NAS, Pi-hole, cameras)
- **Encrypt traffic** on public Wi-Fi without trusting a third party
- **Bypass geo-restrictions** using your home IP
- **No monthly fees** and no logs kept by anyone but you

---

## What You'll Need

- Raspberry Pi (any model with Ethernet recommended)
- Raspberry Pi OS installed
- A **static IP or dynamic DNS** for your home router (see Step 2)
- Port forwarding access on your router

---

## Step 1: Install PiVPN

PiVPN is the simplest way to set up WireGuard on a Pi. Run the one-line installer:

```bash
curl -L https://install.pivpn.io | bash
```

The interactive installer will ask:

1. **Static IP:** Confirm your Pi's local IP (set a DHCP reservation in your router first)
2. **VPN protocol:** Choose **WireGuard** (faster and more modern than OpenVPN)
3. **Port:** Default is `51820` (UDP) — keep it unless you have a reason to change
4. **DNS provider:** Choose **Pi-hole** if you have it, or use Cloudflare (1.1.1.1)
5. **Public IP or DNS:** Enter your public IP or dynamic DNS hostname (see Step 2)

Reboot when the installer finishes:

```bash
sudo reboot
```

---

## Step 2: Set Up Dynamic DNS (If You Don't Have a Static IP)

Most home internet connections have a dynamic public IP that changes periodically. Dynamic DNS (DDNS) gives you a fixed hostname that always points to your current IP.

**Free options:**
- **DuckDNS** (duckdns.org) — free, easy, Raspberry Pi-friendly
- **No-IP** (noip.com) — free tier available
- **Cloudflare** — if you own a domain

### DuckDNS Setup

1. Sign in at [duckdns.org](https://www.duckdns.org) with Google/GitHub
2. Create a subdomain (e.g. `myhome.duckdns.org`)
3. Follow the Pi install instructions on the site — it installs a cron job that updates your IP every 5 minutes

---

## Step 3: Forward the VPN Port on Your Router

Log into your router admin panel and create a port forwarding rule:

- **External port:** 51820
- **Protocol:** UDP
- **Internal IP:** Your Pi's local IP (e.g. 192.168.1.10)
- **Internal port:** 51820

Save and apply.

---

## Step 4: Create a VPN Client Profile

For each device that will connect to your VPN, create a profile:

```bash
pivpn add
```

Enter a name (e.g. `iphone`, `laptop`, `work-pc`). PiVPN generates a config file and QR code.

View the QR code on screen:

```bash
pivpn qrcode iphone
```

---

## Step 5: Connect Your Devices

### iPhone / Android

1. Install the **WireGuard** app from the App Store or Play Store
2. Tap **+** → **Create from QR code**
3. Scan the QR code from your Pi's screen
4. Toggle the connection on

### Windows / Mac / Linux

1. Install [WireGuard](https://www.wireguard.com/install/)
2. Copy the `.conf` file from your Pi:
   ```bash
   cat ~/configs/laptop.conf
   ```
3. Import it into the WireGuard app

---

## Step 6: Test Your Connection

Connect your phone to mobile data (not your home Wi-Fi), enable the VPN, and visit [whatismyip.com](https://www.whatismyip.com). Your IP should show your home address.

You should also be able to access local network devices by their local IP — your NAS at `192.168.1.x`, Pi-hole dashboard, etc.

---

## Useful PiVPN Commands

```bash
pivpn add          # Create a new client
pivpn remove       # Remove a client
pivpn list         # List all clients
pivpn status       # Show connected clients
pivpn -qr name    # Show QR code for a client
pivpn update       # Update PiVPN
```

---

## Troubleshooting

**Can't connect from outside:** Double-check port forwarding. Test with `nmap -sU -p 51820 your-public-ip` from a remote machine.

**Connected but no internet:** Check that IP forwarding is enabled: `sysctl net.ipv4.ip_forward` should return `1`.

**IP keeps changing:** Set up DuckDNS as described in Step 2.

**Slow speeds:** WireGuard is fast — if speeds are slow, check your home upload bandwidth, not the Pi.
