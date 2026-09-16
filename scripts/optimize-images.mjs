import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, "public", "assets");
const SRC_DIR = path.join(ROOT, "src");

const SOURCE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
]);

const CODE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
]);

const conversions = new Map();

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true,
  })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
}

async function optimizeImages() {
  console.log("\nOptimizing images...\n");

  const files = walk(ASSETS_DIR);

  for (const file of files) {
    const extension = path.extname(file).toLowerCase();

    if (!SOURCE_EXTENSIONS.has(extension)) {
      continue;
    }

    const webpFile =
      file.slice(0, -extension.length) + ".webp";

    try {
      const originalSize = fs.statSync(file).size;

      await sharp(file)
        .rotate()
        .resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
          effort: 5,
        })
        .toFile(webpFile);

      const optimizedSize =
        fs.statSync(webpFile).size;

      /*
       * Only switch the website to WebP when
       * the optimized file is actually smaller.
       */
      if (optimizedSize >= originalSize) {
        fs.unlinkSync(webpFile);

        console.log(
          `SKIP ${path.relative(ROOT, file)}`
        );

        continue;
      }

      const originalPublicPath =
        "/" +
        path
          .relative(path.join(ROOT, "public"), file)
          .split(path.sep)
          .join("/");

      const webpPublicPath =
        "/" +
        path
          .relative(
            path.join(ROOT, "public"),
            webpFile
          )
          .split(path.sep)
          .join("/");

      conversions.set(
        originalPublicPath,
        webpPublicPath
      );

      const saving = Math.round(
        (1 - optimizedSize / originalSize) * 100
      );

      console.log(
        `✓ ${originalPublicPath}`
      );

      console.log(
        `  ${formatSize(originalSize)} -> ` +
        `${formatSize(optimizedSize)} ` +
        `(${saving}% smaller)`
      );
    } catch (error) {
      console.error(
        `✗ ${path.relative(ROOT, file)}`
      );

      console.error(`  ${error.message}`);
    }
  }
}

function updateSourceFiles() {
  console.log("\nUpdating website references...\n");

  const files = walk(SRC_DIR);

  let changedFiles = 0;
  let changedReferences = 0;

  for (const file of files) {
    const extension = path.extname(file).toLowerCase();

    if (!CODE_EXTENSIONS.has(extension)) {
      continue;
    }

    const original = fs.readFileSync(file, "utf8");

    let updated = original;
    let fileChanges = 0;

    for (const [oldPath, newPath] of conversions) {
      /*
       * Replace only exact public asset paths.
       * This avoids blindly changing unrelated text.
       */
      if (updated.includes(oldPath)) {
        const occurrences =
          updated.split(oldPath).length - 1;

        updated = updated.split(oldPath).join(newPath);

        fileChanges += occurrences;
      }
    }

    if (updated !== original) {
      fs.writeFileSync(file, updated, "utf8");

      changedFiles++;
      changedReferences += fileChanges;

      console.log(
        `✓ ${path.relative(ROOT, file)}`
      );
    }
  }

  console.log("\nSource update complete.");
  console.log(`Files changed: ${changedFiles}`);
  console.log(
    `References changed: ${changedReferences}`
  );
}

async function main() {
  console.log(
    "\nCONTINENTAL FOUNDERS IMAGE OPTIMIZER"
  );

  console.log(
    "===================================="
  );

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(
      "\npublic/assets was not found."
    );

    process.exit(1);
  }

  await optimizeImages();

  console.log(
    `\nSuccessful conversions: ${conversions.size}`
  );

  if (conversions.size === 0) {
    console.log(
      "Nothing needs to be changed."
    );

    return;
  }

  updateSourceFiles();

  console.log(
    "\n===================================="
  );

  console.log(
    "Original JPG/PNG files were NOT deleted."
  );

  console.log(
    "Run npm run dev and inspect the website."
  );

  console.log(
    "====================================\n"
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});