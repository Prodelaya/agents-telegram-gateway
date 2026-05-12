import type { Runtime } from "./types.js";

export class RuntimeRegistry {
  private readonly runtimes = new Map<string, Runtime>();

  set(runtime: Runtime): void {
    this.runtimes.set(runtime.id, runtime);
  }

  get(runtimeId: string): Runtime | undefined {
    return this.runtimes.get(runtimeId);
  }

  list(): Runtime[] {
    return [...this.runtimes.values()];
  }

  findByProject(projectId: string): Runtime | undefined {
    return this.list().find((runtime) => runtime.projectId === projectId && runtime.status !== "stopped");
  }

  update(runtimeId: string, patch: Partial<Runtime>): Runtime {
    const runtime = this.runtimes.get(runtimeId);
    if (!runtime) throw new Error(`Runtime not found: ${runtimeId}`);
    const next = { ...runtime, ...patch, updatedAt: new Date().toISOString() };
    this.runtimes.set(runtimeId, next);
    return next;
  }
}
