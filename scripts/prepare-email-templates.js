#!/usr/bin/env node
/**
 * Script to prepare email templates for production deployment
 * This script reads HBS template files and outputs them as environment variables
 * or as inline content that can be used in production environments
 */

const fs = require("fs");
const path = require("path");

function readTemplate(templateName) {
  const templatePath = path.join(
    __dirname,
    "..",
    "src",
    "lib",
    "templates",
    `${templateName}.hbs`
  );

  if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    process.exit(1);
  }

  return fs.readFileSync(templatePath, "utf8");
}

function generateEnvVar(templateName) {
  const template = readTemplate(templateName);
  const envVarName = `EMAIL_TEMPLATE_${templateName
    .toUpperCase()
    .replace("-", "_")}`;

  // Escape the template content for environment variable
  const escapedTemplate = template
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

  return {
    name: envVarName,
    value: escapedTemplate,
  };
}

function generateInlineCode(templateName) {
  const template = readTemplate(templateName);

  // Escape the template content for JavaScript string
  const escapedTemplate = template
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  return `const ${templateName.replace(
    "-",
    "_"
  )}_template = \`${escapedTemplate}\`;`;
}

// Main execution
const templateName = process.argv[2] || "waitlist-welcome";
const outputFormat = process.argv[3] || "env"; // 'env' or 'inline'

try {
  if (outputFormat === "env") {
    const envVar = generateEnvVar(templateName);
    console.log(
      `# Add this to your .env file or deployment environment variables:`
    );
    console.log(`${envVar.name}="${envVar.value}"`);
    console.log(`\n# Or for shell export:`);
    console.log(`export ${envVar.name}="${envVar.value}"`);
  } else if (outputFormat === "inline") {
    const inlineCode = generateInlineCode(templateName);
    console.log("// Add this to your email service:");
    console.log(inlineCode);
  } else {
    console.error('Invalid output format. Use "env" or "inline"');
    process.exit(1);
  }
} catch (error) {
  console.error("Error processing template:", error.message);
  process.exit(1);
}
