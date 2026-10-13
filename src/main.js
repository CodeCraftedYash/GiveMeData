import { CheerioCrawler, RequestQueue } from "crawlee";

import { loadTasks, loadProfiles } from "./utils/config-loader.js";
import { findProfile } from "./utils/profile-matcher.js";
import { saveJson } from "./utils/output.js";
import { extractData } from "./extractor.js";

// Select the tasks to run.
const allTasks = await loadTasks(); // Task = what you want the crawler to do.
const profiles = await loadProfiles(); // Profile = how the crawler extracts data from a particular type of page.

const taskId = process.argv[2];

const tasks = taskId ? allTasks.filter((task) => task.id === taskId) : allTasks;

if (tasks.length === 0) {
  throw new Error(`No task found with ID: ${taskId}`);
}

console.log(`Selected ${tasks.length} task(s).`);

// Run one crawl task.
async function runTask(task) {
  console.log(`\nStarting task: ${task.id}`);
  console.log(`Starting URL: ${task.url}`);

  // Validate that the starting URL has a matching profile.
  const initialMatch = findProfile(task.url, profiles);

  console.log(`Initial profile: ${initialMatch.file}`);

  const requestQueue = await RequestQueue.open(`${task.id}-${Date.now()}`);

  await requestQueue.addRequest({ url: task.url });

  const allRecords = [];

  const crawler = new CheerioCrawler({
    requestQueue,
    maxRequestsPerCrawl:
      task.maxRequestsPerCrawl ?? initialMatch.profile.maxPages ?? 5,
    maxConcurrency: task.maxConcurrency ?? 3,

    async requestHandler({ request, $, log }) {
      const currentUrl = request.loadedUrl || request.url;

      // Choose a profile for this specific page.
      const { file, profile } = findProfile(currentUrl, profiles);

      log.info(`Using profile "${file}" for ${currentUrl}`);

      const records = extractData($, profile.selectors, profile.itemSelector);

      const pageRecords = Array.isArray(records) ? records : [records];

      const currentRecords = pageRecords.map((record) => ({
        ...record,
        sourceUrl: currentUrl,
      }));

      allRecords.push(...currentRecords);

      log.info(`Extracted ${currentRecords.length} records from ${currentUrl}`);

      //follow nested link 
      
      if (profile.linkDiscovery?.follow) {
        const field = profile.linkDiscovery.field;

        for (const record of currentRecords) {
          const discoveredUrl = record[field];

          if (typeof discoveredUrl !== "string" || !discoveredUrl.trim()) {
            continue;
          }

          const absoluteUrl = new URL(discoveredUrl, currentUrl).href;

          await requestQueue.addRequest({
            url: absoluteUrl,
          });

          log.info(`Queued discovered link: ${absoluteUrl}`);
        }
      }

      // Follow pagination only when this profile defines it.
      if (profile.paginationSelector) {
        const nextPageUrl = $(profile.paginationSelector).attr("href");

        if (nextPageUrl) {
          const absoluteUrl = new URL(nextPageUrl, currentUrl).href;

          await requestQueue.addRequest({
            url: absoluteUrl,
          });

          log.info(`Queued next page: ${absoluteUrl}`);
        }
      }

      log.info(`Processed ${currentUrl}`);
    },

    async failedRequestHandler({ request, log }) {
      log.error(`Failed to process ${request.url}`);
    },
  });

  await crawler.run();

  await saveJson(allRecords, task.url);

  console.log(`Finished task "${task.id}" with ${allRecords.length} records.`);
}

// Execute tasks sequentially.
for (const task of tasks) {
  await runTask(task);
}

console.log("\nAll selected tasks finished.");
