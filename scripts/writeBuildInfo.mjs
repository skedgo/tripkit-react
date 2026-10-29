import fs from "node:fs";
import path from "node:path";

const outFile = path.resolve(process.cwd(), "src/build-info.ts");
const date = new Date().toISOString();

function findUp(startDir, filename) {
    let dir = startDir;
    while (true) {
        const candidate = path.join(dir, filename);
        if (fs.existsSync(candidate)) return candidate;

        const parent = path.dirname(dir);
        if (parent === dir) return null; // reached filesystem root
        dir = parent;
    }
}

function getShaForThisInstall() {
    // Find the consumer’s lockfile by walking up from node_modules/tripkit-react
    const lockPath = findUp(process.cwd(), "package-lock.json");
    if (!lockPath) return "unknown";

    const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));

    // npm lockfile v2+: uses "packages"
    const pkg = lock?.packages?.["node_modules/tripkit-react"];
    if (pkg?.resolved) return pkg.resolved.split("#")[1] || "unknown";

    // older lockfile fallback
    const dep = lock?.dependencies?.["tripkit-react"];
    if (dep?.resolved) return dep.resolved.split("#")[1] || "unknown";

    return "unknown";
}

const sha = getShaForThisInstall();

fs.writeFileSync(
    outFile,
    `export const TRIPKIT_REACT_BUILD_SHA = ${JSON.stringify(sha)} as const;\n` +
    `export const TRIPKIT_REACT_BUILD_DATE = ${JSON.stringify(date)} as const;\n`
);

console.log("[tripkit-react] build sha =", sha);
console.log("[tripkit-react] build date =", date);
