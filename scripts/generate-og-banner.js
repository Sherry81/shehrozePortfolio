/* eslint-disable */
// One-off generator for the social share banner (og:image) — 1200x630.
const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

const AVATAR_URL =
  "https://avatars.githubusercontent.com/u/19214455?u=b28e13271597b69c5eb75f752553c7fe79af6091&v=4";
const OUT_PUBLIC = path.join(__dirname, "..", "public", "og-banner.png");
const OUT_BUILD = path.join(__dirname, "..", "build", "og-banner.png");

const W = 1200;
const H = 630;
const AV = 300; // avatar diameter
const AV_X = 850; // avatar left
const AV_Y = (H - AV) / 2;

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return download(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error("HTTP " + res.statusCode + " for " + url));
        }
        const chunks = [];
        res.on("data", c => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1f1c3a"/>
      <stop offset="55%" stop-color="#2b2660"/>
      <stop offset="100%" stop-color="#6c63ff"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8a7bff"/>
      <stop offset="100%" stop-color="#55d6c2"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- subtle decorative circles -->
  <circle cx="120" cy="540" r="220" fill="#ffffff" opacity="0.04"/>
  <circle cx="1080" cy="80" r="160" fill="#ffffff" opacity="0.05"/>

  <!-- text block -->
  <text x="80" y="250" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff">Syed Muhammad Abid</text>
  <text x="80" y="312" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="600" fill="#8a7bff">Senior Full-Stack Software Engineer</text>

  <rect x="82" y="346" width="60" height="5" rx="2.5" fill="#55d6c2"/>

  <text x="80" y="404" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="400" fill="#c9c5f0">7+ years building enterprise-scale web apps</text>
  <text x="80" y="440" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="400" fill="#c9c5f0">React • Next.js • Node.js • Ruby on Rails • AWS</text>

  <text x="80" y="556" font-family="Segoe UI, Arial, sans-serif" font-size="22" font-weight="600" fill="#ffffff" opacity="0.85">syedmuhammadabid.github.io</text>

  <!-- avatar ring -->
  <circle cx="${AV_X + AV / 2}" cy="${AV_Y + AV / 2}" r="${
  AV / 2 + 10
}" fill="none" stroke="url(#ring)" stroke-width="8"/>
</svg>
`);

const circleMask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${AV}" height="${AV}"><circle cx="${
    AV / 2
  }" cy="${AV / 2}" r="${AV / 2}" fill="#fff"/></svg>`
);

(async () => {
  const avatarRaw = await download(AVATAR_URL);

  const avatarRound = await sharp(avatarRaw)
    .resize(AV, AV, {fit: "cover"})
    .composite([{input: circleMask, blend: "dest-in"}])
    .png()
    .toBuffer();

  const banner = await sharp(background)
    .composite([{input: avatarRound, left: AV_X, top: Math.round(AV_Y)}])
    .png()
    .toBuffer();

  fs.writeFileSync(OUT_PUBLIC, banner);
  console.log("Wrote", OUT_PUBLIC, banner.length, "bytes");

  if (fs.existsSync(path.dirname(OUT_BUILD))) {
    fs.writeFileSync(OUT_BUILD, banner);
    console.log("Wrote", OUT_BUILD);
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
