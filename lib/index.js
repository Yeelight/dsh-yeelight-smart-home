// src/store.ts
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// src/types.ts
var DEFAULT_CONFIG = {
  binPath: "",
  region: "",
  houseId: "",
  profile: "",
  locale: "zh-CN",
  dryRunDefault: false,
  requestTimeoutMs: 12e4,
  logRetention: 500,
  logEnabled: true,
  uiStatusEnabled: true,
  uiLogsEnabled: true,
  uiQuickInvokeEnabled: true
};

// src/store.ts
var KNOWN_KEYS = new Set(Object.keys(DEFAULT_CONFIG));
function numberIn(value, fallback, min, max) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
function booleanOf(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function stringOf(value, fallback) {
  return typeof value === "string" ? value : fallback;
}
function normalizeConfig(raw) {
  const input = raw ?? {};
  return Object.freeze({
    binPath: stringOf(input.binPath, DEFAULT_CONFIG.binPath),
    region: stringOf(input.region, DEFAULT_CONFIG.region),
    houseId: stringOf(input.houseId, DEFAULT_CONFIG.houseId),
    profile: stringOf(input.profile, DEFAULT_CONFIG.profile),
    locale: stringOf(input.locale, DEFAULT_CONFIG.locale),
    dryRunDefault: booleanOf(input.dryRunDefault, DEFAULT_CONFIG.dryRunDefault),
    requestTimeoutMs: numberIn(input.requestTimeoutMs, DEFAULT_CONFIG.requestTimeoutMs, 5e3, 10 * 6e4),
    logRetention: numberIn(input.logRetention, DEFAULT_CONFIG.logRetention, 20, 5e4),
    logEnabled: booleanOf(input.logEnabled, DEFAULT_CONFIG.logEnabled),
    uiStatusEnabled: booleanOf(input.uiStatusEnabled, DEFAULT_CONFIG.uiStatusEnabled),
    uiLogsEnabled: booleanOf(input.uiLogsEnabled, DEFAULT_CONFIG.uiLogsEnabled),
    uiQuickInvokeEnabled: booleanOf(input.uiQuickInvokeEnabled, DEFAULT_CONFIG.uiQuickInvokeEnabled)
  });
}
function readFileSafe(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return void 0;
  }
}
function openConfigStore(home) {
  const file = join(home, "config.json");
  let current = normalizeConfig(readFileSafe(file));
  const persist = () => {
    mkdirSync(home, { recursive: true });
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, `${JSON.stringify(current, null, 2)}
`);
    renameSync(tmp, file);
  };
  return {
    get file() {
      return file;
    },
    current: () => current,
    patch(patch) {
      const next = { ...current };
      for (const [key, value] of Object.entries(patch ?? {})) {
        if (KNOWN_KEYS.has(key)) next[key] = value;
      }
      current = normalizeConfig(next);
      persist();
      return current;
    },
    reset() {
      current = normalizeConfig(void 0);
      persist();
      return current;
    }
  };
}

// src/logs.ts
import { appendFileSync, mkdirSync as mkdirSync2, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join2 } from "node:path";
function logPath(home) {
  return join2(home, "invoke.log.jsonl");
}
function readEntries(file) {
  try {
    const text = readFileSync2(file, "utf8");
    const entries = [];
    for (const line of text.split("\n")) {
      if (line.trim() === "") continue;
      try {
        const parsed = JSON.parse(line);
        if (typeof parsed?.id === "string" && typeof parsed?.ts === "number") entries.push(parsed);
      } catch {
      }
    }
    return entries;
  } catch {
    return [];
  }
}
function trimLatest(entries, retention) {
  if (entries.length <= retention) return entries;
  return entries.slice(entries.length - retention);
}
function openInvokeLogger(home, config) {
  const file = logPath(home);
  return {
    enabled: () => config().logEnabled,
    file,
    append(entry) {
      if (!config().logEnabled) return;
      try {
        mkdirSync2(home, { recursive: true });
        appendFileSync(file, `${JSON.stringify(entry)}
`);
        const retention = config().logRetention;
        const entries = readEntries(file);
        if (entries.length > retention) {
          writeFileSync2(file, `${trimLatest(entries, retention).map((e) => JSON.stringify(e)).join("\n")}
`);
        }
      } catch (error) {
        console.error(`[yeelight-smart-home] invoke log append failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    list(limit) {
      const entries = readEntries(file);
      const slice = limit > 0 ? entries.slice(-limit) : entries;
      return slice.reverse().map((entry) => {
        const { request: _request, response: _response, ...summary } = entry;
        return summary;
      });
    },
    detail(id) {
      return readEntries(file).find((entry) => entry.id === id);
    },
    clear() {
      try {
        writeFileSync2(file, "");
      } catch (error) {
        console.error(`[yeelight-smart-home] invoke log clear failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };
}

// src/paths.ts
import { homedir } from "node:os";
import { dirname, join as join3, resolve } from "node:path";
import { fileURLToPath } from "node:url";
function modulePath() {
  if (typeof __filename === "string" && __filename !== "") return __filename;
  return fileURLToPath(import.meta.url);
}
function dshHome(env) {
  const fromEnv = (env.DSH_HOME ?? "").trim();
  if (fromEnv !== "") return fromEnv;
  return join3(homedir(), ".dsh");
}
function pluginHome(env) {
  return join3(dshHome(env), "plugins", "dsh-yeelight-smart-home");
}
function dataDir() {
  return resolve(dirname(modulePath()), "..", "data");
}

// src/request.ts
var sequence = 0;
function newRequestId() {
  sequence = (sequence + 1) % 65535;
  return `dsh-${Date.now().toString(36)}-${sequence.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
function buildSkillRequest(input, config = {}) {
  const utterance = typeof input.utterance === "string" ? input.utterance.trim() : "";
  if (utterance === "") {
    throw new Error("utterance must be a non-empty string: the natural-language request or confirmation of it");
  }
  const parameters = typeof input.parameters === "object" && input.parameters !== null && !Array.isArray(input.parameters) ? input.parameters : void 0;
  const requestId = typeof input.request_id === "string" && input.request_id.trim() !== "" ? input.request_id.trim() : newRequestId();
  const locale = typeof input.locale === "string" && input.locale.trim() !== "" ? input.locale.trim() : config.locale ?? DEFAULT_CONFIG.locale;
  return Object.freeze({
    contractVersion: "1.0",
    requestId,
    locale,
    utterance,
    ...typeof input.intent === "string" && input.intent.trim() !== "" ? { intent: input.intent.trim() } : {},
    ...parameters !== void 0 ? { parameters } : {}
  });
}
function parseSkillRequestJson(json, config = {}) {
  if (typeof json !== "string" || json.trim() === "") {
    throw new Error("json must be a non-empty string holding a SkillRequest object");
  }
  let raw;
  try {
    raw = JSON.parse(json);
  } catch (error) {
    throw new Error(`json is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("json must hold one SkillRequest object");
  }
  const input = raw;
  const options = typeof input.options === "object" && input.options !== null && !Array.isArray(input.options) ? input.options : void 0;
  const dryRun = options?.dryRun === true;
  const requestId = typeof input.requestId === "string" ? input.requestId : input.request_id;
  return {
    request: buildSkillRequest(
      {
        utterance: input.utterance,
        intent: input.intent,
        parameters: input.parameters,
        request_id: requestId,
        locale: input.locale,
        contract_version: input.contractVersion
      },
      config
    ),
    dryRun
  };
}
function isPositiveStatus(status) {
  return status === "success" || status === "partial";
}

// src/product-select.ts
import { spawn } from "node:child_process";
import { join as join4 } from "node:path";
function runProductSelect(dir, args, options) {
  return new Promise((resolve2, reject) => {
    const script = join4(dir, "scripts", "product-select.mjs");
    const cliArgs = ["--query", args.query];
    if (typeof args.room === "string" && args.room.trim() !== "") cliArgs.push("--room", args.room.trim());
    if (typeof args.goal === "string" && args.goal.trim() !== "") cliArgs.push("--goal", args.goal.trim());
    if (typeof args.category === "string" && args.category.trim() !== "") cliArgs.push("--category", args.category.trim());
    cliArgs.push("--limit", String(Math.min(Math.max(Math.floor(args.limit ?? 8), 1), 20)));
    const child = spawn(process.execPath, [script, ...cliArgs], {
      stdio: ["ignore", "pipe", "pipe"],
      env: options.env ?? process.env
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      if (!settled) {
        settled = true;
        reject(new Error(`product-select timed out after ${options.timeoutMs ?? 3e4}ms`));
      }
    }, options.timeoutMs ?? 3e4);
    timer.unref?.();
    child.stdout.on("data", (chunk) => {
      if (!settled) stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      if (!settled) stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`product-select exited ${code}: ${stderr.trim().slice(0, 500)}`));
        return;
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve2(parsed);
      } catch {
        reject(new Error("product-select returned invalid JSON"));
      }
    });
  });
}

// src/reference.ts
import { readFileSync as readFileSync3, readdirSync, statSync } from "node:fs";
import { join as join5 } from "node:path";
var ASSETS = [
  { key: "intent-catalog", relative: "assets/intent-catalog.json", label: "Intent catalog: every supported Runtime intent id", kind: "asset" },
  { key: "skill-request.schema", relative: "assets/schemas/skill-request.schema.json", label: "SkillRequest JSON schema", kind: "schema" },
  { key: "skill-response.schema", relative: "assets/schemas/skill-response.schema.json", label: "Runtime response JSON schema", kind: "schema" },
  { key: "lighting-design-full-home", relative: "assets/examples/lighting-design-full-home.json", label: "Full multi-room lighting design import example", kind: "example" },
  { key: "README", relative: "references/README.md", label: "Reference router: the shortest path to the right document", kind: "reference" }
];
function listReferenceDocs(dir) {
  const docs = [];
  const referencesDir = join5(dir, "references");
  for (const name of readdirSync(referencesDir).sort()) {
    if (!name.endsWith(".md")) continue;
    const relative = join5("references", name);
    docs.push({ key: name.slice(0, -3), label: `references/${name}`, kind: "reference", relative, bytes: statSync(join5(dir, relative)).size });
  }
  for (const asset of ASSETS) {
    docs.push({ key: asset.key, label: asset.label, kind: asset.kind, relative: asset.relative, bytes: statSync(join5(dir, asset.relative)).size });
  }
  return docs;
}
function referenceIndex(dir) {
  const index = /* @__PURE__ */ new Map();
  for (const doc of listReferenceDocs(dir)) index.set(doc.key, doc);
  return index;
}
function readReferenceDoc(dir, key) {
  const index = referenceIndex(dir);
  const doc = index.get(key);
  if (doc === void 0) {
    const keys = [...index.keys()].join(", ");
    throw new Error(`unknown document "${key}"; available: ${keys}`);
  }
  return { doc, content: readFileSync3(join5(dir, doc.relative), "utf8") };
}
function referenceToolHints(dir) {
  const index = referenceIndex(dir);
  const picks = [
    "README (router first when unsure)",
    "device-control",
    "product-knowledge",
    "home-room-area",
    "groups",
    "scenes",
    "automations",
    "payload-shapes",
    "lighting-design",
    "lighting-design-import",
    "lighting-product-selection",
    "scene-recipes",
    "automation-recipes",
    "automation-events",
    "lighting-experience",
    "diagnostics",
    "memory-and-personalization",
    "recommendations",
    "operation-lessons",
    "safety-and-confirmation",
    "capability-boundaries",
    "device-lexicon",
    "thing-model",
    "runtime-status-and-errors",
    "response-presentation",
    "intent-catalog",
    "lighting-design-full-home"
  ];
  const existing = picks.filter((key) => index.has(key));
  return `Available documents (${existing.join(", ")}); ${index.size} total.`;
}

// src/runtime.ts
import { accessSync, constants } from "node:fs";
import { homedir as homedir2 } from "node:os";
import { dirname as dirname2, join as join6, sep } from "node:path";
import { spawn as spawn2 } from "node:child_process";
var CAPTURE_LIMIT_BYTES = 32 * 1024 * 1024;
function captureCommand(command, args, options) {
  return new Promise((resolve2) => {
    const timeoutMs = options.timeoutMs ?? 15e3;
    let stdout = "";
    let stderr = "";
    let exceeded = false;
    let settled = false;
    let timer;
    const child = spawn2(command, [...args], {
      stdio: ["pipe", "pipe", "pipe"],
      env: options.env ?? process.env
    });
    const finish = (timedOut) => {
      if (settled) return;
      settled = true;
      if (timer !== void 0) clearTimeout(timer);
      resolve2({ ok: !timedOut && !exceeded && child.exitCode === 0, code: child.exitCode, stdout, stderr, timedOut });
    };
    child.stdout.on("data", (chunk) => {
      if (exceeded || stdout.length + chunk.length > CAPTURE_LIMIT_BYTES) {
        exceeded = true;
        return;
      }
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk) => {
      if (exceeded || stderr.length + chunk.length > CAPTURE_LIMIT_BYTES) {
        exceeded = true;
        return;
      }
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      if (timer !== void 0) clearTimeout(timer);
      resolve2({ ok: false, code: null, stdout, stderr: `${stderr}${error.message}
`, timedOut: false });
    });
    child.on("close", (code) => {
      if (timer !== void 0) clearTimeout(timer);
      finish(false);
    });
    if (options.signal !== void 0) {
      if (options.signal.aborted) {
        child.kill("SIGKILL");
        finish(true);
        return;
      }
      options.signal.addEventListener("abort", () => {
        child.kill("SIGKILL");
        finish(true);
      }, { once: true });
    }
    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        child.kill("SIGKILL");
        finish(true);
      }, timeoutMs);
      timer.unref?.();
    }
    child.stdin.end(options.stdin ?? "");
  });
}
function timeoutSignal(ms, parent) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`timeout after ${ms}ms`)), ms);
  timer.unref?.();
  if (parent !== void 0) {
    if (parent.aborted) controller.abort(parent.reason);
    else parent.addEventListener("abort", () => controller.abort(parent.reason), { once: true });
  }
  return controller.signal;
}
function isExecutable(path) {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
function findOnPath(name, env) {
  const path = (env.PATH ?? "").split(sep === "\\" ? ";" : ":").filter((entry) => entry.trim() !== "");
  for (const entry of path) {
    const candidate = join6(entry, name);
    if (isExecutable(candidate)) return candidate;
  }
  return void 0;
}
function runtimeCandidates(env) {
  const candidates = [];
  const fromEnv = (env.YEELIGHT_HOME_BIN ?? "").trim();
  if (fromEnv !== "") candidates.push(fromEnv);
  const found = findOnPath("yeelight-home", env);
  if (found !== void 0) candidates.push(found);
  if (process.platform === "darwin") candidates.push("/opt/homebrew/bin/yeelight-home", "/usr/local/bin/yeelight-home");
  else if (process.platform === "linux") candidates.push("/usr/local/bin/yeelight-home", "/usr/bin/yeelight-home");
  candidates.push(join6(homedir2(), ".local", "bin", "yeelight-home"));
  return [...new Set(candidates)];
}
function resolveRuntimeBin(env, config) {
  const configured = (config.binPath ?? "").trim();
  if (configured !== "") return isExecutable(configured) ? configured : void 0;
  return runtimeCandidates(env).find(isExecutable);
}
function parseVersionJson(text) {
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.version === "string") {
      return {
        version: parsed.version,
        cli: typeof parsed.cli === "string" ? parsed.cli : void 0,
        commit: typeof parsed.commit === "string" ? parsed.commit : void 0,
        os: typeof parsed.os === "string" ? parsed.os : void 0,
        arch: typeof parsed.arch === "string" ? parsed.arch : void 0,
        date: typeof parsed.date === "string" ? parsed.date : void 0
      };
    }
  } catch {
  }
  return void 0;
}
function isCompatibleRuntime(version) {
  return version !== void 0 && version.cli === "yeelight-home" && version.version.trim() !== "";
}
function authStateFields(text, source) {
  try {
    const parsed = JSON.parse(text);
    return {
      authenticated: typeof parsed?.authenticated === "boolean" ? parsed.authenticated : false,
      houseId: typeof parsed.houseId === "string" ? parsed.houseId : void 0,
      region: typeof parsed.region === "string" ? parsed.region : void 0,
      bizType: typeof parsed.bizType === "string" ? parsed.bizType : void 0,
      profile: typeof parsed.profile === "string" ? parsed.profile : void 0,
      tokenPresent: typeof parsed.tokenPresent === "boolean" ? parsed.tokenPresent : void 0,
      tokenSource: typeof parsed.tokenSource === "string" ? parsed.tokenSource : void 0,
      tokenStore: typeof parsed.tokenStore === "string" ? parsed.tokenStore : void 0
    };
  } catch {
    return { authenticated: false };
  }
}
function runtimeMissingOutcome(requestId) {
  return {
    status: "error",
    requestId,
    dryRun: false,
    durationMs: 0,
    userMessage: "Yeelight \u672C\u5730 Runtime \u672A\u5B89\u88C5\u6216\u4E0D\u5728 PATH \u4E2D\u3002\u8BF7\u4ECE\u516C\u5F00\u4ED3\u5E93 Yeelight/yeelight-home \u7684 GitHub Releases \u5B89\u88C5 yeelight-home CLI\uFF0C\u6216\u4F7F\u7528\u5F53\u524D\u5DF2\u53D1\u5E03\u7684 Homebrew\u3001Scoop\u3001npm \u7B49\u5305\u7BA1\u7406\u5668\u6E20\u9053\uFF1B\u4E5F\u53EF\u4EE5\u8BBE\u7F6E YEELIGHT_HOME_BIN \u6216\u63D2\u4EF6\u914D\u7F6E binPath \u6307\u5411 yeelight-home \u53EF\u6267\u884C\u6587\u4EF6\u3002\u5B89\u88C5\u540E\u5148\u8FD0\u884C yeelight-home auth status --json\uFF1B\u82E5\u672A\u767B\u5F55\uFF0C\u4F18\u5148\u8FD0\u884C yeelight-home auth login --qr\uFF1B\u65E0\u6CD5\u626B\u7801\u65F6\uFF0C\u53EF\u5728\u4F60\u81EA\u5DF1\u7684\u7EC8\u7AEF\u901A\u8FC7\u5B89\u5168\u8F93\u5165\u7BA1\u9053\u8FD0\u884C yeelight-home auth token set --stdin --region <region> \u5BFC\u5165\u5DF2\u83B7\u51C6\u7684 token\u3002",
    error: { code: "runtime_missing", message: "yeelight-home CLI not found" }
  };
}
function runtimeOutdatedOutcome(requestId, bin) {
  return {
    status: "error",
    requestId,
    dryRun: false,
    durationMs: 0,
    userMessage: "PATH \u4E2D\u7684 yeelight-home \u4E0D\u662F\u5F53\u524D Yeelight Home Runtime CLI\uFF0C\u6216\u7248\u672C\u8FC7\u65E7\uFF0C\u65E0\u6CD5\u4F5C\u4E3A Skill Runtime \u4F7F\u7528\u3002\u8BF7\u5148\u8FD0\u884C yeelight-home version --json \u548C yeelight-home doctor --json --online \u68C0\u67E5\u5B89\u88C5\u6765\u6E90\uFF1B\u901A\u5E38\u9700\u8981\u5347\u7EA7\u5F53\u524D PATH \u4E0A\u7684\u5B89\u88C5\u6E20\u9053\uFF0C\u4F8B\u5982 npm install -g yeelight-home@latest\u3001brew update && brew upgrade yeelight-home\uFF0C\u6216\u8BBE\u7F6E YEELIGHT_HOME_BIN / \u63D2\u4EF6\u914D\u7F6E binPath \u6307\u5411\u65B0\u7248 yeelight-home \u53EF\u6267\u884C\u6587\u4EF6\u3002",
    error: { code: "runtime_outdated", message: `runtime at ${bin} lacks the expected metadata` }
  };
}
function normalizeInvokeResponse(parsed, requestId, dryRun, durationMs, runtime) {
  const record = typeof parsed === "object" && parsed !== null ? parsed : {};
  const error = typeof record.error === "object" && record.error !== null ? { code: stringOf2(record.error, "code", "unknown"), message: stringOf2(record.error, "message", "") } : void 0;
  const warnings = Array.isArray(record.warnings) ? record.warnings.map(String) : void 0;
  return {
    status: typeof record.status === "string" ? record.status : "error",
    requestId: typeof record.requestId === "string" ? record.requestId : requestId,
    dryRun,
    durationMs,
    userMessage: typeof record.userMessage === "string" ? record.userMessage : void 0,
    result: record.result,
    ...error !== void 0 ? { error } : {},
    ...warnings !== void 0 && warnings.length > 0 ? { warnings } : {},
    runtime
  };
}
function stringOf2(source, key, fallback) {
  return typeof source[key] === "string" ? source[key] : fallback;
}
async function invokeRuntime(input) {
  const requestId = input.request.requestId;
  const dryRun = input.dryRun ?? false;
  const bin = input.bin ?? resolveRuntimeBin(input.env, input.config);
  if (bin === void 0) return runtimeMissingOutcome(requestId);
  const started = Date.now();
  const version = parseVersionJson((await captureCommand(bin, ["version", "--json"], { signal: input.signal, timeoutMs: 1e4, env: input.env })).stdout);
  if (!isCompatibleRuntime(version)) return runtimeOutdatedOutcome(requestId, bin);
  const args = ["invoke", "--stdin"];
  const region = (input.config.region ?? "").trim();
  const houseId = (input.config.houseId ?? "").trim();
  const profile = (input.config.profile ?? "").trim();
  if (region !== "") args.push("--region", region);
  if (houseId !== "") args.push("--house-id", houseId);
  if (profile !== "") args.push("--profile", profile);
  if (dryRun) args.push("--dry-run");
  const pathEnv = { ...input.env, PATH: `${dirname2(bin)}${sep}${input.env.PATH ?? ""}` };
  const captured = await captureCommand(bin, args, {
    timeoutMs: input.timeoutMs ?? 12e4,
    signal: input.signal,
    env: pathEnv,
    stdin: JSON.stringify(input.request)
  });
  const durationMs = Date.now() - started;
  const runtime = { bin, version: version.version };
  if (captured.timedOut) {
    return {
      status: "error",
      requestId,
      dryRun,
      durationMs,
      userMessage: `Runtime \u672A\u5728\u9650\u65F6\u5185\u8FD4\u56DE\uFF08\u8D85\u8FC7 ${input.timeoutMs ?? 12e4}ms\uFF09\u3002\u53EF\u7A0D\u540E\u91CD\u8BD5\uFF0C\u6216\u5148\u8FD0\u884C yeelight-home doctor --json --online \u68C0\u67E5\u7F51\u7EDC\u548C\u7F51\u5173\u72B6\u6001\u3002`,
      error: { code: "runtime_timeout", message: `timed out after ${input.timeoutMs ?? 12e4}ms` },
      runtime
    };
  }
  if (captured.stdout.trim() === "") {
    const detail = captured.stderr.trim().slice(0, 500);
    return {
      status: "error",
      requestId,
      dryRun,
      durationMs,
      userMessage: `Runtime \u672A\u8FD4\u56DE JSON \u54CD\u5E94\u3002${detail !== "" ? `stderr: ${detail}` : "\u8BF7\u8FD0\u884C yeelight-home doctor --json --online \u68C0\u67E5\u5B89\u88C5\u3002"}`,
      error: { code: "invalid_runtime_response", message: detail !== "" ? detail : "empty response" },
      runtime
    };
  }
  let parsed;
  try {
    parsed = JSON.parse(captured.stdout);
  } catch {
    return {
      status: "error",
      requestId,
      dryRun,
      durationMs,
      userMessage: "Runtime \u8FD4\u56DE\u4E86\u975E JSON \u54CD\u5E94\u3002\u8BF7\u8FD0\u884C yeelight-home doctor --json --online \u68C0\u67E5\u5B89\u88C5\u3002",
      error: { code: "invalid_runtime_response", message: "stdout is not JSON" },
      runtime
    };
  }
  return normalizeInvokeResponse(parsed, requestId, dryRun, durationMs, runtime);
}
async function runtimeStatus(env, config) {
  const bin = resolveRuntimeBin(env, config);
  if (bin === void 0) {
    return { bin: void 0, version: void 0, compatible: false, auth: void 0, doctor: { ok: false, kind: "text", text: "runtime not installed" } };
  }
  const signal = timeoutSignal(2e4);
  const [versionCapture, authCapture, doctorCapture] = await Promise.all([
    captureCommand(bin, ["version", "--json"], { timeoutMs: 1e4, signal, env }),
    captureCommand(bin, ["auth", "status", "--json"], { timeoutMs: 1e4, signal, env }),
    captureCommand(bin, ["doctor", "--json"], { timeoutMs: 15e3, signal, env })
  ]);
  const version = parseVersionJson(versionCapture.stdout);
  const authFields = authCapture.ok && authCapture.stdout.trim() !== "" ? authStateFields(authCapture.stdout, authCapture.stderr) : void 0;
  const doctorJson = doctorCapture.stdout.trim();
  const doctor = doctorJson !== "" ? { ok: doctorCapture.ok, kind: "json", text: doctorJson.slice(0, 16e3) } : { ok: false, kind: "text", text: (doctorCapture.stderr.trim() || "doctor produced no output").slice(0, 2e3) };
  return {
    bin,
    version,
    compatible: isCompatibleRuntime(version),
    auth: authFields,
    authError: authFields === void 0 ? authCapture.stderr.trim().slice(0, 500) || "auth status unavailable" : void 0,
    doctor
  };
}

// src/tools.ts
async function runInvoke(env, config, logger, request, options) {
  const started = Date.now();
  const outcome = await invokeRuntime({
    request,
    dryRun: options.dryRun,
    timeoutMs: options.timeoutMs ?? config().requestTimeoutMs,
    signal: options.signal,
    bin: options.bin,
    config: config(),
    env
  });
  logger.append({
    id: outcome.requestId,
    ts: Date.now(),
    requestId: outcome.requestId,
    intent: request.intent,
    utterance: request.utterance,
    dryRun: outcome.dryRun,
    status: outcome.status,
    ok: isPositiveStatus(outcome.status),
    durationMs: Date.now() - started,
    errorCode: outcome.error?.code,
    userMessage: outcome.userMessage,
    request,
    response: outcome
  });
  return outcome;
}
function renderInvokeOutcome(outcome) {
  const lines = [];
  lines.push(`status: ${outcome.status}${outcome.dryRun ? " (dry-run preview, nothing written)" : ""}`);
  if (outcome.userMessage !== void 0 && outcome.userMessage !== "") lines.push(outcome.userMessage);
  if (outcome.status === "clarification_required") {
    lines.push("Ask the user exactly the smallest clarification question Runtime returned; do not guess targets.");
  } else if (outcome.status === "auth_required") {
    lines.push("Tell the user to run `yeelight-home auth login --qr` locally; never request a token in chat.");
  } else if (outcome.status === "blocked" || outcome.status === "not_supported") {
    lines.push("Explain the returned reason and the safe alternative; do not attempt an unsupported fallback.");
  } else if (outcome.status === "error") {
    lines.push(`error.code: ${outcome.error?.code ?? "unknown"}`);
  }
  if (outcome.status === "success" || outcome.status === "partial") {
    lines.push("Present the result per references/response-presentation.md; reflect only what Runtime verified.");
  }
  if (outcome.warnings !== void 0 && outcome.warnings.length > 0) {
    lines.push(`warnings: ${outcome.warnings.join("; ")}`);
  }
  return lines.join("\n");
}
function invokeToolDescription() {
  return [
    "One Yeelight Runtime invocation over the local `yeelight-home invoke --stdin` pipeline.",
    "Every Yeelight control, query, diagnostic, scene, automation, lighting-design, memory, recommendation, and product-knowledge action goes through this tool; NEVER bypass it with guessed endpoints, headers, or MCP.",
    "Pass the user natural-language request as `utterance` (or the full SkillRequest JSON as `json`) plus the classified `intent` from the yeelight-smart-home skill (intent-catalog). Do not resolve IDs yourself; Runtime does.",
    "Handle returned statuses exactly: success/partial -> report, clarification_required -> one smallest question, auth_required -> local QR login, blocked/not_supported -> safe alternative, error -> report.",
    "Load the skill `yeelight-smart-home` and its `yeelight_reference` documents for routing and domain rules before complex operations."
  ].join("\n");
}
function registerTools(tools, service, logger) {
  registerInvokeTool(tools, service, logger);
  registerReferenceTool(tools, service);
  registerProductSelectTool(tools, service);
}
function registerInvokeTool(tools, service, logger) {
  tools.register({
    name: "yeelight_home",
    description: invokeToolDescription(),
    parameters: {
      type: "object",
      properties: {
        utterance: {
          type: "string",
          description: "The user request (or confirmation of it) in natural language, in the user wording. Required unless `json` is given."
        },
        intent: {
          type: "string",
          description: "The classified Runtime intent id from the intent catalog, e.g. light.power.set, entity.list, scene.execute, automation.create, lighting.design.import, memory.remember. Prefixes may be omitted only when the name is unambiguous."
        },
        parameters: {
          type: "object",
          description: "Runtime intent parameters with natural target words (deviceName/roomName/sceneName/automationName...) and `confirmed: true` only after explicit user agreement for destructive or permission-sensitive operations."
        },
        json: {
          type: "string",
          description: 'Alternative: the COMPLETE SkillRequest JSON (`{contractVersion:"1.0",requestId,locale,utterance,intent,parameters,options}`). When given, the separate fields are ignored.'
        },
        request_id: { type: "string", description: "Optional stable id; the tool mints a unique one when omitted." },
        locale: { type: "string", description: "Optional locale for the request; default zh-CN." },
        dry_run: { type: "boolean", description: "No-write preview. Resend without it after user agreement." },
        timeout_ms: { type: "number", description: "Optional per-call timeout override in milliseconds." }
      }
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          status: { type: "string", description: "Runtime status: success | partial | clarification_required | auth_required | blocked | not_supported | error." },
          requestId: { type: "string" },
          dryRun: { type: "boolean" },
          durationMs: { type: "number" },
          userMessage: { type: "string", description: "Runtime-authored user-facing message." },
          error: {
            type: "object",
            additionalProperties: false,
            properties: {
              code: { type: "string" },
              message: { type: "string" }
            },
            required: ["code", "message"]
          },
          result: {
            oneOf: [
              { type: "object" },
              { type: "array" },
              { type: "string" },
              { type: "number" },
              { type: "boolean" },
              { type: "null" }
            ],
            description: "Runtime structured result when the status is success or partial."
          },
          runtime: {
            type: "object",
            additionalProperties: false,
            properties: {
              bin: { type: "string" },
              version: { type: "string" }
            },
            required: ["bin", "version"]
          }
        },
        required: ["status", "requestId", "dryRun", "durationMs"]
      },
      render: (_args, value) => [{ type: "text", text: renderInvokeOutcome(value) }]
    },
    timeoutMs: service.config().requestTimeoutMs + 15e3,
    isConcurrencySafe: () => true,
    presentCall: (args) => {
      const a = args ?? {};
      const title = typeof a.utterance === "string" && a.utterance !== "" ? a.utterance : String(a.intent ?? "yeelight_home");
      return { card: "generic", title: `Yeelight: ${title.slice(0, 80)}`, kind: "search", rawInput: args };
    },
    presentResult: (_args, result) => {
      const value = result.value;
      if (value === void 0) return void 0;
      return { card: "generic", title: `Yeelight ${value.status}`, content: value.userMessage ?? void 0 };
    },
    async execute(args, exec) {
      const input = args ?? {};
      const config = service.config();
      if (typeof input.json === "string" && input.json.trim() !== "") {
        const parsed = parseSkillRequestJson(input.json, config);
        const outcome2 = await runInvoke(service.env, () => config, logger, parsed.request, {
          dryRun: parsed.dryRun ?? input.dry_run === true,
          signal: exec.signal,
          timeoutMs: typeof input.timeout_ms === "number" ? input.timeout_ms : void 0
        });
        return outcome2;
      }
      const request = buildSkillRequest(input, config);
      const outcome = await runInvoke(service.env, () => config, logger, request, {
        dryRun: input.dry_run === true,
        signal: exec.signal,
        timeoutMs: typeof input.timeout_ms === "number" ? input.timeout_ms : void 0
      });
      return outcome;
    }
  });
}
function registerReferenceTool(tools, service) {
  const dir = service.dataDir;
  const keys = [...referenceIndex(dir).keys()];
  const first = keys.slice(0, 6).join(", ");
  tools.register({
    name: "yeelight_reference",
    description: [
      "Load one Yeelight Smart Home routing document or asset by its registry key.",
      "The routing document explains the Runtime payload shapes, intents, safety lanes, and response rules for one domain; the skill instructs when to load which.",
      "Start with `README` when unsure, then the domain key: device-control, product-knowledge, home-room-area, groups, scenes, automations, payload-shapes, lighting-design, lighting-design-import, lighting-product-selection, scene-recipes, automation-recipes, automation-events, lighting-experience, diagnostics, memory-and-personalization, recommendations, operation-lessons, safety-and-confirmation, capability-boundaries, device-lexicon, thing-model, runtime-status-and-errors, response-presentation.",
      "Assets: intent-catalog (all 193 intents), skill-request.schema, skill-response.schema, lighting-design-full-home.",
      `Unknown keys throw with the full list (${keys.length} documents; e.g. ${first}, ...).`
    ].join("\n"),
    parameters: {
      type: "object",
      properties: {
        doc: { type: "string", description: `The document key. Available: ${referenceToolHints(dir)}` }
      },
      required: ["doc"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          bytes: { type: "number" },
          content: { type: "string" }
        },
        required: ["key", "label", "bytes", "content"]
      },
      render: (_args, value) => [
        { type: "text", text: `# yeelight_reference: ${value.key}

${value.content}` }
      ]
    },
    timeoutMs: 1e4,
    isConcurrencySafe: () => true,
    presentCall: (args) => {
      const a = args ?? {};
      return { card: "generic", title: `Load Yeelight doc ${String(a.doc ?? "")}`, kind: "read", rawInput: args };
    },
    async execute(args, exec) {
      const a = args ?? {};
      const doc = typeof a.doc === "string" ? a.doc.trim() : "";
      if (doc === "") throw new Error("doc must be a non-empty document key");
      const { doc: meta, content } = readReferenceDoc(dir, doc);
      return { key: meta.key, label: meta.label, bytes: meta.bytes, content };
    }
  });
}
function registerProductSelectTool(tools, service) {
  tools.register({
    name: "yeelight_product_select",
    description: [
      "Offline candidate product selection for not-yet-installed lighting slots, using the shipped Yeelight lighting-design catalog and lexical aliases.",
      "Pass the user product wording (`query`), the target `room`, the `goal` of the design, and an optional `category`, then apply references/lighting-product-selection.md and references/product-knowledge.md before choosing.",
      "After the AI chooses a candidate, copy skuCode, capabilityPid, productComponentId and the readable productName/category/series/notes into lighting.design.import or device.slot.create via yeelight_home.",
      "For official product facts (manual, FAQ, SKU, pedia) use yeelight_home with product.pedia.search, thing.product_faq.* or thing.product.info.* intents instead."
    ].join("\n"),
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: 'The user product wording or design requirement, e.g. "\u5BA2\u5385\u65E0\u8FB9\u6846\u5D4C\u5165\u5F0F\u5C04\u706F 24\u5EA6 \u9ED1\u8272 55\u5F00\u5B54".' },
        room: { type: "string", description: "Target room, e.g. \u5BA2\u5385." },
        goal: { type: "string", description: 'Design goal, e.g. "\u91CD\u70B9\u7167\u660E \u6D17\u5899" or "\u6C1B\u56F4\u57FA\u7840\u7167\u660E".' },
        category: { type: "string", description: "Optional category hint, e.g. \u5C04\u706F." },
        limit: { type: "number", description: "Candidate limit 1..20 (default 8)." }
      },
      required: ["query"]
    },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          query: { type: "string" },
          normalizedQuery: { type: "string" },
          catalog: { type: "string" },
          returned: { type: "number" },
          candidates: { type: "array", items: { type: "object" } },
          selectionGuidance: { type: "string" },
          runtimeRule: { type: "string" }
        },
        required: ["query", "normalizedQuery", "catalog", "returned", "candidates", "selectionGuidance", "runtimeRule"]
      },
      render: (_args, value) => [
        { type: "text", text: `# yeelight_product_select: ${value.query}
returned ${value.returned} candidate(s)

${value.selectionGuidance}

${value.runtimeRule}` }
      ]
    },
    timeoutMs: 3e4,
    isConcurrencySafe: () => true,
    presentCall: (args) => {
      const a = args ?? {};
      return { card: "generic", title: `Yeelight product select: ${String(a.query ?? "").slice(0, 60)}`, kind: "search", rawInput: args };
    },
    async execute(args, exec) {
      const a = args ?? {};
      const query = typeof a.query === "string" ? a.query.trim() : "";
      if (query === "") throw new Error("query must be a non-empty string");
      return runProductSelect(
        service.dataDir,
        {
          query,
          room: typeof a.room === "string" ? a.room : void 0,
          goal: typeof a.goal === "string" ? a.goal : void 0,
          category: typeof a.category === "string" ? a.category : void 0,
          limit: typeof a.limit === "number" ? a.limit : void 0
        },
        { signal: exec.signal, env: service.env }
      );
    }
  });
}

// src/skills.ts
import { readFileSync as readFileSync4 } from "node:fs";
import { join as join7 } from "node:path";
function parseSkillFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0]?.trim() !== "---") {
    throw new Error("SKILL.md must start with a --- frontmatter block");
  }
  let name = "";
  let description = "";
  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === "---") {
      end = i;
      break;
    }
    const match = /^([A-Za-z0-9-]+):\s*(.*)$/.exec(line);
    if (match === null) continue;
    const key = match[1];
    const value = match[2].trim();
    if (key === "name") name = value;
    else if (key === "description") description = value;
  }
  if (end < 0) throw new Error("SKILL.md frontmatter has no closing ---");
  if (name === "") throw new Error("SKILL.md frontmatter has no name");
  return { name, description, body: lines.slice(end + 1).join("\n").trim() + "\n", contentBytes: content.length };
}
function registerSkill(seam, dir) {
  const raw = readFileSync4(join7(dir, "SKILL.md"), "utf8");
  const parsed = parseSkillFrontmatter(raw);
  return seam.register({
    name: parsed.name,
    description: parsed.description,
    content: parsed.body,
    invocation: { modelInvocable: true, userInvocable: true }
  });
}

// src/routes.ts
var JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
function send(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, { ...JSON_HEADERS, "cache-control": "no-store" });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve2, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error("request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (data.trim() === "") resolve2({});
      else {
        try {
          resolve2(JSON.parse(data));
        } catch (error) {
          reject(new Error(`body is not JSON: ${error instanceof Error ? error.message : String(error)}`));
        }
      }
    });
    req.on("error", reject);
  });
}
function urlPath(req) {
  const raw = req.url ?? "/";
  const query = raw.indexOf("?");
  return new URL(`http://localhost${query < 0 ? raw : raw.slice(0, query)}`).pathname;
}
function queryParam(req, key) {
  const raw = req.url ?? "";
  const search = raw.indexOf("?");
  if (search < 0) return void 0;
  return new URLSearchParams(raw.slice(search + 1)).get(key) ?? void 0;
}
function registerYeelightRoutes(webServer, service) {
  webServer.register({
    kind: "prefix",
    path: "/yeelight",
    handler: async (req, res) => {
      try {
        await dispatch(req, res, service);
      } catch (error) {
        send(res, 400, {
          ok: false,
          error: { code: "bad_request", message: error instanceof Error ? error.message : String(error) }
        });
      }
    }
  });
}
async function dispatch(req, res, service) {
  const path = urlPath(req);
  const method = req.method ?? "GET";
  switch (path) {
    case "/yeelight/config": {
      if (method === "GET") {
        send(res, 200, {
          ok: true,
          value: {
            config: service.config(),
            defaults: DEFAULT_CONFIG,
            file: service.configFile,
            env: {
              DSH_HOME: service.env.DSH_HOME ?? "",
              YEELIGHT_HOME_BIN: service.env.YEELIGHT_HOME_BIN ?? ""
            },
            host: { platform: process.platform, node: process.version }
          }
        });
        return;
      }
      if (method === "POST") {
        const body = await readBody(req);
        const config = body?.reset === true ? service.resetConfig() : service.patchConfig(body?.patch ?? {});
        send(res, 200, { ok: true, value: { config, file: service.configFile } });
        return;
      }
      send(res, 405, { ok: false, error: { code: "method_not_allowed", message: method } });
      return;
    }
    case "/yeelight/status": {
      if (method !== "GET") {
        send(res, 405, { ok: false, error: { code: "method_not_allowed", message: method } });
        return;
      }
      const status = await runtimeStatus(service.env, service.config());
      send(res, 200, {
        ok: true,
        value: {
          status,
          config: service.config(),
          runtime: { bin: resolveRuntimeBin(service.env, service.config()) ?? status.bin ?? null }
        }
      });
      return;
    }
    case "/yeelight/invoke": {
      if (method !== "POST") {
        send(res, 405, { ok: false, error: { code: "method_not_allowed", message: method } });
        return;
      }
      const body = await readBody(req);
      const config = service.config();
      const dryRun = body?.dry_run === true;
      const confirm = body?.confirm === true;
      if (!dryRun && !confirm) {
        send(res, 200, {
          ok: false,
          error: { code: "confirm_required", message: "Running a live (non-dry-run) request from the card needs confirm: true." }
        });
        return;
      }
      let request;
      if (typeof body?.json === "string" && body.json.trim() !== "") {
        const parsed = parseSkillRequestJson(body.json, config);
        request = parsed.request;
      } else {
        request = buildSkillRequest(
          { utterance: body?.utterance, intent: body?.intent, parameters: body?.parameters, request_id: body?.request_id, locale: body?.locale },
          config
        );
      }
      const outcome = await runInvoke(service.env, () => config, service.logger, request, {
        dryRun,
        timeoutMs: typeof body?.timeout_ms === "number" ? body.timeout_ms : config.requestTimeoutMs
      });
      send(res, 200, { ok: true, value: { outcome, request } });
      return;
    }
    case "/yeelight/logs": {
      if (method !== "GET") {
        send(res, 405, { ok: false, error: { code: "method_not_allowed", message: method } });
        return;
      }
      const limit = Number.parseInt(queryParam(req, "limit") ?? "60", 10) || 60;
      send(res, 200, { ok: true, value: { entries: service.logger.list(Math.min(Math.max(limit, 1), 500)) } });
      return;
    }
    case "/yeelight/logs/detail": {
      if (method !== "GET") {
        send(res, 405, { ok: false, error: { code: "method_not_allowed", message: method } });
        return;
      }
      const id = queryParam(req, "id");
      const entry = id === void 0 ? void 0 : service.logger.detail(id);
      if (entry === void 0) {
        send(res, 404, { ok: false, error: { code: "not_found", message: "no such log entry" } });
        return;
      }
      send(res, 200, { ok: true, value: { entry } });
      return;
    }
    case "/yeelight/logs/clear": {
      if (method !== "POST") {
        send(res, 405, { ok: false, error: { code: "method_not_allowed", message: method } });
        return;
      }
      service.logger.clear();
      send(res, 200, { ok: true, value: { cleared: true } });
      return;
    }
    case "/yeelight/docs": {
      if (method !== "GET") {
        send(res, 405, { ok: false, error: { code: "method_not_allowed", message: method } });
        return;
      }
      const docs = [...referenceIndex(service.dataDir).values()].map((doc) => ({
        key: doc.key,
        label: doc.label,
        kind: doc.kind,
        bytes: doc.bytes
      }));
      send(res, 200, { ok: true, value: { docs } });
      return;
    }
    case "/yeelight/request-id": {
      send(res, 200, { ok: true, value: { requestId: newRequestId() } });
      return;
    }
    default:
      send(res, 404, { ok: false, error: { code: "not_found", message: path } });
  }
}

// src/index.ts
function apply(ctx, options = {}) {
  const env = process.env;
  const home = options.home ?? pluginHome(env);
  const dir = options.dataDir ?? dataDir();
  const store = openConfigStore(home);
  const logger = openInvokeLogger(home, () => store.current());
  const service = {
    env,
    dataDir: dir,
    config: () => store.current(),
    resolver: { resolveBin: () => resolveRuntimeBin(env, store.current()) }
  };
  const routes = {
    env,
    dataDir: dir,
    config: () => store.current(),
    configFile: store.file,
    logger: {
      append: (entry) => logger.append(entry),
      list: (limit) => logger.list(limit),
      detail: (id) => logger.detail(id),
      clear: () => logger.clear(),
      enabled: () => logger.enabled()
    },
    patchConfig: (patch) => store.patch(patch),
    resetConfig: () => store.reset()
  };
  ctx.inject(["tools"], (scope) => {
    try {
      registerTools(scope.tools, service, logger);
    } catch (error) {
      console.error(`[yeelight-smart-home] tool registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  ctx.inject(["skills"], (scope) => {
    try {
      const dispose = registerSkill(scope.skills, dir);
      if (typeof dispose === "function") ctx.effect(() => dispose, "yeelight-smart-home: skill");
    } catch (error) {
      console.error(`[yeelight-smart-home] skill registration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  ctx.inject(["settings"], (scope) => {
    try {
      const passThrough = (value) => ({ ...value ?? {} });
      Object.assign(passThrough, {
        toJSON: () => ({ uid: 0, refs: { 0: { type: "object", meta: { default: {} }, dict: {} } } })
      });
      scope.settings.register(
        "yeelight-smart-home",
        passThrough,
        { base: {} }
      );
    } catch (error) {
      console.error(`[yeelight-smart-home] settings namespace skipped: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  ctx.inject(["webServer"], (scope) => {
    try {
      registerYeelightRoutes(scope.webServer, routes);
    } catch (error) {
      console.error(`[yeelight-smart-home] /yeelight routes skipped: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  ctx.provide?.("yeelightHome", {
    config: () => store.current(),
    configFile: store.file,
    home,
    dataDir: dir,
    invoke: (request, options2) => runInvoke(env, () => store.current(), logger, request, options2)
  });
}
export {
  apply
};
//# sourceMappingURL=index.js.map
