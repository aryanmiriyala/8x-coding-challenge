#!/usr/bin/env python3
"""Append Codex prompt/response hook events to public assignment logs."""

from __future__ import annotations

import datetime as dt
import fcntl
import json
import os
from pathlib import Path
import re
import sys


AUTHOR = "aryanmiriyala"
TOOL = "codex-cli"


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="milliseconds").replace(
        "+00:00", "Z"
    )


def yaml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def safe_session_id(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]", "_", value)


def find_log(log_dir: Path, session_id: str) -> Path | None:
    matches = sorted(log_dir.glob(f"*_{safe_session_id(session_id)}.md"))
    return matches[0] if matches else None


def replace_frontmatter_field(text: str, field: str, value: str) -> str:
    pattern = rf"(?m)^{re.escape(field)}: .*$"
    return re.sub(pattern, f"{field}: {value}", text, count=1)


def add_prompt(
    log_dir: Path,
    session_id: str,
    model: str,
    project: str,
    timestamp: str,
    prompt: str,
) -> None:
    path = find_log(log_dir, session_id)
    if path is None:
        stamp = timestamp[:19].replace("T", "_").replace(":", "-")
        path = log_dir / f"{stamp}_{safe_session_id(session_id)}.md"
        header = (
            "---\n"
            f"session_id: {yaml_string(session_id)}\n"
            f"date: {timestamp[:10]}\n"
            f"author: {yaml_string(AUTHOR)}\n"
            f"model: {yaml_string(model)}\n"
            f"tool: {yaml_string(TOOL)}\n"
            f"project: {yaml_string(project)}\n"
            "total_exchanges: 0\n"
            f"first_prompt_time: {timestamp}\n"
            f"last_prompt_time: {timestamp}\n"
            "---\n\n"
            f"# Session Log - {timestamp[:10]}\n\n"
            f"Session: `{session_id[:8]}` | Project: `{project}` | Author: `{AUTHOR}`\n\n"
            "---\n"
        )
        path.write_text(header, encoding="utf-8")

    with path.open("r+", encoding="utf-8") as handle:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        current = handle.read()
        prompt_count = current.count("[LOG_ENTRY type=PROMPT ")
        entry_num = prompt_count + 1
        current = replace_frontmatter_field(current, "total_exchanges", str(entry_num))
        current = replace_frontmatter_field(current, "last_prompt_time", timestamp)
        entry = (
            "\n\n"
            f"[LOG_ENTRY type=PROMPT num={entry_num} session={session_id[:8]}]\n"
            f"timestamp: {timestamp}\n"
            f"model: {model}\n\n"
            f"{prompt}"
        )
        if not prompt.endswith("\n"):
            entry += "\n"
        handle.seek(0)
        handle.write(current + entry)
        handle.truncate()


def add_response(
    log_dir: Path,
    session_id: str,
    model: str,
    project: str,
    timestamp: str,
    response: str,
) -> None:
    path = find_log(log_dir, session_id)
    if path is None:
        # A missing prompt means capture was enabled mid-turn; retain the response
        # in a valid session file rather than silently losing it.
        add_prompt(log_dir, session_id, model, project, timestamp, "[prompt unavailable]")
        path = find_log(log_dir, session_id)
        assert path is not None

    with path.open("a", encoding="utf-8") as handle:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX)
        current = path.read_text(encoding="utf-8")
        response_num = current.count("[LOG_ENTRY type=RESPONSE ") + 1
        entry = (
            "\n\n"
            f"[LOG_ENTRY type=RESPONSE num={response_num} session={session_id[:8]}]\n"
            f"timestamp: {timestamp}\n"
            f"model: {model}\n\n"
            f"{response}"
        )
        if not response.endswith("\n"):
            entry += "\n"
        handle.write(entry)


def main() -> int:
    payload = json.load(sys.stdin)
    event = payload.get("hook_event_name", "")
    session_id = str(payload.get("session_id", "unknown-session"))
    model = str(payload.get("model", "unknown-model"))
    repo_root = Path(
        os.environ.get("CODEX_REPO_ROOT")
        or os.popen("git rev-parse --show-toplevel").read().strip()
        or payload.get("cwd", ".")
    ).resolve()
    log_dir = repo_root / ".agent-logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    project = repo_root.name
    timestamp = utc_now()

    if event == "UserPromptSubmit":
        add_prompt(
            log_dir,
            session_id,
            model,
            project,
            timestamp,
            str(payload.get("prompt", "")),
        )
    elif event == "Stop":
        response = payload.get("last_assistant_message")
        add_response(
            log_dir,
            session_id,
            model,
            project,
            timestamp,
            "" if response is None else str(response),
        )

    # Stop hooks require valid JSON on stdout; this is also accepted by
    # UserPromptSubmit and has no effect on the conversation.
    json.dump({"continue": True}, sys.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
