---
title: "See Who's at the Door on Your TV: AI Doorbell Alerts with Frigate"
description: "When your doorbell camera spots a person, show their picture on the TV, with no cloud and no subscription. Frigate's local AI detects people, and Home Assistant pops the snapshot up on your Google TV, Android TV or Fire TV."
publishDate: "2026-10-20"
difficulty: "advanced"
duration: "1–2 hours"
tags: ["ai", "home assistant", "frigate", "doorbell", "security camera", "google tv", "fire tv"]
---

## How It Works

1. Your doorbell camera streams video over your home network.
2. **Frigate**, a free, open-source video recorder, watches the stream and uses an AI model to recognize **people** (and ignore cars, trees and cats).
3. When it spots someone, **Home Assistant** sends a pop-up with the snapshot to your TV, while you keep watching.

Everything runs locally: no camera cloud, no monthly fee, and no video leaves your home.

## What You'll Need

- **Home Assistant OS** with some spare capacity, like our [Raspberry Pi Home Assistant setup](/tutorials/raspberry-pi-home-assistant). See the hardware note below.
- **A doorbell or camera with a local RTSP video stream.** Many Reolink, Amcrest and UniFi models offer one. Ring and Nest doorbells don't provide a local stream, so they can't be used with Frigate.
- **A Google TV, Android TV or Fire TV (Fire OS)** device for the pop-ups
- About an hour, plus some tinkering with the camera settings

**A note on hardware:** Frigate's AI detection works best with a dedicated accelerator (such as a Google Coral or an Intel graphics chip). On a Raspberry Pi without one, Frigate falls back to detecting on the CPU, which can manage one doorbell camera at a low resolution but keeps the Pi busy. If you plan several cameras, run Home Assistant and Frigate on an Intel mini PC instead.

---

## Step 1: Find Your Camera's Stream Address

Look up your camera's **RTSP URL** in its manual or app. It looks something like:

```
rtsp://USERNAME:PASSWORD@192.168.1.60:554/STREAM-PATH
```

Most cameras offer a high-resolution main stream and a low-resolution **sub stream**. Use the sub stream for detection; it's much lighter. Give the camera a fixed IP address in your router so the URL never changes. You can test the URL in VLC (**Media → Open Network Stream**).

---

## Step 2: Install MQTT (Mosquitto)

Frigate and Home Assistant talk to each other over MQTT, a messaging service.

1. In Home Assistant, go to **Settings → Apps** (**Add-ons** in older versions), open the store, install **Mosquitto broker** and start it.
2. Go to **Settings → People → Users** (turn on **Advanced mode** in your profile if you don't see Users) and add a user named `frigate` with a strong password. Frigate will use it to log in to MQTT.
3. In **Settings → Devices & services**, add the discovered **MQTT** integration.

---

## Step 3: Install the Frigate App

1. In the app store, open the **⋮ menu → Repositories** and add `https://github.com/blakeblackshear/frigate-hass-addons`.
2. Install **Frigate** from the new repository. Don't start it yet.
3. Frigate reads its settings from `/addon_configs/ccab4aaf_frigate/config.yml`. The easiest way to create it is the **Studio Code Server** app (install it from the app store), which can open that folder:

```yaml
mqtt:
  host: core-mosquitto
  user: frigate
  password: YOUR-MQTT-PASSWORD

cameras:
  doorbell:
    ffmpeg:
      inputs:
        - path: rtsp://USERNAME:PASSWORD@192.168.1.60:554/STREAM-PATH
          roles:
            - detect
    detect:
      width: 640
      height: 480
      fps: 5

objects:
  track:
    - person
```

Use your sub stream's URL and its real resolution for `width` and `height`. The camera name, `doorbell`, is used again in Step 5.

4. Start Frigate and open its web UI from the sidebar. Within a minute you should see the live camera image. Walk past the camera: a box labeled "person" should appear.

---

## Step 4: Connect Frigate to Home Assistant

The Frigate integration isn't built into Home Assistant; it's installed through **HACS**, the community store. If you don't have HACS yet, install it by following the instructions at hacs.xyz.

1. In HACS, search for **Frigate**, install it, and restart Home Assistant.
2. Go to **Settings → Devices & services → Add Integration → Frigate**. For the Frigate app, the address is `http://ccab4aaf-frigate:5000`.

You now have a camera entity and sensors for your doorbell, and Frigate's notification images are available through Home Assistant.

---

## Step 5: Set Up Pop-ups on the TV

1. On the TV, install **Notifications for Android TV** (Google Play) or **Notifications for Fire TV** (Amazon Appstore). Open it and allow the permissions it asks for (**notification access** and **display over other apps**).
2. In Home Assistant, go to **Settings → Devices & services → Add Integration** and add **Notifications for Android TV / Fire TV**, following the steps. Note the notify action it creates, such as `notify.living_room_tv`.
3. Test it in **Developer tools → Actions** with `notify.living_room_tv` and a message. A pop-up should appear on the TV.

---

## Step 6: The Automation

Go to **Settings → Automations & scenes → Create automation → ⋮ → Edit in YAML**, paste this, and change the TV's notify action and Home Assistant's IP address to yours:

```yaml
alias: Doorbell person on TV
triggers:
  - trigger: mqtt
    topic: frigate/reviews
    payload: alert
    value_template: "{{ value_json['after']['severity'] }}"
conditions:
  - condition: template
    value_template: >-
      {{ trigger.payload_json['type'] == 'new'
         and trigger.payload_json['after']['camera'] == 'doorbell'
         and 'person' in trigger.payload_json['after']['data']['objects'] }}
actions:
  - action: notify.living_room_tv
    data:
      message: "Someone's at the front door"
      data:
        duration: 15
        position: top-right
        fontsize: large
        image:
          url: >-
            http://192.168.1.10:8123/api/frigate/notifications/{{ trigger.payload_json['after']['data']['detections'][0] }}/thumbnail.jpg
mode: single
```

What it does: Frigate posts each new **alert** (by default, alerts are for people and cars) to MQTT; the condition keeps only new alerts from the `doorbell` camera that include a person; the action shows a 15-second pop-up with Frigate's snapshot in the top-right corner.

Save it, and walk up to your door.

---

## Make It Better

- **Draw a zone** in Frigate around your path or porch, so people walking along the street don't trigger it (Frigate's docs explain zones and requiring them for alerts).
- **Also send it to phones:** the Frigate docs link a ready-made blueprint for phone notifications that pairs well with the TV pop-up.
- **Pause the TV:** add a second action that pauses your media player, so you don't miss the scene while answering the door.

---

## Troubleshooting

**No box around people in Frigate:** check the `detect` resolution matches the stream, and that the person is reasonably large in the frame. Frigate's logs (in the app's **Log** tab) show stream errors.

**The automation never runs:** in **Settings → Devices & services → MQTT → Configure**, listen to the topic `frigate/reviews` and walk past the camera. If nothing arrives, Frigate isn't connected to MQTT; check the user and password in Frigate's `config.yml`.

**The pop-up appears without a picture:** the TV must be able to reach Home Assistant's address; use its IP address rather than `homeassistant.local`.

**The Pi struggles:** lower `fps` to 3, use a smaller sub stream, or move to hardware with a detection accelerator.
