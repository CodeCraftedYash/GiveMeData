
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { CheerioCrawler, Dataset, RequestQueue } from 'crawlee';

import { extractData } from './extractor.js';
import { validateConfig } from './validate.config.js';

const configPath = new URL('../config.json', import.meta.url);

const config = JSON.parse(
    await readFile(configPath, 'utf8')
);

validateConfig(config.selectors);

if (!Array.isArray(config.startUrls) || config.startUrls.length === 0) {
    throw new Error('config.json must contain at least one start URL.');
}

if (!config.paginationSelector) {
    throw new Error('config.json must contain paginationSelector.');
}

const requestQueue = await RequestQueue.open();

await requestQueue.addRequests(
    config.startUrls.map(url => ({ url }))
);

const allRecords = [];

const crawler = new CheerioCrawler({
    requestQueue,
    maxRequestsPerCrawl: config.maxPages ?? 5,
    maxConcurrency: 3,

    async requestHandler({ request, $, log }) {
        const records = extractData(
            $,
            config.selectors,
            config.itemSelector
        );

        const pageRecords = Array.isArray(records)
            ? records
            : [records];

        const currentRecords = pageRecords.map(record => ({
            ...record,
            sourceUrl: request.loadedUrl,
        }));

        allRecords.push(...currentRecords);

        await Dataset.pushData({
            url: request.loadedUrl,
            records: currentRecords,
        });

        console.log(`Extracted ${currentRecords.length} records from ${request.loadedUrl}`);

        const nextPageUrl = $(config.paginationSelector).attr('href');

        if (nextPageUrl) {
            const absoluteUrl = new URL(
                nextPageUrl,
                request.loadedUrl
            ).href;

            await requestQueue.addRequest({
                url: absoluteUrl,
            });

            log.info(`Queued next page: ${absoluteUrl}`);
        }

        log.info(`Successfully processed ${request.loadedUrl}`);
    },

    async failedRequestHandler({ request, log }) {
        log.error(`Failed to process ${request.url}`);
    },
});

await crawler.run();

// Generate a safe filename from the starting URL.
const sourceUrl = new URL(config.startUrls[0]);

const fileName = (
    `${sourceUrl.hostname}${sourceUrl.pathname}${sourceUrl.search}`
)
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() + '.json';

const dataDirectory = new URL('../data/', import.meta.url);

await mkdir(dataDirectory, { recursive: true });

const outputPath = new URL(fileName, dataDirectory);

await writeFile(
    outputPath,
    JSON.stringify(allRecords, null, 2),
    'utf8'
);

console.log(`Saved ${allRecords.length} records to data/${fileName}`);
