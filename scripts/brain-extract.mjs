import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

async function main() {
  const [
    app, api, p11api, p12api, p11js, p12js,
    typesCore, typesP11, typesP12,
    testCore, testP11, testP11x, testP12,
    pkgText, indexHtml, buildScript, serveScript
  ] = await Promise.all([
    read("src/app.js"), read("src/api.js"), read("src/phase11-api.js"), read("src/phase12-api.js"),
    read("src/phase11.js"), read("src/phase12.js"),
    read("src/types.d.ts"), read("src/phase11-types.d.ts"), read("src/phase12-types.d.ts"),
    read("test/api.test.mjs"), read("test/phase11.test.mjs"), read("test/phase11-extra.test.mjs"), read("test/phase12.test.mjs"),
    read("package.json"), read("index.html"), read("scripts/build.mjs"), read("scripts/serve.mjs")
  ]);

  const lineCount = (source) => source.split(/\r?\n/).length;
  const typeNames = (source) => [...source.matchAll(/^export (?:interface|type) ([A-Za-z0-9_]+)/gm)].map((match) => match[1]);
  const countTests = (source) => (source.match(/\btest\(/g) || []).length;

  const facts = {
    generatedAt: new Date().toISOString(),
    product: JSON.parse(pkgText),
    files: {
      "src/api.js": { lines: lineCount(api), bytes: Buffer.byteLength(api) },
      "src/app.js": { lines: lineCount(app), bytes: Buffer.byteLength(app) },
      "src/phase11-api.js": { lines: lineCount(p11api), bytes: Buffer.byteLength(p11api) },
      "src/phase11.js": { lines: lineCount(p11js), bytes: Buffer.byteLength(p11js) },
      "src/phase12-api.js": { lines: lineCount(p12api), bytes: Buffer.byteLength(p12api) },
      "src/phase12.js": { lines: lineCount(p12js), bytes: Buffer.byteLength(p12js) },
      "src/types.d.ts": { lines: lineCount(typesCore), exports: typeNames(typesCore).length },
      "src/phase11-types.d.ts": { lines: lineCount(typesP11), exports: typeNames(typesP11).length },
      "src/phase12-types.d.ts": { lines: lineCount(typesP12), exports: typeNames(typesP12).length },
      "test/api.test.mjs": { lines: lineCount(testCore), tests: countTests(testCore) },
      "test/phase11.test.mjs": { lines: lineCount(testP11), tests: countTests(testP11) },
      "test/phase11-extra.test.mjs": { lines: lineCount(testP11x), tests: countTests(testP11x) },
      "test/phase12.test.mjs": { lines: lineCount(testP12), tests: countTests(testP12) }
    },
    typeNames: {
      "src/types.d.ts": typeNames(typesCore),
      "src/phase11-types.d.ts": typeNames(typesP11),
      "src/phase12-types.d.ts": typeNames(typesP12)
    },
    dbKeys: (() => {
      const lines = api.split(/\r?\n/);
      const start = lines.findIndex((line) => line.includes("const db = {"));
      let end = -1;
      for (let i = start + 1; i < lines.length; i += 1) {
        if (/^\};?\s*$/.test(lines[i])) { end = i; break; }
      }
      const keys = [];
      for (let i = start + 1; i < end; i += 1) {
        const match = lines[i].match(/^ {2}([A-Za-z0-9_]+):/);
        if (match) keys.push(match[1]);
      }
      return keys;
    })(),
    scripts: JSON.parse(pkgText).scripts,
    buildAssets: [...buildScript.matchAll(/"(src\/[^"]+|index\.html)"/g)].map((match) => match[1]),
    indexLoads: [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)].map((match) => match[1]),
    serveTargets: /dist\//.test(serveScript) ? "dist/" : "src/"
  };

  await mkdir(new URL("brain/", root), { recursive: true });
  await writeFile(new URL("brain/facts.json", root), `${JSON.stringify(facts, null, 2)}\n`);
  console.log(`Wrote brain/facts.json (${facts.dbKeys.length} db keys, ${Object.values(facts.files).reduce((sum, file) => sum + (file.tests || 0), 0)} tests)`);
}

await main();
