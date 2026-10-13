/**  filteres an object from multiple json files and 
    extracts a specific key to create comma separated output
*/
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const args = process.argv.slice(2);

if (args.length === 0) {
    throw new Error('Please provide one or more JSON file names from the data folder.');
}

const dataDirectory = new URL('../data/', import.meta.url);

const listingUrls = [];

for (const fileName of args) {
    const filePath = new URL(fileName, dataDirectory);
    const content = await readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    const records = Array.isArray(data) ? data : [data];

    for (const record of records) {
        if (record.listingUrl != null) {
            listingUrls.push(record.listingUrl);
        }
    }
}

// Timestamp in a filename-safe format.
const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

const outputFileName = `filteredlinks-${timestamp}.json`;
const outputPath = new URL(outputFileName, dataDirectory);

await mkdir(dataDirectory, { recursive: true });

await writeFile(
    outputPath,
    JSON.stringify(listingUrls, null, 2),
    'utf8'
);

console.log(
    `Saved ${listingUrls.length} listing URL(s) to data/${outputFileName}`
);