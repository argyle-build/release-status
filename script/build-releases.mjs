// Fetches the latest release for each Argyle installer repo and writes
// a single combined releases.json. Run by the GitHub Actions workflow.

import { writeFile } from "node:fs/promises";

const REPOS = [
  "Argylebuild/ML2-Installer",
  "Argylebuild/Revit-Installer",
  "Argylebuild/Navisworks-Installer",
];

const token = process.env.GH_TOKEN;
if (!token) {
  throw new Error("GH_TOKEN environment variable is not set");
}

async function fetchLatest(repo) {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/releases/latest`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "argyle-release-status-bot",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch ${repo}: HTTP ${res.status}`);
  }

  const data = await res.json();
  return {
    tag_name: data.tag_name,
    name: data.name,
    published_at: data.published_at,
    body: data.body,
    html_url: data.html_url,
  };
}

const output = { generated_at: new Date().toISOString() };

for (const repo of REPOS) {
  output[repo] = await fetchLatest(repo);
  console.log(`Fetched ${repo}: ${output[repo].tag_name}`);
}

await writeFile("releases.json", JSON.stringify(output, null, 2) + "\n");
console.log("releases.json written");
