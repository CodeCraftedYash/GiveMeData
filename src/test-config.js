
import assert from 'node:assert/strict';
import * as cheerio from 'cheerio';
import { validateConfig } from './validate.config.js';

const validConfig = {
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
};

assert.doesNotThrow(() => validateConfig(validConfig));

const invalidConfigs = [
    null,
    [],
    { title: { type: 'text', multiple: false } },
    { title: { selector: 'h1', type: 'unknown', multiple: false } },
    { link: { selector: 'a', type: 'attribute', multiple: true } },
    { title: { selector: 'h1', type: 'text', multiple: 'false' } },
];

for (const config of invalidConfigs) {
    assert.throws(() => validateConfig(config));
}

// Check CSS selector syntax separately.
const $ = cheerio.load('<h1>Test</h1>');

assert.doesNotThrow(() => $('h1'));
assert.throws(() => $('['));

console.log('All configuration validation tests passed.');