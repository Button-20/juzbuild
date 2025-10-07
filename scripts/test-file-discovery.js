const fs = require("fs/promises");
const path = require("path");

async function testFilePushing() {
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "testsite1759843644387"
  );

  console.log("🔍 Testing file discovery for template pushing...");
  console.log(`Template path: ${templatePath}`);

  async function getAllTemplateFiles(templatePath) {
    const files = [];

    async function scanDirectory(currentPath, basePath) {
      try {
        const items = await fs.readdir(currentPath, { withFileTypes: true });

        for (const item of items) {
          const fullPath = path.join(currentPath, item.name);
          const relativePath = path
            .relative(basePath, fullPath)
            .replace(/\\/g, "/");

          if (item.isDirectory()) {
            // Skip node_modules and .git directories
            if (
              item.name !== "node_modules" &&
              item.name !== ".git" &&
              !item.name.startsWith(".")
            ) {
              await scanDirectory(fullPath, basePath);
            }
          } else {
            // Skip certain file types
            if (!item.name.endsWith(".log") && !item.name.startsWith(".")) {
              files.push({ fullPath, relativePath });
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning directory ${currentPath}:`, error);
      }
    }

    await scanDirectory(templatePath, templatePath);
    return files;
  }

  try {
    const files = await getAllTemplateFiles(templatePath);

    console.log(`\n📁 Found ${files.length} files to push:`);
    files.forEach((file) => {
      console.log(`  - ${file.relativePath} (${file.fullPath})`);
    });

    // Test reading each file
    console.log("\n📖 Testing file reading:");
    for (const file of files) {
      try {
        const content = await fs.readFile(file.fullPath, "utf8");
        console.log(`  ✅ ${file.relativePath} - ${content.length} bytes`);
      } catch (error) {
        console.log(
          `  ❌ ${file.relativePath} - Error reading: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testFilePushing();
