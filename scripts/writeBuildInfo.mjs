import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const outFile = path.resolve(process.cwd(), "src/build-info.ts");
const date = new Date().toISOString();

let sha = "unknown";
try {
    sha = execSync("git rev-parse HEAD").toString().trim();
} catch { }

fs.writeFileSync(
    outFile,
    `export const TRIPKIT_REACT_BUILD_SHA = ${JSON.stringify(sha)} as const;\n` +
    `export const TRIPKIT_REACT_BUILD_DATE = ${JSON.stringify(date)} as const;\n`
);

console.log("[tripkit-react] build sha =", sha);
console.log("[tripkit-react] build date =", date);