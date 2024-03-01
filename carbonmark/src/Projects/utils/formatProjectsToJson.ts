import { readFileSync, writeFileSync } from 'fs';

function readEvaluateAndSaveJSON(inputFilePath: string, outputFilePath: string) {

  const content = readFileSync(inputFilePath, 'utf8');


  const data = eval('(' + content + ')');


  const jsonContent = JSON.stringify(data, null, 2);


  writeFileSync(outputFilePath, jsonContent, 'utf8');

  console.log(`Converted JSON has been saved to ${outputFilePath}`);
}

// run from carbonmark/ with yarn formatJson
const inputFilePath = 'src//Projects/Projects.ts'; 
const outputFilePath = '../CorrectedProjectsIPFS.json';


readEvaluateAndSaveJSON(inputFilePath, outputFilePath);
