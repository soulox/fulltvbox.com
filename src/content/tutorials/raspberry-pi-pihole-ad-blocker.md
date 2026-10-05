---
title: "Install Pi-hole on Raspberry Pi: Block Ads"
description: "Set up Pi-hole v6 on a Raspberry Pi to block ads, trackers, and malware domains for every device on your network — updated for current Raspberry Pi OS."
publishDate: "2026-02-05"
updatedDate: "2026-09-18"
difficulty: "beginner"
duration: "20 min"
tags: ["raspberry pi", "pi-hole", "networking", "privacy"]
---

## What Is Pi-hole?

Pi-hole is a DNS sinkhole: a DNS server on your network that refuses to look up known ad, tracker, and malware domains. It isn't a browser extension, so it works for every device on your network, including phones, smart TVs, tablets, streaming boxes, and smart home devices.

> **Updated for 2026:** this guide covers **Pi-hole v6** (which replaced the old web server and several commands) and current **Raspberry Pi OS**, which configures networking with NetworkManager instead of `dhcpcd`.

## What You'll Need

- Raspberry Pi (any model — even a Pi Zero 2 W works)
- Raspberry Pi OS Lite, current release (headless is fine)
- A fixed IP address for your Pi
- Admin access to your router

---

## Step 1: Give Your Pi a Fixed IP

Pi-hole needs an address that never changes. The easiest and most reliable way is a **DHCP reservation** on your router: look for "DHCP reservation", "static lease", or "address reservation" in the router's admin panel and pin an IP to your Pi's MAC address. Then skip to Step 2.

If your router can't do that, set a static IP on the Pi itself. Current Raspberry Pi OS uses **NetworkManager**, so editing `/etc/dhcpcd.conf` (the method in older guides) no longer does anything. First find your connection's name:

```bash
nmcli connection show
```

For a wired Pi it's usually `Wired connection 1`; on Wi-Fi it's your network name. Then set the address (adjust the IPs for your network):

```bash
sudo nmcli connection modify "Wired connection 1" \
  ipv4.method manual \
  ipv4.addresses 192.168.1.10/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns 1.1.1.1
sudo nmcli connection up "Wired connection 1"
```

Your SSH session may drop when the address changes; reconnect to the new IP. The `ipv4.dns` value is only what the Pi itself uses. Pi-hole picks its own upstream DNS in the next step.

---

## Step 2: Install Pi-hole

Pi-hole's official installer handles everything:

```bash
curl -sSL https://install.pi-hole.net | bash
```

Piping a script into `bash` runs it sight unseen. If you'd rather read it first, download it with `curl -sSL https://install.pi-hole.net -o install.sh`, review it, then run `sudo bash install.sh`.

The installer is interactive. It asks for:

1. **Upstream DNS provider:** the server Pi-hole forwards allowed lookups to. Cloudflare (1.1.1.1) or Quad9 are good choices.
2. **Blocklist:** keep the default (StevenBlack's Unified Hosts list).
3. **Query logging:** yes, so you can see what's being blocked.
4. **Privacy level:** 0 (show everything) is the most useful for a home network.

When it finishes, it shows your Pi-hole's IP address and a randomly generated admin password. To set your own password:

```bash
sudo pihole setpassword
```

---

## Step 3: Open the Admin Dashboard

In a browser, go to:

```
http://YOUR-PI-IP/admin
```

Log in with your password. The dashboard shows:

- Total DNS queries today
- Queries blocked (percentage)
- Number of domains on your blocklists
- The query log (what was blocked and what was allowed)

In Pi-hole v6 the web interface is built into Pi-hole itself, so it no longer needs a separate web server (lighttpd).

---

## Step 4: Point Your Network at Pi-hole

This is the step that makes it work: every device has to use Pi-hole as its DNS server.

1. Log into your router's admin panel (usually `192.168.1.1` or `192.168.0.1`).
2. Find the **DHCP** or **LAN DNS** settings. You want the DNS server handed out to devices, not the router's own WAN/upstream DNS.
3. Set the **DNS server** to your Pi's IP address (e.g. `192.168.1.10`).
4. **Don't add a public DNS server like `1.1.1.1` as a secondary.** Devices don't strictly prefer the primary, so they'll send some lookups to the secondary and those ads get through. If your router insists on two entries, enter the Pi's IP in both, or use a second Pi-hole.
5. Save, then restart the router.

Devices switch to Pi-hole when they renew their DHCP lease. To speed that up, reconnect each device to Wi-Fi.

**If your router won't let you change the DNS it hands out** (common on ISP-supplied routers), use Pi-hole's own DHCP server instead. Turn off DHCP on the router, then in Pi-hole go to **Settings → DHCP** and enable it. Only one DHCP server may run on the network, so switch the router's off first.

**If your network uses IPv6**, devices may also get the router's IPv6 DNS server, which bypasses Pi-hole. Either give Pi-hole's IPv6 address to your router's IPv6 DNS setting, or turn off IPv6 DNS advertising (RDNSS/DHCPv6) on the router.

---

## Step 5: Check It's Working

1. Open the Pi-hole dashboard and check that queries are coming in from devices around your home.
2. On a phone or laptop, visit an ad-heavy news site. Most banner ads should be gone.
3. In the **Query Log**, confirm that ad domains show as blocked.

**A note for streaming devices:** some devices, including many Google TV and Chromecast models, are hard-coded to use their own DNS servers (for example Google's `8.8.8.8`) and ignore Pi-hole. Pi-hole also can't block **YouTube or Twitch video ads**, because they're served from the same domains as the videos themselves. It works well for tracking and telemetry domains and in-app banner ads on smart TVs.

---

## Adding More Blocklists

The default list blocks well over 100,000 domains, which is enough for most homes. To add more:

1. In the admin panel, go to **Lists**.
2. Paste a list URL and add it. Two well-maintained sources:
   - The **HaGeZi DNS blocklists** project on GitHub, which offers tiered lists from "light" to "ultimate". Start with "normal".
   - **firebog.net**, a curated directory whose "ticked" lists are the safe, low-breakage choices.
3. Apply the new lists under **Tools → Update Gravity**, or from the command line:

```bash
pihole -g
```

More lists isn't always better: very aggressive lists break logins, shopping sites, and app features.

---

## Allowing Sites That Break

Some sites use the same domains for ads and for real functionality. If something stops working:

1. Look in the **Query Log** for what was blocked around the time it broke.
2. Allow the domain from the command line. Pi-hole v6 replaced the old `pihole -w` with:

```bash
pihole allow example.com
```

3. Or use the web interface: go to **Domains**, add the domain, and choose **Allow**.

---

## Troubleshooting

**No internet after setup:** Pi-hole is probably down or unreachable. Temporarily point your router's DNS back to your ISP or `1.1.1.1`, then check the service on the Pi:

```bash
sudo systemctl status pihole-FTL
pihole status
```

**Ads still showing:** the device may be caching old DNS answers or using hard-coded DNS (see the streaming note above), or it may be getting a secondary or IPv6 DNS server from the router. Reconnect the device and check it appears in the Pi-hole query log.

**A specific site is broken:** find the blocked domain in the query log and allow it with `pihole allow`.

**Keeping Pi-hole up to date:**

```bash
pihole -up
```
