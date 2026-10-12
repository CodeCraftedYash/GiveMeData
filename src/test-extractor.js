
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

const cardHtml = `
    <div class="cardContent">
        <h2 class="resultTitle">
            <a href="/business-1">Business One</a>
        </h2>
        <a href="tel:123456">123456</a>
    </div>

    <div class="cardContent">
        <h2 class="resultTitle">
            <a href="/business-2">Business Two</a>
        </h2>
    </div>
`;

const $cards = cheerio.load(cardHtml);

const cardResult = extractData(
    $cards,
    {
        name: {
            selector: '.resultTitle a',
            type: 'text',
            multiple: false,
        },
        listingUrl: {
            selector: '.resultTitle a',
            type: 'attribute',
            attribute: 'href',
            multiple: false,
        },
        phone: {
            selector: 'a[href^="tel:"]',
            type: 'text',
            multiple: false,
        },
    },
    '.cardContent'
);

assert.deepEqual(cardResult, [
    {
        name: 'Business One',
        listingUrl: '/business-1',
        phone: '123456',
    },
    {
        name: 'Business Two',
        listingUrl: '/business-2',
        phone: null,
    },
]);

console.log('Card extraction test passed.');
console.log(cardResult);

console.log('All extractor tests passed.');
console.log(result);
