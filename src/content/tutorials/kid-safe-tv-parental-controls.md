---
title: "Set Up Kid-Safe TV: Parental Controls on Google TV, Jellyfin and Pi-hole"
description: "Give kids their own TV space with screen-time limits and bedtime on Google TV, a kids-only Jellyfin library with rating limits and hours, and a Pi-hole family filter for their devices."
publishDate: "2026-10-20"
difficulty: "beginner"
duration: "45 min"
tags: ["parental controls", "google tv", "jellyfin", "pi-hole", "family", "privacy"]
---

## The Plan

No single switch makes a home kid-safe; each layer covers something the others can't. This tutorial sets up three, and you can use any of them on its own:

1. **Google TV kids profiles:** which apps kids can open, daily screen time and bedtime.
2. **Jellyfin kids users:** what they can watch from your own library, and when.
3. **Pi-hole family filter:** blocks adult websites on the kids' tablets and laptops, whatever app or browser they use.

Controls make mistakes less likely; they don't replace keeping an eye on things. Kids who are determined can find gaps, and the tutorial notes the main ones.

---

## Part 1: A Kids Profile on Google TV

Google TV can give each child their own profile with its own home screen, apps and limits, on devices such as the [Google TV Streamer](/reviews/google-tv-streamer-4k-2024) and Google TV televisions.

### Add the profile

1. On the TV, select your **profile picture** at the top right, then **Add account** (the wording varies slightly between versions).
2. Choose **Add a kid**. If your child is already in your Google family group, pick their name; otherwise follow the steps to create a profile. A child can have their own Google Account, or a profile with just a name and age.
3. Choose the **apps** the profile can use. Only these show up on the kid's home screen.

### Set limits

In the kid's profile settings (and in the **Google Family Link** app on your phone, if the profile is linked to a child's Google Account):

- **Daily screen time:** the TV counts down with warnings, then shows "Time's up". You can grant extra time if you're feeling generous.
- **Bedtime:** after this time, nothing plays until morning.
- **App controls:** block or allow individual apps, from the TV or remotely with Family Link.

### Lock the other profiles

Add a **PIN** so kids can't simply switch to a parent's profile. Without it, the limits above are easy to walk around.

**Other platforms:** Apple TV has content restrictions in its settings, Fire TV has profiles with Amazon Kids, and Roku has a PIN for purchases and ratings. The details differ, but the ideas are the same: a separate profile, chosen apps and a PIN.

---

## Part 2: A Kids User in Jellyfin

If you run your own media server with [Jellyfin](/tutorials/jellyfin-raspberry-pi-5), give each child their own user. In Jellyfin, go to **Dashboard → Users** and add one per child, then open each kid's user and set:

### Library access (the most reliable control)

On the **Access** tab, untick **Enable access to all libraries** and choose only the libraries meant for them. Library access works on where a file lives, not on what a ratings website says, so it's hard to get wrong.

The simplest setup: put kids' movies and shows in their own folders (`/mnt/media/Kids Movies`, `/mnt/media/Kids Shows`), add those as separate libraries, and give kids access only to those.

### Rating limits

On the **Parental control** tab:

- Set **Maximum allowed parental rating**, such as PG or TV-Y7. Titles rated above it disappear for that user.
- Turn on **Block items with no or unrecognized rating information**. Without it, an unrated item counts as "unknown" and slips through.

### Access schedule

Also on the **Parental control** tab, add an **access schedule** with the days and hours the user can watch, such as 4pm to 7pm on school days. Outside those hours, Jellyfin won't play anything for that user.

Jellyfin doesn't have daily time allowances; for those, use the device's own limits (Part 1).

### Keep your own user locked

Sign the kid's user in on their TV box or tablet, and make sure **your** Jellyfin user has a password, so they can't switch to it.

---

## Part 3: A Family Filter with Pi-hole

If you run [Pi-hole](/tutorials/raspberry-pi-pihole-ad-blocker), you can give the kids' devices an extra blocklist of adult sites while everyone else keeps their normal settings. This uses Pi-hole's **Group Management**.

### Step 1: Give kids' devices fixed addresses

In your router, reserve a fixed IP address (often called a "DHCP reservation") for each kid's tablet, laptop and console, so Pi-hole can recognize them. Turn off "private" or "random" Wi-Fi addresses for your home network on those devices too, or they may change.

### Step 2: Create a Kids group

In the Pi-hole admin page, go to **Group Management → Groups**, add a group called `Kids`.

### Step 3: Add the family-filter list

Go to **Group Management → Lists**, add this list (the adult-content hosts list from the well-known StevenBlack project), and give it a comment like "Family filter":

```
https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/porn-only/hosts
```

In the list's group assignment, select **Kids** and **remove Default**, so it applies only to the kids' devices. Then update Pi-hole's lists: **Tools → Update Gravity**, then **Update**.

### Step 4: Put the kids' devices in the group

Go to **Group Management → Clients**, add each kid's device by its IP address, and assign it to **Kids** and **Default**. Keeping Default means their devices still get your normal ad blocking too.

Test from a kid's device: an adult site should fail to load, while the same site still loads on yours.

**The gaps to know about:** a filter only works while the device uses Pi-hole. Mobile data, a VPN app, or a browser's built-in "secure DNS" setting all bypass it. On kids' devices, turn off secure DNS in the browser settings, and use the device's own parental controls (Family Link, Screen Time) to block VPN apps.

---

## Troubleshooting

**A kids title is missing in Jellyfin:** it may have no rating, and you blocked unrated items. Edit the item's metadata to add a rating, or keep it in a kids-only library and rely on library access.

**Pi-hole doesn't filter a kid's device:** check the device's IP address matches the one in **Clients** (private Wi-Fi addresses change it), and that the device uses Pi-hole for DNS: check **Query Log** for its address.

**The screen-time limit didn't kick in:** check the kid is actually in their own profile, and that parent profiles have a PIN.
