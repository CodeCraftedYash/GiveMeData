
import { readFile, writeFile } from 'node:fs/promises';
import { CheerioCrawler, Dataset } from 'crawlee';

import { extractData } from './extractor.js';
import { validateConfig } from './validate.config.js';

const configPath = new URL('../config.json', import.meta.url);

const config = JSON.parse(
    await readFile(configPath, 'utf8')
);

// Validate configuration before starting the crawl.
validateConfig(config.selectors);

if (
    !Array.isArray(config.startUrls) ||
    config.startUrls.length === 0
) {
    throw new Error('config.json must contain at least one start URL.');
}

const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: config.startUrls.length,
    maxConcurrency: 3,

    async requestHandler({ request, $, log }) {
        const result = {
            url: request.loadedUrl,
            records: extractData(
                $,
                config.selectors,
                config.itemSelector
            ),
        };

        await Dataset.pushData(result);

        console.log('\nExtracted data:');
        console.log(JSON.stringify(result, null, 2));

        log.info(`Successfully processed ${request.loadedUrl}`);
    },

    async failedRequestHandler({ request, log }) {
        log.error(`Failed to process ${request.url}`);
    },
});

await crawler.run(config.startUrls);


const dataset = await Dataset.open();
const records = await dataset.export();

const outputPath = new URL('../results.json', import.meta.url);

await writeFile(
    outputPath,
    JSON.stringify(records, null, 2),
    'utf8'
)

console.log(`\nExported ${records.length} records to results.json`)