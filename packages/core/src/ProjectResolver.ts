import { readdir, realpath, stat, access } from "node:fs/promises";
import path from "node:path";
import type { Project } from "./types.js";

export interface ProjectDiscoveryOptions {
  maxDepth: number;
  markers: string[];
}

export async function resolveProjectPath(baseDir: string, input: string): Promise<string> {
  const base = await realpath(baseDir);
  const candidate = path.isAbsolute(input) ? input : path.join(base, input);
  const resolved = await realpath(candidate);

  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error(`Project path escapes base directory: ${input}`);
  }

  return resolved;
}

export async function discoverProjects(
  baseDir: string,
  options: ProjectDiscoveryOptions,
): Promise<Project[]> {
  const base = await realpath(baseDir);
  const projects: Project[] = [];

  async function hasMarker(dir: string): Promise<boolean> {
    for (const marker of options.markers) {
      try {
        await access(path.join(dir, marker));
        return true;
      } catch {
        // keep checking
      }
    }
    return false;
  }

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > options.maxDepth) return;

    if (await hasMarker(dir)) {
      const rel = path.relative(base, dir) || path.basename(base);
      projects.push({
        id: rel.replaceAll(path.sep, "/"),
        name: path.basename(dir),
        path: dir,
      });
      return;
    }

    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if ([".git", "node_modules", "dist", ".venv", "venv", "__pycache__"].includes(entry.name)) continue;
      const child = path.join(dir, entry.name);
      const childStat = await stat(child);
      if (!childStat.isDirectory()) continue;
      await walk(child, depth + 1);
    }
  }

  await walk(base, 0);
  return projects.sort((a, b) => a.id.localeCompare(b.id));
}
