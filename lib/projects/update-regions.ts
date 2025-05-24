import * as fs from 'fs';
import * as path from 'path';

// Read the Projects.ts file
const filePath = path.join(__dirname, 'Projects.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of '0' in the region field with ''
const updatedContent = content.replace(
  /new ProjectInfo\(\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'\d{1,2}'/g,
  (match) => match.replace(/'(\d{1,2})'/, "'','$1'")
);

// Write the updated content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('Successfully updated all region values to empty strings'); 