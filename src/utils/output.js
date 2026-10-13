import { writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function saveJson(records, sourceUrl) {
    const url = new URL(sourceUrl);

    const fileName = (
        `${url.hostname}${url.pathname}${url.search}`
    )
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase() + '.json';

    const dataDirectory = resolve('data');

    await mkdir(dataDirectory, { recursive: true });

    const outputPath = resolve(dataDirectory, fileName);

    await writeFile(
        outputPath,
        JSON.stringify(records, null, 2),
        'utf8'
    );

    console.log(
        `Saved ${records.length} records to ${outputPath}`
    );

    return outputPath;
}