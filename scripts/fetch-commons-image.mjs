/**
 * Download one Wikimedia Commons file into src/assets/ with a sidecar .json credit
 * ({ subject, author, license, licenseUrl, page }) that src/lib/imageCredits.ts requires
 * and /credits lists. Used for tutorial images; any freely licensed Commons file works.
 *
 * Saves a 1600px-wide rendition (or the original if smaller), keeping the file's format.
 * Commons only hosts free licenses, but check the license printed here suits the page.
 *
 * Usage:
 *   node scripts/fetch-commons-image.mjs "File:Raspberry Pi 5.jpg" src/assets/tutorials/raspberry-pi-5-getting-started "Raspberry Pi 5"
 *   (args: Commons file title, destination path without extension, what the image shows)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, extname } from 'node:path';

const UA = 'FullTVBoxBot/1.0 (+https://fulltvbox.com)';
const WIDTH = 1600;
const strip = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function main() {
  const [file, dest, subject] = process.argv.slice(2);
  if (!file?.startsWith('File:') || !dest || !subject) {
    throw new Error('Usage: fetch-commons-image.mjs "File:<name>" <dest without extension> "<subject>"');
  }
  const params = new URLSearchParams({
    action: 'query', format: 'json', prop: 'imageinfo', titles: file,
    iiprop: 'url|size|extmetadata', iiurlwidth: String(WIDTH),
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
  const page = Object.values((await res.json()).query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) throw new Error(`${file}: not found on Commons`);
  const meta = info.extmetadata;

  const url = info.width > WIDTH ? info.thumburl : info.url;
  const img = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!img.ok) throw new Error(`${file}: HTTP ${img.status}`);
  const ext = extname(new URL(info.url).pathname).toLowerCase().replace('.jpeg', '.jpg');

  const credit = {
    subject,
    author: strip(meta.Artist?.value).replace(/^Unknown author(Unknown author)?$/, '') || 'Unknown author',
    license: meta.LicenseShortName?.value ?? 'see source',
    licenseUrl: meta.LicenseUrl?.value ?? null,
    page: info.descriptionurl,
  };
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(`${dest}${ext}`, Buffer.from(await img.arrayBuffer()));
  writeFileSync(`${dest}.json`, JSON.stringify(credit, null, 2) + '\n');
  console.log(`${dest}${ext}  ${credit.license} · ${credit.author}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
