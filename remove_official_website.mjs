import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Remove import
content = content.replace(/import OfficialWebsite from '\.\/OfficialWebsite';\n?/g, '');

// Remove the block
content = content.replace(/<React\.Suspense fallback=\{<div className="full-center" style=\{\{ height: '100vh' \}\}>Loading\.\.\.<\/div>\}>\s*<OfficialWebsite\s*currentPath=\{currentPath\}\s*onNavigate=\{\(path\) => setCurrentPath\(path\)\}\s*\/>\s*<\/React\.Suspense>/g, '');

fs.writeFileSync(filePath, content);
console.log('Done');
