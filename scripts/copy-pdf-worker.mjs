// pdfjs-dist requires GlobalWorkerOptions.workerSrc to point to a real,
// browser-servable file — it no longer supports running workerless (see
// features/resume-import/pdf/extractPdfResume.ts). Vendoring the worker
// build into public/ (regenerated on every install, not committed) is the
// standard reliable way to serve it under Next.js regardless of bundler.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

const source = join(
  projectRoot,
  "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs",
);
const destinationDir = join(projectRoot, "public");
const destination = join(destinationDir, "pdf.worker.min.mjs");

if (!existsSync(source)) {
  console.warn(`[copy-pdf-worker] source not found, skipping: ${source}`);
  process.exit(0);
}

mkdirSync(destinationDir, { recursive: true });
copyFileSync(source, destination);
console.log(`[copy-pdf-worker] copied to ${destination}`);
