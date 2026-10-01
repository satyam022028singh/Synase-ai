import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(new URL("../src/", import.meta.url), new URL("../dist/src/", import.meta.url), { recursive: true });
await cp(new URL("../index.html", import.meta.url), new URL("../dist/index.html", import.meta.url));
await cp(new URL("../landing.html", import.meta.url), new URL("../dist/landing.html", import.meta.url));
await cp(new URL("../app.html", import.meta.url), new URL("../dist/app.html", import.meta.url));
try {
  await cp(new URL("../LOGO/", import.meta.url), new URL("../dist/LOGO/", import.meta.url), { recursive: true });
  await cp(new URL("../src/assets/favicon.svg", import.meta.url), new URL("../dist/favicon.svg", import.meta.url));
} catch {}

const files = [
  "index.html", "landing.html", "app.html",
  "src/styles.css", "src/app.js", "src/api.js", "src/types.d.ts",
  "src/phase11.css", "src/phase11.js", "src/phase11-api.js", "src/phase11-types.d.ts",
  "src/phase12.css", "src/phase12.js", "src/phase12-api.js", "src/phase12-types.d.ts"
];
const manifest = {};
for (const file of files) {
  const body = await readFile(new URL(`../dist/${file}`, import.meta.url));
  manifest[file] = { bytes: body.byteLength, sha256: createHash("sha256").update(body).digest("hex") };
}
await writeFile(new URL("../dist/build-manifest.json", import.meta.url), JSON.stringify({
  product: "SYNASE AI",
  phases: ["Phase 0", "Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7", "Phase 8", "Phase 9", "Phase 10", "Phase 11", "Phase 12"],
  generatedAt: new Date().toISOString(), files: manifest
}, null, 2));
console.log(`Built SYNASE AI frontend (${Object.keys(manifest).length} assets) → dist/`);
