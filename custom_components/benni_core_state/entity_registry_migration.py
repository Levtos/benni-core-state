"""Pure helpers for the Startup-/Apply-Ready entity-ID contract."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Final, Literal

from .const import DEFAULT_PROFILE, PROFILE_LABELS

STARTUP_APPLY_READY_DOMAIN: Final = "binary_sensor"
STARTUP_APPLY_READY_SUFFIX: Final = "apply_ready"
STARTUP_APPLY_READY_ENTITY_ID: Final = (
    "binary_sensor.benni_core_state_apply_ready"
)

# This is the exact alternate registry path observed in the Benni HA instance
# on 2026-08-06.  Do not broaden this list without a matching registry finding.
STARTUP_APPLY_READY_LIVE_MISMATCH_ENTITY_ID: Final = (
    "binary_sensor.system_benni_core_state_apply_ready"
)
LEGACY_STARTUP_APPLY_READY_ENTITY_IDS: Final = frozenset(
    {STARTUP_APPLY_READY_LIVE_MISMATCH_ENTITY_ID}
)

MigrationAction = Literal["noop", "migrate", "block"]


@dataclass(frozen=True)
class StartupApplyReadyMigrationDecision:
    """Read-only decision used before touching the Home Assistant registry."""

    action: MigrationAction
    source_entity_id: str | None
    target_entity_id: str
    reason: str


def startup_apply_ready_entity_id(profile: str = DEFAULT_PROFILE) -> str:
    """Return the clean profile-scoped entity ID for the process gate."""

    normalized_profile = profile if profile in PROFILE_LABELS else DEFAULT_PROFILE
    return f"{STARTUP_APPLY_READY_DOMAIN}.{normalized_profile}_core_state_apply_ready"


def decide_startup_apply_ready_registry_migration(
    current_entity_id: str | None,
    target_entity_id: str,
    *,
    target_in_use: bool = False,
) -> StartupApplyReadyMigrationDecision:
    """Decide whether one exact, evidenced registry path may be renamed."""

    if current_entity_id is None:
        return StartupApplyReadyMigrationDecision(
            "noop",
            None,
            target_entity_id,
            "No registered Startup-/Apply-Ready entity exists for this unique_id.",
        )

    if current_entity_id == target_entity_id:
        return StartupApplyReadyMigrationDecision(
            "noop",
            current_entity_id,
            target_entity_id,
            "The registered entity already uses the clean canonical path.",
        )

    if current_entity_id not in LEGACY_STARTUP_APPLY_READY_ENTITY_IDS:
        return StartupApplyReadyMigrationDecision(
            "block",
            current_entity_id,
            target_entity_id,
            "The current registry path is not in the evidenced legacy inventory; "
            "do not infer or rename it automatically.",
        )

    if target_in_use:
        return StartupApplyReadyMigrationDecision(
            "block",
            current_entity_id,
            target_entity_id,
            "The clean target path is already in use; preserve both entries and "
            "document the collision before changing the registry.",
        )

    return StartupApplyReadyMigrationDecision(
        "migrate",
        current_entity_id,
        target_entity_id,
        "The exact live-observed system_-prefixed Core-State path may be renamed "
        "to the clean canonical target while retaining its registry entry/history.",
    )
