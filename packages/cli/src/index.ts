#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { Command } from "commander";
import dotenv from "dotenv";
import YAML from "yaml";
import { discoverProjects } from "@agents-telegram-gateway/core";
import { OpenCodeAdapter } from "@agents-telegram-gateway/adapter-opencode";
import { TelegramGateway } from "@agents-telegram-gateway/transport-telegram";

dotenv.config();

const program = new Command();

program
  .name("agents-telegram-gateway")
  .description("Telegram gateway for local coding agents")
  .option("-c, --config <path>", "config file", process.env.AGENTS_TELEGRAM_GATEWAY_CONFIG ?? "config/agents-telegram-gateway.example.yaml")
  .action(async (options) => {
    const raw = await readFile(options.config, "utf8");
    const config = YAML.parse(raw);

    const token = process.env[config.telegram.botTokenEnv];
    if (!token) throw new Error(`Missing Telegram token env: ${config.telegram.botTokenEnv}`);

    const allowed = (process.env[config.telegram.allowedUserIdsEnv] ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map(Number);

    if (allowed.length === 0) throw new Error("No Telegram user ids configured");

    const projects = await discoverProjects(config.workspace.baseDir, {
      maxDepth: config.workspace.discovery.maxDepth,
      markers: config.workspace.discovery.markers,
    });

    const serverPassword = process.env[config.opencode.serverPasswordEnv];
    const adapter = new OpenCodeAdapter({
      command: config.opencode.command,
      host: config.opencode.host,
      portFrom: config.opencode.portRange.from,
      portTo: config.opencode.portRange.to,
      serverPassword,
      defaultAgent: config.agents.defaultAgent,
      startupTimeoutMs: config.opencode.startupTimeoutMs,
    });

    const gateway = new TelegramGateway({
      token,
      allowedUserIds: allowed,
      projects,
      adapter,
      defaultAgent: config.agents.defaultAgent,
      maxTextLength: config.telegramFormatting.maxTextLength,
    });

    await gateway.start();
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error);
  process.exit(1);
});
