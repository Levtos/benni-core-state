"""Authorized, idempotent Core-State UX commands.

The browser submits only these names.  No legacy service, entity, WebSocket
namespace, or frontend store is part of the command boundary.
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from . import wake_config
from .const import BIO_AWAKE, BIO_SLEEP
from .contracts import command_ack


COMMANDS = frozenset(
    {
        "bio.mark_sleep",
        "bio.mark_awake",
        "wake.profile.update",
        "wake.rule.upsert",
        "wake.rule.remove",
        "wake.settings.update",
        "wake.config.rollback",
    }
)


def _payload(value: Mapping[str, Any] | None) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


async def async_execute_command(
    coord: Any,
    *,
    request_id: str,
    command: str,
    payload: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Validate, execute and persist one request-id keyed command result."""

    request_id = str(request_id or "").strip()
    command = str(command or "").strip()
    if not request_id or len(request_id) > 128:
        return command_ack(
            request_id=request_id,
            status="error",
            command=command,
            error="request_id_invalid",
        )
    if len(command) > 96 or command not in COMMANDS:
        return command_ack(
            request_id=request_id,
            status="error",
            command=command,
            error="command_not_allowed",
        )

    cached = coord._ux_command_results.get(request_id)
    if isinstance(cached, dict):
        if cached.get("command") == command:
            return dict(cached)
        return command_ack(
            request_id=request_id,
            status="error",
            command=command,
            error="request_id_reused",
        )

    values = _payload(payload)
    try:
        if command == "bio.mark_sleep":
            await coord.async_apply_bio_command(BIO_SLEEP)
        elif command == "bio.mark_awake":
            await coord.async_apply_bio_command(BIO_AWAKE)
        elif command == "wake.profile.update":
            profile_id = str(values.get("profile_id") or "")
            patch = values.get("values", values.get("patch", {}))
            if not isinstance(patch, Mapping):
                raise ValueError("profile_patch_invalid")
            updated = wake_config.update_profile(coord.wake_config, profile_id, patch)
            await coord.async_save_wake_config(updated)
            await coord.async_request_refresh()
        elif command == "wake.rule.upsert":
            rule = values.get("rule", values)
            if not isinstance(rule, Mapping):
                raise ValueError("rule_invalid")
            updated = wake_config.upsert_rule(coord.wake_config, rule)
            await coord.async_save_wake_config(updated)
            await coord.async_request_refresh()
        elif command == "wake.rule.remove":
            rule_id = str(values.get("rule_id") or values.get("id") or "")
            updated = wake_config.remove_rule(coord.wake_config, rule_id)
            await coord.async_save_wake_config(updated)
            await coord.async_request_refresh()
        elif command == "wake.settings.update":
            patch = values.get("values", values.get("patch", values))
            if not isinstance(patch, Mapping):
                raise ValueError("settings_patch_invalid")
            updated = wake_config.update_settings(coord.wake_config, patch)
            await coord.async_save_wake_config(updated)
            await coord.async_request_refresh()
        elif command == "wake.config.rollback":
            updated = wake_config.rollback_config(coord.wake_config)
            await coord.async_save_wake_config(updated)
            await coord.async_request_refresh()
    except (TypeError, ValueError, KeyError) as err:
        result = command_ack(
            request_id=request_id,
            status="error",
            command=command,
            error=str(err) or "command_invalid",
        )
    else:
        result = command_ack(
            request_id=request_id,
            status="success",
            command=command,
        )

    coord._ux_command_results[request_id] = result
    await coord.async_save_ux_command_results()
    return result
