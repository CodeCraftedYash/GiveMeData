import { loadProfiles } from '../utils/config-loader.js';
import { findProfile } from '../utils/profile-matcher.js';

const profiles = await loadProfiles();

const testUrls = [
    'https://www.asklaila.com/search/Bangalore/-/visa/',
    'https://www.asklaila.com/listing/Bangalore/m-g-road/morevisas-immigration-services-private-limited/04OXTNmj/',
];

for (const url of testUrls) {
    try {
        const match = findProfile(url, profiles);
        console.log(`${url}\n  -> ${match.file}`);
    } catch (error) {
        console.error(`${url}\n  -> ${error.message}`);
    }
}