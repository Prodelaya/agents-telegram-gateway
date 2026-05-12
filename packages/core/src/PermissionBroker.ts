import type { PermissionAnswer, PermissionRequest } from "./types.js";

export type PermissionHandler = (request: PermissionRequest) => Promise<PermissionAnswer>;

export class PermissionBroker {
  private readonly pending = new Map<string, PermissionRequest>();

  add(request: PermissionRequest): void {
    this.pending.set(request.id, request);
  }

  get(permissionId: string): PermissionRequest | undefined {
    return this.pending.get(permissionId);
  }

  resolve(permissionId: string): void {
    this.pending.delete(permissionId);
  }

  listPending(): PermissionRequest[] {
    return [...this.pending.values()];
  }
}
