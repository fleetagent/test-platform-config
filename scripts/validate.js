const Ajv = require("ajv");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");

const ajv = new Ajv();

const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../schemas/service-manifest.json"), "utf-8")
);
const validate = ajv.compile(schema);

const envsDir = path.join(__dirname, "../environments");
const files = fs.readdirSync(envsDir).filter((f) => f.endsWith(".yml"));

let errors = 0;
for (const file of files) {
  const content = yaml.load(fs.readFileSync(path.join(envsDir, file), "utf-8"));
  console.log(`Validating ${file}...`);
  if (!content.services) {
    console.log(`  WARN: no services defined in ${file}`);
    continue;
  }
  for (const [name, svc] of Object.entries(content.services)) {
    if (!svc.tier) {
      console.log(`  ERROR: ${name} missing tier`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.log(`\n${errors} validation error(s) found`);
  process.exit(1);
} else {
  console.log("\nAll configurations valid");
}
