import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), 'src', 'content');

const data = {
  reviews: {
    'nvidia-shield-tv-pro-2025': [
      ['Is the NVIDIA Shield TV Pro still worth it in 2026?', 'Yes, if you want the most powerful Android TV box. It still gets regular updates, runs apps the smoothest, adds AI upscaling, and can host Plex — though at $199 it is overkill if you only stream Netflix and YouTube.'],
      ['Can the Shield TV Pro run a Plex Media Server?', 'Yes. The Pro model can host Plex Media Server directly and hardware-transcode multiple streams, which is its standout feature versus cheaper boxes.'],
      ['Does the Shield support Dolby Vision and Dolby Atmos?', 'Yes — it outputs Dolby Vision HDR and passes through Dolby Atmos and DTS-X audio to a compatible TV or receiver.'],
      ['How long will the Shield keep getting updates?', 'NVIDIA has supported the Shield with software updates since 2019, far longer than any competitor, and continues to release them — a big reason it stays relevant.'],
    ],
    'apple-tv-4k-3rd-gen': [
      ['Is the Apple TV 4K worth it?', 'For Apple users, yes. It has the cleanest ad-free interface, the fastest chip, AirPlay, and deep HomeKit integration. Non-Apple households can save with a cheaper box.'],
      ['Do I need the Ethernet (128GB) model?', 'Only if you want a wired connection, Thread for HomeKit, or more local storage. The 64GB Wi-Fi model streams identically for most people.'],
      ['Does the Apple TV 4K show ads?', 'No. tvOS has no banner ads or sponsored rows on the home screen, which is a key reason people pick it over Fire TV or Google TV.'],
      ['Does Apple TV 4K work without an iPhone?', 'Yes. You can sign in with any Apple Account and use it as a standalone streamer, though features like AirPlay and HomeKit are better with other Apple devices.'],
    ],
    'fire-tv-stick-4k-max-2024': [
      ['Is the Fire TV Stick 4K Max worth it?', 'Yes for the price — it is fast, supports 4K Dolby Vision and Atmos, and adds Wi-Fi 6E. The main trade-off is Amazon’s ad-heavy interface.'],
      ['Does the Fire TV Stick 4K Max have a lot of ads?', 'The Fire OS home screen features large sponsored banners and rows. It is the busiest interface of the major platforms, though the hardware itself is excellent.'],
      ['What is the difference between the 4K and 4K Max?', 'The 4K Max has a faster processor, more RAM and storage, and Wi-Fi 6E. The standard 4K is cheaper and fine for casual use; the Max feels snappier long-term.'],
      ['Does it support Wi-Fi 6E?', 'Yes — the 2024 4K Max is the only mainstream streaming stick with Wi-Fi 6E, which helps on congested networks if you have a 6E router.'],
    ],
    'roku-ultra-2024': [
      ['Is the Roku Ultra worth it over the cheaper stick?', 'The Ultra adds Ethernet, a USB port, a better remote with a headphone jack and lost-remote finder, and faster performance. If you want wired networking or local media it is worth the premium; otherwise the stick is enough.'],
      ['Does the Roku Ultra have ads?', 'Roku’s home screen shows a large ad tile and sponsored rows, but the interface is otherwise clean and uncluttered compared to Fire TV.'],
      ['Does the Roku Ultra support Dolby Vision and Atmos?', 'Yes — it outputs Dolby Vision HDR and passes through Dolby Atmos audio.'],
      ['Does the Roku Ultra have an Ethernet port?', 'Yes. It is one of the few streaming devices at its price with a built-in Ethernet port for a wired, buffer-free connection.'],
    ],
  },
  guides: {
    'best-tv-box-2025': [
      ['What is the best TV box in 2026?', 'For most people the Fire TV Stick 4K Max offers the best value, the NVIDIA Shield TV Pro is the best high-end pick, and the Apple TV 4K is best for Apple households. See our ranked picks above.'],
      ['Is a more expensive streaming box worth it?', 'Sometimes. Premium boxes add speed, longer software support, better remotes, and features like Plex serving or AI upscaling. If you only stream Netflix and YouTube, a $40–50 device is plenty.'],
      ['What is the best budget streaming device?', 'The Fire TV Stick 4K and Roku Streaming Stick 4K both deliver 4K Dolby Vision for around $40–50. The Chromecast with Google TV is a great budget Android pick.'],
      ['Android TV, Roku, or Fire TV — which is best?', 'Roku is the most neutral and ad-light, Fire TV has the best hardware value, and Android/Google TV is best for Google users and app flexibility. The right one depends on your ecosystem.'],
    ],
    'android-tv-vs-fire-tv-vs-roku': [
      ['What is the difference between Android TV, Fire TV, and Roku?', 'Android/Google TV is Google’s flexible, app-rich platform; Fire TV is Amazon’s Android-based system with heavy Alexa and store integration; Roku is a simple, neutral platform that does not favor any ecosystem.'],
      ['Which streaming platform has the most apps?', 'Android/Google TV has the largest app library via the Play Store, including sideloading. Roku and Fire TV both cover all mainstream services but are more curated.'],
      ['Which platform has the fewest ads?', 'Roku and especially Apple’s tvOS are the cleanest. Fire TV shows the most sponsored content; Google TV sits in between.'],
      ['Can I use Google Assistant or Alexa?', 'Google/Android TV uses Google Assistant, Fire TV uses Alexa, and Roku has its own voice search plus works with both assistants through smart speakers.'],
    ],
    'best-tv-box-for-plex': [
      ['What is the best streaming box for Plex?', 'The NVIDIA Shield TV Pro is the best Plex device — it can both play Plex and host a Plex Media Server with hardware transcoding. For playback only, the Apple TV 4K and Shield are top picks.'],
      ['Can I run a Plex server on a streaming box?', 'The NVIDIA Shield TV Pro can run Plex Media Server directly. Most other streaming boxes can only act as Plex players, not servers.'],
      ['Does the Shield transcode Plex streams?', 'Yes — the Shield TV Pro supports hardware transcoding, letting it convert video on the fly for remote streaming or incompatible clients.'],
      ['Do I need a Plex Pass?', 'Not for basic playback. A Plex Pass unlocks hardware transcoding, offline downloads, and live TV/DVR, and is recommended if you host a server on the Shield.'],
    ],
    'streaming-stick-vs-box': [
      ['Should I buy a streaming stick or a box?', 'Get a stick if you want the cheapest, tidiest 4K streaming that hides behind the TV. Choose a box if you want Ethernet, USB, more power, or features like Plex serving and gaming.'],
      ['Are streaming boxes faster than sticks?', 'Generally yes. Boxes have more room for better processors, RAM, and cooling, so high-end boxes like the Shield and Apple TV outperform sticks — though top sticks are plenty fast for streaming.'],
      ['Do streaming sticks support 4K and Dolby Vision?', 'Yes. Modern 4K sticks from Roku, Amazon, and Google all support 4K HDR with Dolby Vision and Atmos passthrough.'],
      ['Which lasts longer, a stick or a box?', 'Boxes tend to stay responsive longer thanks to more RAM and better cooling, and premium boxes get software updates for more years. Sticks can feel sluggish sooner under heavy use.'],
    ],
  },
};

const q = (s) => '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
function faqYaml(items, eol) {
  const lines = ['faq:'];
  for (const [question, answer] of items) {
    lines.push('  - question: ' + q(question));
    lines.push('    answer: ' + q(answer));
  }
  return lines.join(eol);
}

let n = 0;
for (const [col, map] of Object.entries(data)) {
  for (const [slug, items] of Object.entries(map)) {
    const path = join(root, col, slug + '.md');
    let raw = readFileSync(path, 'utf8');
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    if (/^faq:/m.test(raw)) { console.log('skip ' + col + '/' + slug + ' (has faq)'); continue; }
    const m = raw.match(/^(---\r?\n[\s\S]*?\r?\n)(---)/);
    if (!m) { console.log('!! ' + col + '/' + slug + ': no frontmatter'); continue; }
    raw = raw.replace(m[0], m[1] + faqYaml(items, eol) + eol + m[2]);
    writeFileSync(path, raw);
    console.log('OK ' + col + '/' + slug);
    n++;
  }
}
console.log('\nInjected FAQ into ' + n + ' file(s).');
