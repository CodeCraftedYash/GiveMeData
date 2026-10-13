import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { validateConfig } from '../validate.config.js';

const sitesPath = resolve('configs/sites.json');
const selectorsDirectory = resolve('configs/selectors');

export async function loadTasks() {
    const content = await readFile(sitesPath, 'utf8');
    const config = JSON.parse(content);

    if (!Array.isArray(config.tasks) || config.tasks.length === 0) {
        throw new Error(
            'configs/sites.json must contain a non-empty tasks array.'
        );
    }

    for (const task of config.tasks) {
        if (
            !task ||
            typeof task.id !== 'string' ||
            !task.id.trim() ||
            typeof task.url !== 'string' ||
            !task.url.trim()
        ) {
            throw new Error(
                'Every task must have a non-empty id and url.'
            );
        }

        try {
            const url = new URL(task.url);

            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error();
            }
        } catch {
            throw new Error(`Task "${task.id}" has an invalid URL.`);
        }
    }

    return config.tasks;
}

export async function loadProfiles() {
    const files = (await readdir(selectorsDirectory))
        .filter(file => file.endsWith('.json'));

    const profiles = [];

    for (const file of files) {
        const path = join(selectorsDirectory, file);
        const content = await readFile(path, 'utf8');
        const profile = JSON.parse(content);

        if (
            !Array.isArray(profile.urlPatterns) ||
            profile.urlPatterns.length === 0
        ) {
            throw new Error(
                `Profile "${file}" must have a non-empty urlPatterns array.`
            );
        }

        for (const pattern of profile.urlPatterns) {
            if (typeof pattern !== 'string' || !pattern.trim()) {
                throw new Error(
                    `Profile "${file}" contains an invalid URL pattern.`
                );
            }

            try {
                new RegExp(pattern);
            } catch {
                throw new Error(
                    `Profile "${file}" has an invalid regex: ${pattern}`
                );
            }
        }

        validateConfig(profile.selectors);

        profiles.push({ file, profile });
    }

    if (profiles.length === 0) {
        throw new Error(
            'No selector profiles found in configs/selectors/.'
        );
    }

    return profiles;
}