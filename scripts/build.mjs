import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const dist = new URL("../dist/", import.meta.url);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(new URL("../src/", import.meta.url), new URL("../dist/src/", import.meta.url), { recursive: true });
await cp(new URL("../index.html", import.meta.url), new URL("../dist/index.html", import.meta.url));

const files = ["index.html", "src/styles.css", "src/app.js", "src/api.js", "src/types.d.ts"];
const manifest = {};
for (const file of files) {
  const body = await readFile(new URL(`../dist/${file}`, import.meta.url));
  manifest[file] = {
    bytes: body.byteLength,
    sha256: createHash("sha256").update(body).digest("hex")
  };
}
await writeFile(new URL("../dist/build-manifest.json", import.meta.url), JSON.stringify({
  product: "SYNASE AI",
  phases: ["Phase 0", "Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5", "Phase 6", "Phase 7"],
  generatedAt: new Date().toISOString(),
  files: manifest
}, null, 2));
console.log(`Built SYNASE AI frontend (${Object.keys(manifest).length} assets) → dist/`);