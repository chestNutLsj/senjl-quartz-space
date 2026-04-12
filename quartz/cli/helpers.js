import { isCancel, outro } from "@clack/prompts"
import { styleText } from "util"
import { contentCacheFolder } from "./constants.js"
import { spawnSync } from "child_process"
import fs from "fs"
import path from "path"

async function pathExists(fp) {
  try {
    await fs.promises.access(fp)
    return true
  } catch {
    return false
  }
}

async function safeRename(src, dest) {
  try {
    await fs.promises.rename(src, dest)
    return true
  } catch (err) {
    // EXDEV happens if rename crosses devices; fall back to copy
    if (err && (err.code === "EXDEV" || err.code === "EPERM")) {
      return false
    }
    throw err
  }
}

function timestampSuffix() {
  const iso = new Date().toISOString().replace(/[:.]/g, "-")
  return `${iso}-${process.pid}`
}

export function escapePath(fp) {
  return fp
    .replace(/\\ /g, " ") // unescape spaces
    .replace(/^"(.*)"$/, "$1")
    .replace(/^'(.*)'$/, "$1")
    .trim()
}

export function exitIfCancel(val) {
  if (isCancel(val)) {
    outro(styleText("red", "Exiting"))
    process.exit(0)
  } else {
    return val
  }
}

export async function stashContentFolder(contentFolder) {
  const contentExists = await pathExists(contentFolder)
  const cacheExists = await pathExists(contentCacheFolder)

  // If content is already missing but a cache exists, don't wipe the cache.
  // This situation typically happens when a previous update was interrupted.
  if (!contentExists) {
    if (cacheExists) {
      throw new Error(
        chalk.red(
          `Content folder not found at '${contentFolder}', but a cache exists at '${contentCacheFolder}'. Run 'npx quartz restore' to recover your content before updating again.`,
        ),
      )
    }
    throw new Error(chalk.red(`Content folder not found at '${contentFolder}'.`))
  }

  await fs.promises.mkdir(path.dirname(contentCacheFolder), { recursive: true })

  // Stage backup in a temp folder first so we never delete the last good cache.
  const tempCacheFolder = `${contentCacheFolder}.tmp-${timestampSuffix()}`
  await fs.promises.rm(tempCacheFolder, { force: true, recursive: true })

  // Prefer atomic move (fast + safer); fall back to copy+delete.
  const moved = await safeRename(contentFolder, tempCacheFolder)
  if (!moved) {
    await fs.promises.cp(contentFolder, tempCacheFolder, {
      force: true,
      recursive: true,
      verbatimSymlinks: true,
      preserveTimestamps: true,
    })
    await fs.promises.rm(contentFolder, { force: true, recursive: true })
  }

  // Replace cache only after backup is safely staged.
  await fs.promises.rm(contentCacheFolder, { force: true, recursive: true })
  await fs.promises.rename(tempCacheFolder, contentCacheFolder)
}

export function gitPull(origin, branch) {
  const flags = ["--no-rebase", "--autostash", "-s", "recursive", "-X", "ours", "--no-edit"]
  const out = spawnSync("git", ["pull", ...flags, origin, branch], { stdio: "inherit" })
  if (out.stderr) {
    throw new Error(styleText("red", `Error while pulling updates: ${out.stderr}`))
  } else if (out.status !== 0) {
    throw new Error(styleText("red", "Error while pulling updates"))
  }
}

export async function popContentFolder(contentFolder) {
  const cacheExists = await pathExists(contentCacheFolder)
  if (!cacheExists) {
    throw new Error(
      chalk.red(
        `No cached content found at '${contentCacheFolder}'. Nothing to restore.`,
      ),
    )
  }

  const existingContent = await pathExists(contentFolder)
  const contentBackupFolder = `${contentFolder}.bak-${timestampSuffix()}`

  // Keep a safety backup of whatever is currently in contentFolder.
  if (existingContent) {
    await fs.promises.rm(contentBackupFolder, { force: true, recursive: true })
    const moved = await safeRename(contentFolder, contentBackupFolder)
    if (!moved) {
      await fs.promises.cp(contentFolder, contentBackupFolder, {
        force: true,
        recursive: true,
        verbatimSymlinks: true,
        preserveTimestamps: true,
      })
      await fs.promises.rm(contentFolder, { force: true, recursive: true })
    }
  } else {
    await fs.promises.rm(contentFolder, { force: true, recursive: true })
  }

  // Restore from cache. Prefer atomic move; fall back to copy.
  const restoredByMove = await safeRename(contentCacheFolder, contentFolder)
  if (!restoredByMove) {
    await fs.promises.cp(contentCacheFolder, contentFolder, {
      force: true,
      recursive: true,
      verbatimSymlinks: true,
      preserveTimestamps: true,
    })
    await fs.promises.rm(contentCacheFolder, { force: true, recursive: true })
  }

  // Cleanup safety backup only after successful restore.
  if (existingContent) {
    await fs.promises.rm(contentBackupFolder, { force: true, recursive: true })
  }
}
