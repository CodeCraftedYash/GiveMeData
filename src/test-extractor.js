
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import { extractData } from './extractor.js';

const html = `
    <html>
        <head><title>Test Page</title></head>
        <body>
            <h1>Example Website</h1>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
        </body>
    </html>
`;

const $ = cheerio.load(html);

const selectors = {
    title: {
        selector: 'h1',
        type: 'text',
        multiple: false,
    },
    links: {
        selector: 'a',
        type: 'attribute',
        attribute: 'href',
        multiple: true,
    },
    missing: {
        selector: '.does-not-exist',
        type: 'text',
        multiple: false,
    },
};

const result = extractData($, selectors);

assert.deepEqual(result, {
    title: 'Example Website',
    links: ['/about', '/contact'],
    missing: null,
});

console.log('All extractor tests passed.');
console.log(result);
