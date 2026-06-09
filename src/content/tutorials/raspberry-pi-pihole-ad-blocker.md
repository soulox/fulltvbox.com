---
title: "Install Pi-hole on Raspberry Pi: Block Ads Across Your Entire Network"
description: "Set up Pi-hole on a Raspberry Pi to block ads, trackers, and malware domains for every device on your network — no app installs required."
publishDate: "2026-02-05"
difficulty: "beginner"
duration: "20 min"
tags: ["raspberry pi", "pi-hole", "networking", "privacy"]
---

## What Is Pi-hole?

Pi-hole is a DNS sinkhole — a DNS server that sits on your network and blocks requests to known ad, tracker, and malware domains before they reach your devices. Unlike browser extensions, Pi-hole works for every device on your network: phones, smart TVs, tablets, streaming boxes, and even smart home devices.

## What You'll Need

- Raspberry Pi (any model — even a Pi Zero W works)
- Raspberry Pi OS Lite installed (headless is fine)
- A static IP address for your Pi
- Admin access to your router

---

## Step 1: Give Your Pi a Static IP

Pi-hole needs a fixed IP address on your network. The easiest way is to reserve one in your router's DHCP settings. Look for "DHCP reservation" or "static DHCP" in your router admin panel and assign a permanent IP to your Pi's MAC address.

Alternatively, set a static IP on the Pi itself:

```bash
sudo nano /etc/dhcpcd.conf
```

Add at the bottom (adjust for your network):

```
interface eth0
static ip_address=192.168.1.10/24
static routers=192.168.1.1
static domain_name_servers=1.1.1.1 8.8.8.8
```

Save and reboot:

```bash
sudo reboot
```

---

## Step 2: Install Pi-hole

Pi-hole's one-line installer handles everything:

```bash
curl -sSL https://install.pi-hole.net | bash
```

The installer is interactive — it'll walk you through:

1. **Upstream DNS provider** — choose Cloudflare (1.1.1.1) or Google (8.8.8.8)
2. **Block lists** — keep the defaults (StevenBlack's Unified Hosts list)
3. **Web admin interface** — install it (yes)
4. **Log queries** — yes (useful for seeing what's being blocked)
5. **Privacy level** — 0 (show everything) is most useful for home use

At the end, the installer will show you:
- Your Pi-hole IP address
- Your admin panel password — **write this down**

---

## Step 3: Access the Admin Dashboard

Open a browser and go to:

```
http://YOUR-PI-IP/admin
```

Log in with the password from the installer. You'll see a dashboard showing:

- Total DNS queries today
- Queries blocked (percentage)
- Domains on your blocklist
- Query log (what's being blocked and allowed)

---

## Step 4: Point Your Router to Pi-hole

This is the key step — tell your router to use your Pi as the DNS server for all devices:

1. Log into your router admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Find **DHCP settings** or **DNS settings**
3. Set the **Primary DNS** to your Pi's IP address (e.g. `192.168.1.10`)
4. Set a **Secondary DNS** to a real DNS (e.g. `1.1.1.1`) as a fallback
5. Save and restart the router

Devices will pick up the new DNS server when they renew their DHCP lease — either wait, or reconnect each device manually.

---

## Step 5: Verify It's Working

On any device on your network, visit a site you know has ads (any news site works). The ads should be gone. You can also check the Pi-hole dashboard — you'll see DNS queries coming in from devices around your home.

---

## Adding More Blocklists

Pi-hole's default blocklist blocks ~100,000 domains. You can add more:

1. In the admin panel, go to **Adlists**
2. Add a list URL — popular options:
   - `https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts`
   - `https://someonewhocares.org/hosts/hosts`
   - `https://raw.githubusercontent.com/PolishFiltersTeam/KADhosts/master/KADhosts.txt`
3. Go to **Tools → Update Gravity** to apply the new lists

---

## Whitelisting Sites That Break

Some sites use the same domains for both ads and functionality. If something breaks:

1. Check the Pi-hole **Query Log** to see what's being blocked
2. Add the domain to your **Whitelist**: `pihole -w domain.com`
3. Or use the web interface: **Whitelist → Add Domain**

---

## Troubleshooting

**No internet after setup:** Your Pi-hole may be down. Set your router DNS back to `1.1.1.1` temporarily. Check `sudo systemctl status pihole-FTL`.

**Ads still showing:** Some devices cache DNS. Flush DNS on your device or reconnect to the network.

**Specific site broken:** Check query log, find the blocked domain, whitelist it.
