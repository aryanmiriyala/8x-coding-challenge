#!/usr/bin/env python3
"""Sync current Antigravity agent transcript into .agent-logs/ session markdown."""

import datetime as dt
import json
import os
from pathlib import Path
import re
import sys

AUTHOR = "aryanmiriyala"
TOOL = "antigravity-cli"
MODEL = "gemini-3.8-flash"
PROJECT = "8x-coding-challenge"
SESSION_ID = "ba7c8574-e350-40fd-98bf-e6ce8b0c92b6"


def safe_session_id(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]", "_", value)

def redact_content(content: str) -> str:
    """Redact potential credentials and secrets from logs."""
    # Redact URLs containing passwords (like postgresql urls)
    content = re.sub(r'(postgresql:\/\/[^:]+:)[^@]+(@.*?)', r'\1[REDACTED]\2', content)
    # Redact specific secrets
    content = re.sub(r'(NEON_AUTH_COOKIE_SECRET=).*?(\n|\r|$)', r'\1[REDACTED]\2', content)
    content = re.sub(r'(AWS_SECRET_ACCESS_KEY=).*?(\n|\r|$)', r'\1[REDACTED]\2', content)
    # Redact any other obvious keys
    content = re.sub(r'([A-Za-z0-9_-]+_SECRET(?:_KEY)?\s*[:=]\s*)[\w\-]+', r'\1[REDACTED]', content)
    return content

def sync_transcript_to_log(transcript_path: Path, log_dir: Path) -> Path:
    log_dir.mkdir(parents=True, exist_ok=True)
    
    exchanges = []
    current_prompt = None
    
    with transcript_path.open("r", encoding="utf-8") as f:
        for line in f:
            data = json.loads(line)
            step_type = data.get("type")
            content = data.get("content", "")
            created_at = data.get("created_at")
            
            if step_type == "USER_INPUT":
                m = re.search(r"<USER_REQUEST>\s*(.*?)\s*</USER_REQUEST>", content, re.DOTALL)
                clean_prompt = m.group(1).strip() if m else content.strip()
                current_prompt = {
                    "timestamp": created_at,
                    "prompt": redact_content(clean_prompt),
                }
            elif step_type == "PLANNER_RESPONSE" and not data.get("tool_calls"):
                if current_prompt is not None and content.strip():
                    exchanges.append({
                        "prompt_time": current_prompt["timestamp"],
                        "prompt": current_prompt["prompt"],
                        "response_time": created_at,
                        "response": redact_content(content.strip()),
                    })
                    current_prompt = None

    if not exchanges and not current_prompt:
        print("No exchanges found.")
        sys.exit(1)

    first_time = exchanges[0]["prompt_time"] if exchanges else current_prompt["timestamp"]
    last_time = exchanges[-1]["response_time"] if exchanges else current_prompt["timestamp"]
    if current_prompt:
        last_time = current_prompt["timestamp"]

    total_exchanges = len(exchanges) + (1 if current_prompt else 0)

    stamp = first_time[:19].replace("T", "_").replace(":", "-")
    log_file = log_dir / f"{stamp}_{safe_session_id(SESSION_ID)}.md"

    lines = [
        "---",
        f'session_id: "{SESSION_ID}"',
        f'date: {first_time[:10]}',
        f'author: "{AUTHOR}"',
        f'model: "{MODEL}"',
        f'tool: "{TOOL}"',
        f'project: "{PROJECT}"',
        f'total_exchanges: {total_exchanges}',
        f'first_prompt_time: {first_time}',
        f'last_prompt_time: {last_time}',
        "---",
        "",
        f"# Session Log - {first_time[:10]}",
        "",
        f"Session: `{SESSION_ID[:8]}` | Project: `{PROJECT}` | Author: `{AUTHOR}`",
        "",
        "---",
        "",
    ]

    for i, ex in enumerate(exchanges, 1):
        lines.append(f"[LOG_ENTRY type=PROMPT num={i} session={SESSION_ID[:8]}]")
        lines.append(f"timestamp: {ex['prompt_time']}")
        lines.append(f"model: {MODEL}")
        lines.append("")
        lines.append(ex["prompt"])
        lines.append("")
        lines.append("")
        lines.append(f"[LOG_ENTRY type=RESPONSE num={i} session={SESSION_ID[:8]}]")
        lines.append(f"timestamp: {ex['response_time']}")
        lines.append(f"model: {MODEL}")
        lines.append("")
        lines.append(ex["response"])
        lines.append("")
        lines.append("")

    if current_prompt:
        num = len(exchanges) + 1
        lines.append(f"[LOG_ENTRY type=PROMPT num={num} session={SESSION_ID[:8]}]")
        lines.append(f"timestamp: {current_prompt['timestamp']}")
        lines.append(f"model: {MODEL}")
        lines.append("")
        lines.append(current_prompt["prompt"])
        lines.append("")

    content = "\n".join(lines)
    log_file.write_text(content, encoding="utf-8")
    print(f"Wrote session log to {log_file} with {total_exchanges} exchanges.")
    return log_file


def main():
    repo_root = Path(os.popen("git rev-parse --show-toplevel").read().strip()).resolve()
    log_dir = repo_root / ".agent-logs"
    transcript_path = Path(
        f"/Users/aryanmiriyala/.gemini/antigravity-cli/brain/{SESSION_ID}/.system_generated/logs/transcript_full.jsonl"
    )
    sync_transcript_to_log(transcript_path, log_dir)


if __name__ == "__main__":
    main()
