---
title: "Smart TV Automations with Home Assistant: Movie Mode, Bedtime and More"
description: "Make your TV part of the smart home: connect a Google TV, Android TV, LG or Samsung TV to Home Assistant, then dim the lights when a movie starts, switch the TV off at bedtime, and pause for the doorbell."
publishDate: "2026-10-20"
difficulty: "intermediate"
duration: "45 min"
tags: ["home assistant", "smart home", "automation", "google tv", "android tv"]
---

## What You'll Set Up

Once Home Assistant can see and control your TV, a few automations make movie nights feel effortless:

1. **Movie mode:** the lights dim when something starts playing after dark, and come back up when you pause.
2. **Bedtime:** the TV switches itself off late at night if it's been left on.
3. **Doorbell pause:** playback pauses when someone rings the bell.

You'll need **Home Assistant** running, such as our [Raspberry Pi Home Assistant setup](/tutorials/raspberry-pi-home-assistant), and some smart lights already added.

---

## Step 1: Connect Your TV

Home Assistant connects to most TVs over your home network. Go to **Settings → Devices & services**; supported TVs are often discovered automatically. Otherwise, click **Add Integration** and choose yours:

| Your TV or box | Integration | Notes |
|---|---|---|
| Google TV, Android TV (including Chromecast with Google TV, Google TV Streamer, Shield) | **Android TV Remote**, plus **Google Cast** | Approve the pairing code shown on the TV. Android TV Remote controls power, keys and apps; Google Cast reports what's playing. |
| LG TV (webOS) | **LG webOS TV** | Accept the prompt on the TV. |
| Samsung TV (Tizen) | **Samsung Smart TV** | Accept the prompt on the TV. |
| Fire TV | none of the above | Fire TV doesn't include the service Android TV Remote needs; community integrations exist, but nothing built in. |

**Turning the TV on:** most TVs can be switched off from Home Assistant, but turning on depends on the TV. Google TV devices usually wake through Android TV Remote; LG and Samsung TVs typically need **Wake-on-LAN** enabled in the TV's network settings. Each integration's documentation explains its options.

You now have a **media player** entity for the TV, such as `media_player.living_room_tv`. Open it in Home Assistant and try play, pause and power.

**One thing to know about Google TV:** the Android TV Remote integration can't tell Home Assistant whether something is playing. That's why it's paired with **Google Cast**, whose media player shows `playing` and `paused`, which is what movie mode needs.

---

## Step 2: Movie Mode

First, save your movie lighting as a **scene**: go to **Settings → Automations & scenes → Scenes**, create a scene called "Movie mode", add your living room lights, set them how you like (say, a dim warm glow behind the TV), and save. Make a second scene, "Living room normal", for regular lighting.

Then create an automation (**Automations → Create automation → ⋮ → Edit in YAML**) and adjust the entity names to yours:

```yaml
alias: Movie mode lights
triggers:
  - trigger: state
    entity_id: media_player.living_room_tv_cast
    to: playing
    id: playing
  - trigger: state
    entity_id: media_player.living_room_tv_cast
    from: playing
    id: stopped
conditions:
  - condition: state
    entity_id: sun.sun
    state: below_horizon
actions:
  - choose:
      - conditions:
          - condition: trigger
            id: playing
        sequence:
          - action: scene.turn_on
            target:
              entity_id: scene.movie_mode
            data:
              transition: 3
      - conditions:
          - condition: trigger
            id: stopped
        sequence:
          - action: scene.turn_on
            target:
              entity_id: scene.living_room_normal
            data:
              transition: 2
mode: restart
```

Use the media player that reports playback (the Google Cast one on Google TV; on LG and Samsung TVs, the TV's own media player). Some apps don't report their status; test with the apps you use.

---

## Step 3: Bedtime Switch-Off

```yaml
alias: TV off at bedtime
triggers:
  - trigger: time
    at: "23:30:00"
conditions:
  - condition: not
    conditions:
      - condition: state
        entity_id: media_player.living_room_tv
        state: "off"
actions:
  - action: media_player.turn_off
    target:
      entity_id: media_player.living_room_tv
mode: single
```

Want a warning first? Add a notification to the TV a few minutes earlier, using the pop-up setup from our [doorbell tutorial](/tutorials/ai-doorbell-alerts-on-tv-frigate).

---

## Step 4: Pause When the Doorbell Rings

If your doorbell is in Home Assistant (a doorbell button, or a camera with person detection as in our [AI doorbell tutorial](/tutorials/ai-doorbell-alerts-on-tv-frigate)), pause whatever's playing:

```yaml
alias: Pause TV for the doorbell
triggers:
  - trigger: state
    entity_id: binary_sensor.front_doorbell
    to: "on"
conditions:
  - condition: state
    entity_id: media_player.living_room_tv_cast
    state: playing
actions:
  - action: media_player.media_pause
    target:
      entity_id: media_player.living_room_tv_cast
mode: single
```

Replace `binary_sensor.front_doorbell` with your doorbell's entity. Some streaming apps ignore remote pause commands; it works with most.

---

## More Ideas

- **Good morning:** turn the TV on to the news app at 7am on weekdays, using Android TV Remote's app launching (deep links are the most reliable way, per its documentation).
- **Game mode:** when a console's input is selected, set the lights to a gaming color.
- **Away mode:** if everyone has left home and the TV is still on, turn it off.

---

## Troubleshooting

**The TV shows as "unavailable" when off:** normal for many TVs, which drop off the network in standby. Enable the TV's network standby or Wake-on-LAN setting.

**Movie mode never triggers on Google TV:** you're probably using the Android TV Remote media player, which doesn't report playing. Use the Google Cast media player's entity in the trigger.

**Movie mode does nothing during the day:** that's the condition checking the sun is down; remove it if you want movie mode any time.

**Commands don't reach an app:** some apps (Netflix among them, per the Android TV Remote docs) don't accept remote commands; that's a limit of the app, not your setup.
