---
title: "Overclock Your Raspberry Pi 5: Safe Speed Boost Guide"
description: "Safely overclock a Raspberry Pi 5 from 2.4 GHz to 3.0+ GHz for better performance in gaming, media, and server workloads — with temperatures and benchmarks."
publishDate: "2026-04-20"
difficulty: "advanced"
duration: "30 min"
tags: ["raspberry pi", "overclocking", "performance", "hardware"]
---

## Is Overclocking the Pi 5 Safe?

The Raspberry Pi 5 is officially rated at 2.4 GHz. Raspberry Pi Ltd acknowledges that higher speeds are achievable and built overclock support into the firmware — it won't void your warranty if done within supported parameters. That said, overclocking increases heat and power draw, so proper cooling is **required**.

**What you need:**
- Raspberry Pi 5 (any RAM variant)
- **Active cooling** — the official Pi 5 active cooler or a quality third-party heatsink+fan
- A stable power supply (official 27W USB-C adapter)

---

## Step 1: Install Proper Cooling First

**Do not overclock without active cooling.** The Pi 5 at stock speeds under sustained load hits 70–80°C with passive cooling. Overclocked, it will thermal throttle immediately without a fan.

Recommended cooling options:
- **Official Raspberry Pi Active Cooler** (~$5) — clips directly onto the Pi 5, excellent performance
- **Pimoroni Heatsink Case** — good passive for light overclocks
- **Argon ONE V3** — full aluminum case with built-in fan, great for max overclocks

Check your current temperature:

```bash
vcgencmd measure_temp
```

At idle it should read below 50°C with active cooling.

---

## Step 2: Back Up Your SD Card

Before overclocking, back up your system. If something goes wrong (corrupt boot, instability), you can restore:

```bash
sudo dd if=/dev/mmcblk0 of=/home/pi/backup.img bs=4M status=progress
```

Or use **Raspberry Pi Imager → Backup** on another computer.

---

## Step 3: Edit config.txt

All overclock settings live in `/boot/firmware/config.txt`:

```bash
sudo nano /boot/firmware/config.txt
```

Add at the bottom:

```ini
# Overclock settings
over_voltage_delta=50000
arm_freq=3000
```

**Settings explained:**
- `arm_freq=3000` — sets CPU to 3.0 GHz (up from 2.4 GHz default)
- `over_voltage_delta=50000` — increases core voltage by 50mV to stabilize higher clock

**Conservative start (recommended first step):**
```ini
over_voltage_delta=20000
arm_freq=2800
```

Save and reboot:

```bash
sudo reboot
```

---

## Step 4: Verify the Overclock

After rebooting, confirm the CPU is running at the new speed:

```bash
vcgencmd get_config arm_freq
vcgencmd measure_clock arm
```

The second command shows actual current clock speed (it throttles when cool and idle).

Run a quick stress test to confirm stability:

```bash
sudo apt install -y stress
stress --cpu 4 --timeout 60
```

While it runs, monitor temperature and clock speed in another terminal:

```bash
watch -n 1 "vcgencmd measure_temp && vcgencmd measure_clock arm"
```

Under full load:
- **Temperature should stay below 80°C** — if it hits 85°C, reduce `arm_freq`
- **Clock should stay at your set frequency** — if it drops, you need more voltage or better cooling

---

## Step 5: Benchmark Before and After

A quick benchmark to measure the improvement:

```bash
sudo apt install -y sysbench
sysbench cpu --threads=4 run
```

Look at the **events per second** value. Compare stock vs overclocked.

Typical results:
| Setting | Events/sec |
|---|---|
| Stock (2.4 GHz) | ~3,800 |
| 2.8 GHz | ~4,400 |
| 3.0 GHz | ~4,700 |
| 3.2 GHz | ~5,000 |

---

## Overclock Levels

| Level | arm_freq | over_voltage_delta | Cooling needed |
|---|---|---|---|
| **Mild** | 2800 | 20000 | Heatsink + fan |
| **Moderate** | 3000 | 50000 | Active cooler |
| **Aggressive** | 3200 | 60000 | High-end active cooler |
| **Extreme** | 3400 | 70000 | Not recommended for daily use |

---

## GPU and RAM Overclocking (Optional)

You can also overclock the GPU and RAM:

```ini
gpu_freq=1000
arm_freq=3000
over_voltage_delta=50000
```

RAM (LPDDR4X) overclocking is not officially supported and can cause instability — skip it for daily use.

---

## Reverting the Overclock

If you experience instability (random reboots, corrupted filesystem), revert:

```bash
sudo nano /boot/firmware/config.txt
```

Remove or comment out the overclock lines. If the Pi won't boot, connect the SD card to another computer and edit the file directly.

---

## Troubleshooting

**Pi won't boot after overclock:** Remove the SD card, edit config.txt on another computer, reduce or remove the overclock settings.

**Thermal throttling (clock drops under load):** Improve cooling. Check that the heatsink is properly seated with thermal paste.

**Random crashes:** Reduce `arm_freq` or increase `over_voltage_delta`. Instability usually means not enough voltage for the chosen frequency.

**Rainbow square / undervoltage warning:** Your power supply is insufficient. Use the official 27W adapter.
