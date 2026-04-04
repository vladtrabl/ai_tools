#!/usr/bin/env node

import { select, checkbox, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function banner() {
  console.log();
  console.log(
    chalk.cyan.bold("  ╔══════════════════════════════════════════════╗")
  );
  console.log(
    chalk.cyan.bold("  ║") +
      chalk.white.bold("   AI Tools Setup — Agent & Skill Installer   ") +
      chalk.cyan.bold("║")
  );
  console.log(
    chalk.cyan.bold("  ╚══════════════════════════════════════════════╝")
  );
  console.log();
}

function sourceDir(tool) {
  return path.join(REPO_ROOT, tool);
}

function destinationBase(tool, level) {
  if (level === "user") {
    return path.join(os.homedir(), `.${tool}`);
  }
  return path.join(process.cwd(), `.${tool}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function listFiles(dir, filter) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => (filter ? filter(f) : true))
    .map((f) => path.join(dir, f));
}

function listSubDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function copyFileSafe(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDirRecursive(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function stripMdExtension(filename) {
  return filename.replace(/\.md$/, "");
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------------------------------------------------------------
// Dynamic item discovery
// ---------------------------------------------------------------------------

/** Discover available agents across tools, returning merged list with tool info. */
function discoverAgents(tools) {
  const agentMap = new Map();

  for (const tool of tools) {
    const agentDir = path.join(sourceDir(tool), "agents");
    for (const f of listFiles(agentDir, (n) => n.endsWith(".md"))) {
      const name = stripMdExtension(path.basename(f));
      if (!agentMap.has(name)) {
        agentMap.set(name, { name, tools: [] });
      }
      agentMap.get(name).tools.push(tool);
    }
  }

  return [...agentMap.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Discover available skills across tools, returning merged list with tool info. */
function discoverSkills(tools) {
  const skillMap = new Map();

  for (const tool of tools) {
    const skillsDir = path.join(sourceDir(tool), "skills");
    for (const name of listSubDirs(skillsDir)) {
      if (!skillMap.has(name)) {
        skillMap.set(name, { name, tools: [] });
      }
      skillMap.get(name).tools.push(tool);
    }
  }

  return [...skillMap.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Discover available rules across tools, returning merged list with tool info. */
function discoverRules(tools) {
  const ruleMap = new Map();

  for (const tool of tools) {
    const rulesDir = path.join(sourceDir(tool), "rules");
    for (const f of listFiles(rulesDir, (n) => n.endsWith(".md"))) {
      if (fs.statSync(f).isDirectory()) continue;
      const name = stripMdExtension(path.basename(f));
      if (!ruleMap.has(name)) {
        ruleMap.set(name, { name, tools: [] });
      }
      ruleMap.get(name).tools.push(tool);
    }
  }

  return [...ruleMap.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Discover available templates (always from claude/rules/templates/). */
function discoverTemplates() {
  const templatesDir = path.join(REPO_ROOT, "claude", "rules", "templates");
  if (!fs.existsSync(templatesDir)) return [];
  return listFiles(templatesDir, (n) => n.endsWith(".md"))
    .map((f) => stripMdExtension(path.basename(f)))
    .sort();
}

/** Format the tool availability suffix for display. */
function toolSuffix(itemTools, allTools) {
  if (allTools.length <= 1) return "";
  const both = itemTools.length === allTools.length;
  if (both) return ` (${itemTools.map(capitalize).join(" + ")})`;
  return ` (${itemTools.map(capitalize).join(" + ")} only)`;
}

// ---------------------------------------------------------------------------
// Sub-selection prompts
// ---------------------------------------------------------------------------

async function selectAgents(tools) {
  const agents = discoverAgents(tools);
  if (agents.length === 0) return [];

  const selected = await checkbox({
    message: "Select agents to install:",
    choices: agents.map((a) => ({
      name: `${a.name}${toolSuffix(a.tools, tools)}`,
      value: a.name,
      checked: true,
    })),
  });

  return selected;
}

async function selectSkills(tools) {
  const skills = discoverSkills(tools);
  if (skills.length === 0) return [];

  const selected = await checkbox({
    message: "Select skills to install:",
    choices: skills.map((s) => ({
      name: `${s.name}${toolSuffix(s.tools, tools)}`,
      value: s.name,
      checked: true,
    })),
  });

  return selected;
}

async function selectRules(tools) {
  const rules = discoverRules(tools);
  if (rules.length === 0) return [];

  const selected = await checkbox({
    message: "Select rules to install:",
    choices: rules.map((r) => ({
      name: `${r.name}${toolSuffix(r.tools, tools)}`,
      value: r.name,
      checked: true,
    })),
  });

  return selected;
}

async function selectTemplates() {
  const templates = discoverTemplates();
  if (templates.length === 0) return [];

  const selected = await checkbox({
    message: "Select rule templates to install:",
    choices: templates.map((t) => ({
      name: capitalize(t),
      value: t,
      checked: false,
    })),
  });

  return selected;
}

// ---------------------------------------------------------------------------
// Build copy plan
// ---------------------------------------------------------------------------

function buildPlan(
  tool,
  level,
  components,
  { agents = [], skills = [], rules = [], templates = [] }
) {
  const src = sourceDir(tool);
  const dest = destinationBase(tool, level);
  const tasks = [];
  const counts = { agents: 0, skills: 0, rules: 0, templates: 0 };

  if (components.includes("agents")) {
    const agentDir = path.join(src, "agents");
    for (const agentName of agents) {
      const filePath = path.join(agentDir, `${agentName}.md`);
      if (fs.existsSync(filePath)) {
        tasks.push({
          src: filePath,
          dest: path.join(dest, "agents", `${agentName}.md`),
          category: "agents",
          label: `agents/${agentName}.md`,
        });
        counts.agents++;
      }
    }
  }

  if (components.includes("skills")) {
    const skillsDir = path.join(src, "skills");
    for (const skillName of skills) {
      const skillSrc = path.join(skillsDir, skillName);
      if (fs.existsSync(skillSrc)) {
        const skillDest = path.join(dest, "skills", skillName);
        tasks.push({
          src: skillSrc,
          dest: skillDest,
          category: "skills",
          label: `skills/${skillName}/`,
          isDir: true,
        });
        counts.skills++;
      }
    }
  }

  if (components.includes("rules")) {
    const rulesDir = path.join(src, "rules");
    for (const ruleName of rules) {
      const filePath = path.join(rulesDir, `${ruleName}.md`);
      if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
        tasks.push({
          src: filePath,
          dest: path.join(dest, "rules", `${ruleName}.md`),
          category: "rules",
          label: `rules/${ruleName}.md`,
        });
        counts.rules++;
      }
    }
  }

  if (components.includes("templates") && templates.length > 0) {
    const templatesDir = path.join(REPO_ROOT, "claude", "rules", "templates");
    for (const tpl of templates) {
      const srcFile = path.join(templatesDir, `${tpl}.md`);
      if (fs.existsSync(srcFile)) {
        tasks.push({
          src: srcFile,
          dest: path.join(dest, "rules", `${tpl}.md`),
          category: "templates",
          label: `rules/${tpl}.md (template)`,
        });
        counts.templates++;
      }
    }
  }

  return { tasks, counts };
}

// ---------------------------------------------------------------------------
// Overwrite check — per-category handling
// ---------------------------------------------------------------------------

async function checkOverwrites(tasks) {
  // Group existing files by category
  const conflictsByCategory = new Map();

  for (const t of tasks) {
    if (fs.existsSync(t.dest)) {
      if (!conflictsByCategory.has(t.category)) {
        conflictsByCategory.set(t.category, []);
      }
      conflictsByCategory.get(t.category).push(t);
    }
  }

  if (conflictsByCategory.size === 0) return tasks;

  console.log(chalk.yellow("\n  Existing files detected:"));
  for (const [category, files] of conflictsByCategory) {
    console.log(
      chalk.yellow(`    ${category}: ${files.length} file(s) would be overwritten`)
    );
  }
  console.log();

  const categoriesToSkip = new Set();

  for (const [category, files] of conflictsByCategory) {
    const action = await select({
      message: `${category}: ${files.length} existing file(s) found. What to do?`,
      choices: [
        { name: "Overwrite", value: "overwrite" },
        { name: "Skip this category", value: "skip" },
        { name: "Cancel installation", value: "cancel" },
      ],
    });

    if (action === "cancel") {
      return null;
    }
    if (action === "skip") {
      categoriesToSkip.add(category);
    }
  }

  if (categoriesToSkip.size === 0) return tasks;

  return tasks.filter((t) => !categoriesToSkip.has(t.category));
}

// ---------------------------------------------------------------------------
// Confirmation display — grouped by category
// ---------------------------------------------------------------------------

function showConfirmation(tasks) {
  const grouped = new Map();

  for (const task of tasks) {
    if (!grouped.has(task.category)) {
      grouped.set(task.category, []);
    }
    grouped.get(task.category).push(task);
  }

  console.log();
  console.log(chalk.cyan.bold("  Planned installation:"));

  const categoryLabels = {
    agents: "Agents",
    skills: "Skills",
    rules: "Rules",
    templates: "Templates",
  };

  for (const [category, items] of grouped) {
    const label = categoryLabels[category] || capitalize(category);
    console.log(chalk.white.bold(`    ${label} (${items.length}):`));
    for (const item of items) {
      const destRelative = item.dest.startsWith(os.homedir())
        ? item.dest.replace(os.homedir(), "~")
        : item.dest;
      console.log(chalk.white(`      → ${destRelative}`));
    }
  }

  console.log();
}

// ---------------------------------------------------------------------------
// Execute copy
// ---------------------------------------------------------------------------

async function executePlan(tasks) {
  const spinner = ora({ text: "Copying files...", color: "cyan" }).start();
  let copied = 0;
  let errors = 0;

  for (const task of tasks) {
    spinner.text = `Copying ${task.label}`;
    try {
      if (task.isDir) {
        copyDirRecursive(task.src, task.dest);
      } else {
        copyFileSafe(task.src, task.dest);
      }
      copied++;
    } catch (err) {
      errors++;
      spinner.warn(chalk.red(`Failed to copy ${task.label}: ${err.message}`));
      spinner.start();
    }
  }

  if (errors > 0) {
    spinner.warn(
      chalk.yellow(
        `Completed with ${errors} error(s), ${copied} file(s) copied`
      )
    );
  } else {
    spinner.succeed(chalk.green(`All ${copied} item(s) copied successfully`));
  }

  return { copied, errors };
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function showSummary(tools, level, counts, copied, errors) {
  console.log();
  console.log(chalk.cyan.bold("  Installation Summary"));
  console.log(chalk.cyan("  " + "─".repeat(40)));

  const toolNames = tools.map((t) => capitalize(t));
  console.log(chalk.white(`  Tool(s):    ${toolNames.join(", ")}`));
  console.log(
    chalk.white(
      `  Level:      ${level === "user" ? "User-level (~/.)" : "Project-level (./)"}`
    )
  );

  if (counts.agents > 0)
    console.log(chalk.green(`  Agents:     ${counts.agents}`));
  if (counts.skills > 0)
    console.log(chalk.green(`  Skills:     ${counts.skills}`));
  if (counts.rules > 0)
    console.log(chalk.green(`  Rules:      ${counts.rules}`));
  if (counts.templates > 0)
    console.log(chalk.green(`  Templates:  ${counts.templates}`));

  if (errors > 0) {
    console.log(chalk.red(`  Errors:     ${errors}`));
  }

  console.log();
  console.log(chalk.green.bold("  Done!"));
  console.log();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  banner();

  // 1. Select tool
  const toolChoice = await select({
    message: "Which tool do you want to configure?",
    choices: [
      { name: "Claude", value: "claude" },
      { name: "Cursor", value: "cursor" },
      { name: "Both", value: "both" },
    ],
  });

  const tools = toolChoice === "both" ? ["claude", "cursor"] : [toolChoice];

  // 2. Select level
  const level = await select({
    message: "Installation level:",
    choices: [
      {
        name: "User-level (installs to ~/.<tool>/)",
        value: "user",
      },
      {
        name: "Project-level (installs to ./.<tool>/ in current directory)",
        value: "project",
      },
    ],
  });

  // 3. Select components (all main components checked by default)
  const components = await checkbox({
    message: "Select components to install:",
    choices: [
      { name: "Agents", value: "agents", checked: true },
      { name: "Skills", value: "skills", checked: true },
      { name: "Rules (universal)", value: "rules", checked: true },
      { name: "Rule Templates (stack-specific)", value: "templates", checked: false },
    ],
    required: true,
  });

  // 4. Granular sub-selection per component (once, applied to all tools)
  let selectedAgents = [];
  let selectedSkills = [];
  let selectedRules = [];
  let selectedTemplates = [];

  if (components.includes("agents")) {
    selectedAgents = await selectAgents(tools);
  }

  if (components.includes("skills")) {
    selectedSkills = await selectSkills(tools);
  }

  if (components.includes("rules")) {
    selectedRules = await selectRules(tools);
  }

  if (components.includes("templates")) {
    selectedTemplates = await selectTemplates();
  }

  // 5. Build plans for all selected tools
  const selections = {
    agents: selectedAgents,
    skills: selectedSkills,
    rules: selectedRules,
    templates: selectedTemplates,
  };

  const allTasks = [];
  const totalCounts = {
    agents: 0,
    skills: 0,
    rules: 0,
    templates: 0,
  };

  for (const tool of tools) {
    const { tasks, counts } = buildPlan(tool, level, components, selections);
    allTasks.push(...tasks);
    for (const key of Object.keys(totalCounts)) {
      totalCounts[key] += counts[key];
    }
  }

  if (allTasks.length === 0) {
    console.log(chalk.yellow("\n  Nothing to install. Exiting."));
    return;
  }

  // 6. Confirmation — grouped by category
  showConfirmation(allTasks);

  const proceed = await confirm({
    message: `Install ${allTasks.length} item(s)?`,
    default: true,
  });

  if (!proceed) {
    console.log(chalk.yellow("\n  Installation cancelled."));
    return;
  }

  // 7. Check for overwrites — per-category handling
  const resolvedTasks = await checkOverwrites(allTasks);

  if (resolvedTasks === null) {
    console.log(
      chalk.yellow("\n  Installation cancelled.")
    );
    return;
  }

  if (resolvedTasks.length === 0) {
    console.log(chalk.yellow("\n  All categories skipped. Nothing to install."));
    return;
  }

  // Recalculate counts after possible skips
  const finalCounts = {
    agents: 0,
    skills: 0,
    rules: 0,
    templates: 0,
  };
  for (const t of resolvedTasks) {
    finalCounts[t.category]++;
  }

  // 8. Execute
  const { copied, errors } = await executePlan(resolvedTasks);

  // 9. Summary
  showSummary(tools, level, finalCounts, copied, errors);
}

main().catch((err) => {
  if (err.name === "ExitPromptError") {
    console.log(chalk.yellow("\n  Setup cancelled."));
    process.exit(0);
  }
  console.error(chalk.red(`\n  Error: ${err.message}`));
  process.exit(1);
});
