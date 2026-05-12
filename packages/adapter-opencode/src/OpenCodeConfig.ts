export interface OpenCodeConfig {
  command: string;
  host: string;
  portFrom: number;
  portTo: number;
  serverPassword?: string;
  defaultAgent: string;
  startupTimeoutMs: number;
}

export const defaultOpenCodeConfig: OpenCodeConfig = {
  command: "opencode",
  host: "127.0.0.1",
  portFrom: 4100,
  portTo: 4199,
  defaultAgent: "gentle-orchestrator",
  startupTimeoutMs: 15_000,
};
