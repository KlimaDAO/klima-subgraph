import { readFileSync, writeFileSync } from 'fs';

function readEvaluateAndSaveJSON(inputFilePath: string, outputFilePath: string) {

  const content = readFileSync(inputFilePath, 'utf8');


  const data = eval('(' + content + ')');


  const jsonContent = JSON.stringify(data, null, 2);


  writeFileSync(outputFilePath, jsonContent, 'utf8');

  console.log(`Converted JSON has been saved to ${outputFilePath}`);
}

// Define the path to your existing project file and the output JSON file
const inputFilePath = '../Projects.ts'; // Adjust this path as needed
const outputFilePath = '../CorrectedProjectsIPFS.json';

// Execute the function
readEvaluateAndSaveJSON(inputFilePath, outputFilePath);
