---
title: "Watch Jellyfin Away from Home, Safely, with Tailscale"
description: "Stream your Jellyfin library on your phone or a TV box anywhere, without opening ports on your router: put your server and devices on a private Tailscale network. Free for personal use."
publishDate: "2026-10-20"
difficulty: "beginner"
duration: "20 min"
tags: ["jellyfin", "tailscale", "vpn", "remote access", "networking", "raspberry pi"]
---

## Why Not Just Open a Port?

The classic way to reach a home server from outside is **port forwarding**: opening a port on your router so the internet can reach Jellyfin. It works, but it puts your server's login page in front of every scanner on the internet, and keeping that safe means HTTPS certificates, a reverse proxy and regular updates.

**Tailscale** avoids all of that. It creates a private, encrypted network between your own devices (Tailscale calls it a "tailnet"). Your phone, laptop or a TV box elsewhere can reach the Jellyfin server as if it were on your home Wi-Fi, while to everyone else, nothing is open. Tailscale has a free personal plan, and you don't need to touch your router.

## What You'll Need

- A working Jellyfin server, such as our [Jellyfin on Raspberry Pi 5](/tutorials/jellyfin-raspberry-pi-5) setup
- A free Tailscale account (sign in with Google, Microsoft, Apple or GitHub)
- The devices you'll watch on (see the device list in Step 4)

---

## Step 1: Install Tailscale on the Jellyfin Server

On the Raspberry Pi, run Tailscale's official install script:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Then connect it to your account:

```bash
sudo tailscale up
```

It prints a link. Open it on any device, sign in, and approve the Pi. Tailscale starts automatically at every boot from now on.

---

## Step 2: Find the Server's Tailscale Address

```bash
tailscale ip
```

The first line is an address starting with **100.**, like `100.101.102.103`. That's your server's address on your private network, and it doesn't change. Jellyfin's address over Tailscale is:

```
http://100.101.102.103:8096
```

(using your own address).

---

## Step 3: Set Up Your Phone or Laptop

1. Install **Tailscale** from the App Store, Google Play, or tailscale.com/download for Windows and Mac.
2. Sign in with the **same account** you used for the server.
3. In the Jellyfin app, add a server and enter the Tailscale address from Step 2, such as `http://100.101.102.103:8096`. Jellyfin's apps find servers automatically at home, but not over Tailscale, so type it in.

Now turn off Wi-Fi on your phone and try it over mobile data: your library should load.

---

## Step 4: TV Boxes Away from Home

To watch on a TV somewhere else (a holiday home, a family member's house), that TV box needs Tailscale too:

- **Google TV and Android TV:** Tailscale from Google Play (Android 8.0 or later). On a TV, the app shows a QR code; scan it with your phone to sign in.
- **Apple TV:** Tailscale from the App Store (tvOS 17 or later).
- **Fire TV with Fire OS:** Tailscale isn't in the Amazon Appstore. Tailscale offers its Android app as a download that you install with the Downloader app, and it doesn't update itself. It isn't available for Vega OS Fire TV sticks or very old Fire OS 5 and 6 devices.
- **Roku and most smart-TV platforms (LG, Samsung):** there's no Tailscale app, so this method doesn't work on them.

Then add the server in the Jellyfin app on the TV box using the same `http://100.x.x.x:8096` address.

---

## Will It Stream Smoothly?

Over Tailscale, your home internet's **upload** speed becomes the limit. A typical 1080p file needs roughly 5–15 Mbps, and 4K remuxes much more.

This matters on a Raspberry Pi: when a connection is too slow for the original file, Jellyfin tries to convert it to a lower quality, and a Pi 5 can't do that well because it has no hardware video encoder. In practice:

- 1080p files usually stream fine if your home upload is 20 Mbps or more.
- Big 4K files are best watched at home.
- For flights and hotels, downloading files to your phone before you leave is more reliable than streaming. Download support varies between Jellyfin apps, so check yours at home first.

---

## Troubleshooting

**The app can't connect:** check Tailscale is switched on, on both devices, with the same account. In the Tailscale app, the server should be listed as connected.

**It works at home but not on mobile data:** you probably added the server with its home address (`192.168.x.x`). Add it again with the `100.x.x.x` address.

**Very slow or buffering:** test your home upload speed. In Jellyfin, **Dashboard → Activity** shows whether a remote stream is transcoding; if it is, the Pi is the bottleneck.

**Want to share with a friend?** Tailscale can share a single device with another Tailscale user (search Tailscale's docs for "sharing"), so they reach your Jellyfin server without joining your whole network. Give them their own Jellyfin user, too.
