import { ESLint } from "eslint";
import fs from "fs";

async function run() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["src/App.tsx"]);
  
  const unusedVars = results[0].messages.filter(m => m.ruleId === "@typescript-eslint/no-unused-vars");
  
  console.log("Unused vars in App.tsx:");
  unusedVars.forEach(m => {
    console.log(`Line ${m.line}: ${m.message}`);
  });
}

run().catch(console.error);
