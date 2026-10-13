import { saveJson } from '../utils/output.js';

const records = [
    {
        name: 'Example Business',
        phone: ['1234567890'],
        address: 'Bangalore',
    },
];

const outputPath = await saveJson(
    records,
    'https://www.asklaila.com/search/Bangalore/-/visa/'
);

console.log('Output file:', outputPath);
