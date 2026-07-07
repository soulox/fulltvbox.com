---
title: "Best Hardware to Run LLMs Locally (2026): GPUs, Macs, and Mini PCs"
description: "Running ChatGPT-style models on your own machine comes down to one number: memory. Here's the hardware that actually runs local LLMs well in 2026, from $300 GPUs to 128GB unified-memory desktops."
publishDate: "2026-06-17"
category: "ai-llm"
faq:
  - question: "What hardware do I need to run an LLM locally?"
    answer: "Memory is the deciding factor. For a smooth 7-8B model you want at least 8GB of VRAM (or unified memory); for 13-14B models 16GB; for 30-34B models 24GB; and for 70B models you need roughly 48GB or more. A used NVIDIA RTX 3090 (24GB) is the value sweet spot; Apple Silicon Macs and 128GB unified-memory desktops handle the biggest models."
  - question: "How much VRAM do I need to run a local LLM?"
    answer: "As a rule of thumb at 4-bit quantization: ~3B models need ~2GB, 7-8B need ~5-6GB, 13-14B need ~9-10GB, 32-34B need ~20-24GB, and 70B models need ~40-48GB — plus headroom for context. Always size for the model plus a few GB of overhead."
  - question: "Is NVIDIA or AMD better for local AI?"
    answer: "NVIDIA, by a wide margin, because almost every tool targets CUDA first. AMD's ROCm works and the 24GB Radeon RX 7900 XTX is good value, but expect more setup friction. For the least hassle, buy NVIDIA."
  - question: "Can a Mac run local LLMs?"
    answer: "Yes, and Apple Silicon is one of the best options. Its unified memory is shared between CPU and GPU, so a Mac with 64GB or 128GB can load large models that would need multiple PC GPUs — at lower bandwidth, but with far more capacity for the money and power draw."
  - question: "Do I need an internet connection to run a local LLM?"
    answer: "No. Once you've downloaded the model weights, a local LLM runs entirely offline. That's the main appeal: privacy, no per-token fees, and no dependency on a cloud provider."
---
---

## The short version

- **It's all about memory.** The single number that decides what you can run is how much VRAM (on a GPU) or unified memory (on a Mac or APU) you have. Compute speed affects *how fast* it replies; memory decides *whether it runs at all*.
- **Best value:** a used **NVIDIA RTX 3090 (24GB)** — it runs models up to ~34B comfortably for a fraction of new-card prices.
- **Easiest big-model path:** an **Apple Silicon Mac** (M4 Pro/Max or M3 Ultra) with 64-128GB of unified memory, or **NVIDIA's DGX Spark** desktop with 128GB.
- **Cheapest way in:** a **12GB RTX 3060** or any recent laptop — enough for the genuinely useful 7-8B models.
- **Software is solved.** [Ollama](https://ollama.com) and LM Studio make running a model a one-line affair. The hardware is the only real decision.

If you've followed our [AI-on-your-TV-box guide](/guides/ai-on-tv-box-2026), this is the next step up: instead of a cloud assistant baked into a streaming box, you run the model yourself.

---
---

## Rule #1: size the memory to the model

Every other spec is secondary to memory capacity. A model has to fit in memory to run at full speed; if it spills over, it falls back to system RAM or disk and slows to a crawl.

Models are almost always run **quantized** — compressed to 4-bit (sometimes 5- or 8-bit) weights with little quality loss. At 4-bit, a rough memory budget looks like this:

| Model size | ~Memory at 4-bit | What it's good for |
|---|---|---|
| 1-3B | 1-2 GB | Fast assistants, summarizing, Raspberry Pi / phones |
| 7-8B | 5-6 GB | The everyday sweet spot — chat, coding help, RAG |
| 13-14B | 9-10 GB | Noticeably smarter reasoning |
| 30-34B | 20-24 GB | Near-frontier quality on one card |
| 70B | 40-48 GB | Best open-weight quality; needs big or dual GPUs |
| 120B+ | 64 GB+ | Unified-memory desktops or multi-GPU only |

Add a few GB on top for the **context window** (the conversation/document the model holds in memory) — long contexts can add several gigabytes. The practical takeaway: **buy the most memory you can**, then worry about speed.

---
---

## NVIDIA GPUs: the default choice

Nearly every local-AI tool is built for NVIDIA's **CUDA** first, so a GeForce card is the path of least resistance. What matters is the VRAM on the box, not the marketing tier:

- **RTX 3060 (12GB)** — the budget hero. Cheap, runs 7-8B models comfortably and 13B models in a pinch.
- **RTX 4060 Ti (16GB)** — low power, 16GB for the money, great in a small always-on box.
- **RTX 3090 / 4090 (24GB)** — 24GB unlocks 30-34B models. The **used 3090** is the best value in local AI; the 4090 is much faster if you can find one.
- **RTX 5090 (32GB GDDR7)** — the current consumer flagship. 32GB and huge bandwidth run 34B models effortlessly and 70B models when quantized hard.
- **RTX 5080 (16GB) / 5070 (12GB)** — fast, but the lower VRAM caps model size; the 5080's 16GB is the floor we'd accept on a new card.

For models bigger than ~34B you either step up to a unified-memory machine or run **two 24GB cards** (e.g. dual 3090s = 48GB), which most tools split across automatically.

---
---

## Apple Silicon: unified memory changes the math

Macs are unexpectedly excellent for local LLMs because Apple Silicon uses **unified memory** shared between the CPU and GPU. A 64GB Mac can load a model that would otherwise need three 24GB graphics cards.

- **Mac mini (M4 / M4 Pro)** — up to 64GB unified memory in a tiny, near-silent, low-power box. A 64GB M4 Pro mini is a superb always-on local-AI server.
- **Mac Studio (M4 Max / M3 Ultra)** — up to 128GB (Max) or **512GB (M3 Ultra)** of unified memory, enough for 70B models and beyond on a single machine.

The trade-off is memory **bandwidth**: a dedicated NVIDIA card pushes tokens faster per gigabyte, so a Mac runs *bigger* models where a same-priced PC runs *faster* ones. For capacity-per-dollar and performance-per-watt, Apple is hard to beat.

---
---

## The new category: 128GB AI desktops and APUs

2025 introduced a class of machine built specifically for running large models at home:

- **NVIDIA DGX Spark (announced as "Project DIGITS")** — a Grace Blackwell desktop with **128GB of unified memory** aimed at developers running large models locally. Expensive, but it runs models that no single consumer GPU can hold.
- **AMD Ryzen AI Max+ ("Strix Halo")** — an APU with up to **128GB of shared memory**, showing up in mini PCs and the Framework Desktop. A lower-cost, lower-power route to mid- and large-size models, with the usual AMD software caveats.
- **Copilot+ laptops with NPUs (40+ TOPS)** — great for small on-device AI features, but today's NPUs and limited RAM make them better for 3-8B assistants than for big models.

---
---

## What we'd actually buy

- **Just trying it out / on a budget:** a **12GB RTX 3060**, or simply your current laptop with [Ollama](https://ollama.com). Run an 8B model and see if local LLMs fit your workflow.
- **Best all-round value:** a **used RTX 3090 (24GB)**. Nothing else runs 34B-class models this well for the price.
- **Quiet, low-power, always-on:** a **Mac mini M4 Pro (64GB)** — a tiny home AI server that sips power.
- **Biggest models at home:** a **Mac Studio (128GB+)** or **NVIDIA DGX Spark**.
- **Tinkerer on a shoestring:** a **Raspberry Pi 5** runs small models surprisingly well — see our [step-by-step local-LLM-on-a-Pi tutorial](/tutorials/run-local-llm-raspberry-pi).

Local LLMs went from research toys to genuinely usable in the last two years, and the only thing standing between you and a private, offline assistant is enough memory to hold the model. Buy for capacity, start with an 8B model, and scale up once you know what you actually need.
