export interface TelegramChunk {
  kind: "text" | "file";
  text?: string;
  filename?: string;
  content?: string;
}

export interface FormatOptions {
  maxTextLength: number;
  sendLongCodeAsFile: boolean;
  sendDiffAsPatch: boolean;
}

export function formatForTelegram(text: string, options: FormatOptions): TelegramChunk[] {
  if (text.length <= options.maxTextLength) {
    return [{ kind: "text", text }];
  }

  if (looksLikeDiff(text) && options.sendDiffAsPatch) {
    return [{ kind: "file", filename: "opencode.diff.patch", content: text }];
  }

  if (looksLikeCodeOrLog(text) && options.sendLongCodeAsFile) {
    return [{ kind: "file", filename: "opencode-output.txt", content: text }];
  }

  return splitText(text, options.maxTextLength).map((chunk) => ({ kind: "text", text: chunk }));
}

function splitText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    const cut = findCutPoint(remaining, maxLength);
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
  }

  if (remaining.length > 0) chunks.push(remaining);
  return chunks;
}

function findCutPoint(text: string, maxLength: number): number {
  const newline = text.lastIndexOf("\n", maxLength);
  if (newline > maxLength * 0.5) return newline;
  const space = text.lastIndexOf(" ", maxLength);
  if (space > maxLength * 0.5) return space;
  return maxLength;
}

function looksLikeDiff(text: string): boolean {
  return text.includes("diff --git") || text.startsWith("--- ") || text.includes("\n@@ ");
}

function looksLikeCodeOrLog(text: string): boolean {
  return text.includes("```") || text.split("\n").length > 80;
}
