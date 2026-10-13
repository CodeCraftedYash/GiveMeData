//combines multiple json files and filters them

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const args = process.argv.slice(2);

if (args.length < 2) {
    throw new Error(
        'Usage: node src/mergeJson.js <keyName> <file1.json> <file2.json> ...'
    );
}

const [keyName, ...fileNames] = args;

const dataDirectory = new URL('../data/', import.meta.url);

const allRecords = [];

// Read and combine every input file.
for (const fileName of fileNames) {
    const filePath = new URL(fileName, dataDirectory);
    const content = await readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    const records = Array.isArray(data) ? data : [data];

    allRecords.push(...records);
}

// Remove duplicates based on the given key.
const seen = new Set();
const uniqueRecords = [];
let duplicatesRemoved = 0;

for (const record of allRecords) {
    const keyValue = record?.[keyName];

    if (keyValue == null) {
        // Keep records missing the key (adjust if you want to drop them instead).
        uniqueRecords.push(record);
        continue;
    }

    if (seen.has(keyValue)) {
        duplicatesRemoved++;
        continue;
    }

    seen.add(keyValue);
    uniqueRecords.push(record);
}

// Timestamp in a filename-safe format.
const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

const outputFileName = `combinedData-${timestamp}.json`;
const outputPath = new URL(outputFileName, dataDirectory);

await mkdir(dataDirectory, { recursive: true });

await writeFile(
    outputPath,
    JSON.stringify(uniqueRecords, null, 2),
    'utf8'
);

console.log(`Input files: ${fileNames.length}`);
console.log(`Total records read: ${allRecords.length}`);
console.log(`Duplicates removed on "${keyName}": ${duplicatesRemoved}`);
console.log(`Unique records written: ${uniqueRecords.length}`);
console.log(`Saved to data/${outputFileName}`);