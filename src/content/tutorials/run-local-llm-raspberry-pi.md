---
title: "Run a Local LLM on a Raspberry Pi 5 with Ollama"
description: "Turn a Raspberry Pi 5 into a private, offline AI chatbot. Install Ollama, pull a small model like Llama 3.2 or Phi-3, and chat with an LLM that runs entirely on your own hardware — no cloud, no fees."
publishDate: "2026-06-17"
difficulty: "intermediate"
duration: "30 min"
tags: ["raspberry pi", "ai", "llm", "ollama", "self-hosted", "linux"]
---
---

## What you'll need

- A **Raspberry Pi 5** — get the **8GB or 16GB** model. RAM is the hard limit on which models you can run, so more is better here.
- Active cooling (the official Active Cooler or a case with a fan) — the Pi will run the CPU hard.
- A quality power supply and a 32GB+ microSD card or, better, an **NVMe SSD** (models are several gigabytes each).
- Raspberry Pi OS (64-bit) already set up. New to the Pi? Start with our [Raspberry Pi 5 getting-started guide](/tutorials/raspberry-pi-5-getting-started).

> **Reality check:** a Pi has no dedicated GPU VRAM, so it runs **small** models (1-3B parameters) on the CPU. Expect a usable, conversational pace — not the instant replies of a desktop GPU. For bigger models you'll want real hardware; see our [best hardware for local LLMs](/guides/best-hardware-run-llm-locally-2026) guide.

---
---

## Step 1: Update the Pi

Open a terminal and make sure everything is current before installing:

```bash
sudo apt update && sudo apt upgrade -y
```

Reboot if the kernel updated:

```bash
sudo reboot
```

---
---

## Step 2: Install Ollama

[Ollama](https://ollama.com) is the simplest way to download and run local models. It has a native ARM64 build, so the official one-line installer works directly on the Pi:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

The script installs Ollama and starts it as a background service. Confirm it's running:

```bash
ollama --version
```

---
---

## Step 3: Pull and run a small model

Model size must fit in the Pi's RAM. Good choices for an 8GB Pi:

- **`llama3.2:3b`** — a capable 3B all-rounder from Meta.
- **`phi3:mini`** — Microsoft's 3.8B model, strong at reasoning for its size.
- **`gemma2:2b`** — Google's small, fast 2B model.
- **`llama3.2:1b`** — the fastest option when you want snappy replies over smarts.

Download and chat in one command:

```bash
ollama run llama3.2:3b
```

The first run downloads the model (a few gigabytes), then drops you into an interactive prompt. Type a question and it answers — entirely offline. Press `Ctrl+D` to exit.

> **Tip:** start with a 1-3B model. If replies are too slow, drop to `llama3.2:1b`; if you have a 16GB Pi and want more capability, try a quantized 7-8B model and accept slower output.

---
---

## Step 4: Use it from your network (optional)

Ollama exposes an HTTP API on port `11434`. To reach it from other machines, bind it to all interfaces. Edit the service override:

```bash
sudo systemctl edit ollama.service
```

Add these lines, then save:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
```

Restart and confirm:

```bash
sudo systemctl restart ollama
curl http://localhost:11434/api/tags
```

Now any device on your LAN can use the Pi as a private AI endpoint — point a chat front-end like **Open WebUI** at `http://<your-pi-ip>:11434`. Only do this on a trusted home network; don't expose port 11434 to the internet.

---
---

## Getting the best performance

- **Use an NVMe SSD**, not a microSD card — model load times and stability improve noticeably.
- **Keep it cool.** Sustained inference pins the CPU; without active cooling the Pi will thermal-throttle. Our [overclocking guide](/tutorials/raspberry-pi-overclock) covers cooling and safe clock tuning.
- **Match the model to the RAM.** If the Pi swaps to disk, responses crawl. Smaller model, faster replies.
- **Lower the context length** if you only need short answers — it saves memory.

---
---

## What's next?

A Pi running an LLM pairs naturally with the rest of a home lab:

- **[Install Pi-hole ad blocker](/tutorials/raspberry-pi-pihole-ad-blocker)** — network-wide ad blocking on the same box.
- **[Build a Raspberry Pi NAS](/tutorials/raspberry-pi-nas-openmediavault)** — store your model files and data.
- **[Best hardware to run LLMs locally](/guides/best-hardware-run-llm-locally-2026)** — when you outgrow the Pi and want to run bigger models on a GPU or Mac.

Running an LLM on a $80 computer won't replace a cloud model — but it's a genuinely private, offline assistant you fully own, and a great way to learn how local AI works before investing in bigger hardware.
