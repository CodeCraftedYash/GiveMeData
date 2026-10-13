import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename, extname, join } from 'node:path';

const inputArgument = process.argv[2];

if (!inputArgument) {
    throw new Error(
        'Provide a JSON file. Example: node src/csv-exporter.js data/results.json'
    );
}

const inputPath = resolve(process.cwd(), inputArgument);
const outputPath = join(
    dirname(inputPath),
    `${basename(inputPath, extname(inputPath))}.csv`
);

const records = JSON.parse(await readFile(inputPath, 'utf8'));

if (!Array.isArray(records)) {
    throw new Error('The JSON file must contain an array of records.');
}

function toCell(value) {
    if (value === null || value === undefined) {
        return '';
    }

    if (Array.isArray(value)) {
        value = value.map(item =>
            typeof item === 'object' && item !== null
                ? JSON.stringify(item)
                : String(item ?? '')
        ).join('; ');
    } else if (typeof value === 'object') {
        value = JSON.stringify(value);
    }

    const text = String(value);

    // Escape values containing CSV special characters.
    if (/[",\r\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

const headers = [...new Set(records.flatMap(record => {
    if (
        record === null ||
        typeof record !== 'object' ||
        Array.isArray(record)
    ) {
        throw new Error('Every record must be a JSON object.');
    }

    return Object.keys(record);
}))];

const csvRows = [
    headers.map(toCell).join(','),
    ...records.map(record =>
        headers.map(header => toCell(record[header])).join(',')
    ),
];

await writeFile(outputPath, csvRows.join('\r\n'), 'utf8');

console.log(`Converted ${records.length} records to ${outputPath}`);