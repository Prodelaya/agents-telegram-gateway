import { describe, expect, it } from "vitest";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { discoverProjects, resolveProjectPath } from "../src/ProjectResolver.js";

describe("ProjectResolver", () => {
  it("resolves paths inside the base directory", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "agt-base-"));
    const project = path.join(base, "demo");
    await mkdir(project);

    await expect(resolveProjectPath(base, "demo")).resolves.toBe(project);
  });

  it("rejects traversal outside the base directory", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "agt-base-"));
    await expect(resolveProjectPath(base, "../../etc")).rejects.toThrow(/escapes base/);
  });

  it("discovers projects by markers", async () => {
    const base = await mkdtemp(path.join(os.tmpdir(), "agt-base-"));
    const project = path.join(base, "demo");
    await mkdir(project);
    await writeFile(path.join(project, "AGENTS.md"), "# demo");

    const projects = await discoverProjects(base, { maxDepth: 2, markers: ["AGENTS.md"] });
    expect(projects).toHaveLength(1);
    expect(projects[0]?.id).toBe("demo");
  });
});
