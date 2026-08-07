"""Authenticated REST adapter for the embeddable Core-State module."""

from __future__ import annotations

from typing import Any

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .commands import async_execute_command
from .const import DATA_API_REGISTERED, DOMAIN
from .contracts import build_projection, build_snapshot
from .coordinator import all_coordinators, coordinator_from_hass


def _coordinator(hass: HomeAssistant, entry_id: str | None = None):
    if entry_id:
        return coordinator_from_hass(hass, entry_id)
    coords = all_coordinators(hass)
    return coords[0] if coords else None


def _is_admin(request) -> bool:
    try:
        user = request["hass_user"]
    except (KeyError, TypeError):
        user = None
    return bool(getattr(user, "is_admin", False))


class _SnapshotView(HomeAssistantView):
    url = "/api/benni_core_state/snapshot"
    name = "api:benni_core_state:snapshot"
    requires_auth = True

    async def get(self, request):
        coord = _coordinator(request.app["hass"], request.query.get("entry_id"))
        if coord is None:
            return self.json_message("Core State not loaded", status_code=503)
        return self.json(build_snapshot(coord, can_command=_is_admin(request)))


class _ProjectionView(HomeAssistantView):
    url = "/api/benni_core_state/projection"
    name = "api:benni_core_state:projection"
    requires_auth = True

    async def get(self, request):
        coord = _coordinator(request.app["hass"], request.query.get("entry_id"))
        if coord is None:
            return self.json_message("Core State not loaded", status_code=503)
        try:
            days = max(1, min(14, int(request.query.get("days", "14"))))
        except (TypeError, ValueError):
            return self.json_message("days_invalid", status_code=400)
        return self.json(build_projection(coord, days))


class _CommandView(HomeAssistantView):
    url = "/api/benni_core_state/commands"
    name = "api:benni_core_state:commands"
    requires_auth = True

    async def post(self, request):
        if not _is_admin(request):
            return self.json_message("Admin permission required", status_code=403)
        try:
            body: dict[str, Any] = await request.json()
        except (TypeError, ValueError):
            return self.json_message("json_invalid", status_code=400)
        coord = _coordinator(request.app["hass"], body.get("entry_id"))
        if coord is None:
            return self.json_message("Core State not loaded", status_code=503)
        result = await async_execute_command(
            coord,
            request_id=body.get("request_id", ""),
            command=body.get("command", ""),
            payload=body.get("payload"),
        )
        return self.json(result, status_code=200 if result["status"] == "success" else 400)


def async_setup_api(hass: HomeAssistant) -> None:
    """Register the host REST adapter once per Home Assistant process."""

    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_API_REGISTERED):
        return
    hass.http.register_view(_SnapshotView)
    hass.http.register_view(_ProjectionView)
    hass.http.register_view(_CommandView)
    data[DATA_API_REGISTERED] = True
