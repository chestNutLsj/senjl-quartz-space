#!/usr/bin/env bash
set -euo pipefail

REPO="/Users/senjl/MyProject/blog/senjl-quartz-space"
VAULT="/Users/senjl/OneDrive/Documents/Obsidian/my-cs-career"
CONTENT="$REPO/content"

APPLY=0
ALLOW_DIRTY=0

usage() {
  cat <<'USAGE'
Usage: scripts/sync-vault-to-content.sh [--apply] [--allow-dirty]

Sync the OneDrive Obsidian vault into the Quartz content directory before
building or publishing the blog.

Default mode is a dry-run. Pass --apply to write changes.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      APPLY=1
      ;;
    --allow-dirty)
      ALLOW_DIRTY=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

if [[ ! -d "$VAULT" ]]; then
  echo "Vault directory does not exist: $VAULT" >&2
  exit 1
fi

if [[ ! -d "$CONTENT" ]]; then
  echo "Content directory does not exist: $CONTENT" >&2
  exit 1
fi

cd "$REPO"

if [[ "$ALLOW_DIRTY" -eq 0 && -n "$(git status --porcelain)" ]]; then
  echo "Git worktree is not clean. Review, commit, or stash changes before syncing." >&2
  echo "Use --allow-dirty only when you intentionally want to sync over local changes." >&2
  git status --short >&2
  exit 1
fi

RSYNC_ARGS=(
  -av
  --delete
  --exclude=.obsidian/
  --exclude=.trash/
  --exclude=.claude/
  --exclude=.DS_Store
  --exclude=**/.DS_Store
  --exclude=Thumbs.db
  --exclude=desktop.ini
  --exclude=.OneDrive*
)

if [[ "$APPLY" -eq 0 ]]; then
  echo "Dry-run: $VAULT/ -> $CONTENT/"
  rsync -n "${RSYNC_ARGS[@]}" "$VAULT/" "$CONTENT/"
  echo
  echo "No files were changed. Re-run with --apply to sync."
else
  echo "Syncing: $VAULT/ -> $CONTENT/"
  rsync "${RSYNC_ARGS[@]}" "$VAULT/" "$CONTENT/"
  echo
  git status --short
fi
