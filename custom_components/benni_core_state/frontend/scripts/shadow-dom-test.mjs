import { projection, snapshot } from "./shadow-dom-fixture.mjs";

const document = globalThis.document;
const pageWindow = document.defaultView;
const report = document.querySelector("#shadow-test-report");
const checks = [];
const originalFetch = globalThis.fetch.bind(globalThis);

function record(name, passed, detail = "") {
  checks.push({ name, passed, detail });
  if (report) report.textContent = `${passed ? "PASS" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`;
}

function jsonResponse(value) {
  return new globalThis.Response(JSON.stringify(value), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

globalThis.fetch = async (input, init) => {
  const requestUrl = new globalThis.URL(
    typeof input === "string" ? input : input.url,
    globalThis.location.href,
  );
  if (requestUrl.pathname.endsWith("/snapshot")) return jsonResponse(snapshot);
  if (requestUrl.pathname.endsWith("/projection")) return jsonResponse(projection);
  if (requestUrl.pathname.endsWith("/commands")) {
    const body = init?.body ? JSON.parse(String(init.body)) : {};
    return jsonResponse({
      contract: "benni_core_state.command_ack",
      version: "1.0.0",
      request_id: body.request_id ?? "shadow-test",
      command: body.command ?? "shadow-test",
      status: "success",
      error: null,
    });
  }
  return originalFetch(input, init);
};

const applicationEntry = new globalThis.URLSearchParams(globalThis.location.search).has("bundle")
  ? "/app/main.js"
  : "/src/main.ts";
await import(applicationEntry);

function wait(milliseconds) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, milliseconds));
}

async function waitFor(predicate, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await wait(25);
  }
  throw new Error("Browser assertion timed out");
}

function visible(element) {
  return globalThis.getComputedStyle(element).display !== "none";
}

function inspectModule(app) {
  const shadow = app.shadowRoot;
  const root = shadow?.querySelector(".core-state-module");
  if (!shadow || !root) throw new Error("Rendered Core-State root is missing");
  return { shadow, root };
}

function inspectViewport(root, label) {
  const width = root.getBoundingClientRect().width;
  const navigationWidth = root.querySelector(".module-nav")?.getBoundingClientRect().width ?? 0;
  const card = root.querySelector(".hero-card");
  const columns = card ? globalThis.getComputedStyle(card).gridTemplateColumns : "";
  const trackCount = columns.split(/\s+/).filter(Boolean).length;
  const passed = width > 0 && navigationWidth > 0 && (label === "tablet" ? trackCount === 1 : trackCount >= 2);
  record(`${label} layout`, passed, `root=${Math.round(width)}px columns=${columns}`);
  return passed;
}

async function run() {
  document.title = "Core State Shadow DOM Test";
  const outsideProbe = document.createElement("button");
  outsideProbe.type = "button";
  outsideProbe.textContent = "Host probe";
  document.body.append(outsideProbe);
  const outsideBefore = globalThis.getComputedStyle(outsideProbe);
  const outsideStyle = {
    background: outsideBefore.backgroundColor,
    color: outsideBefore.color,
    font: outsideBefore.fontFamily,
  };

  const outerHost = document.createElement("ha-panel-shadow-host");
  const outerRoot = outerHost.attachShadow({ mode: "open" });
  const app = document.createElement("bcs-app");
  outerRoot.append(app);
  document.body.append(outerHost);

  const secondHost = document.createElement("ha-panel-shadow-host");
  const secondRoot = secondHost.attachShadow({ mode: "open" });
  const secondApp = document.createElement("bcs-app");
  secondApp.style.display = "none";
  secondRoot.append(secondApp);
  document.body.append(secondHost);

  await waitFor(() => app.shadowRoot?.querySelector(".hero-card"));
  await waitFor(() => secondApp.shadowRoot?.querySelector(".hero-card"));
  await waitFor(() => {
    const metricCard = app.shadowRoot?.querySelector("article.metric-card");
    const metricStyle = metricCard ? globalThis.getComputedStyle(metricCard) : null;
    return metricStyle?.backgroundColor === "rgb(23, 29, 37)" && metricStyle.borderTopColor === "rgb(45, 55, 69)";
  });

  let inspected = inspectModule(app);
  let root = inspected.root;
  const hostStyle = globalThis.getComputedStyle(app);
  const rootStyle = globalThis.getComputedStyle(root);
  const card = root.querySelector("article.metric-card") ?? root.querySelector(".hero-card");
  const grid = root.querySelector(".grid.three");
  const timelineTrack = root.querySelector(".timeline-track");
  const activeNav = root.querySelector(".nav-item.active");
  const phase = root.querySelector(".timeline-phase");

  record("styles live inside bcs-app shadow root", inspected.shadow.querySelectorAll("style[data-bcs-styles]").length === 1);
  record("no module style leaked into document.head", document.head.querySelectorAll("style[data-bcs-styles]").length === 0);
  record("no module style leaked into HA host shadow root", outerRoot.querySelectorAll("style[data-bcs-styles]").length === 0);
  record("second bcs-app has its own style", secondApp.shadowRoot?.querySelectorAll("style[data-bcs-styles]").length === 1);
  record("module host is styled", hostStyle.display === "block" && hostStyle.backgroundColor === "rgb(17, 22, 29)");
  record("module background is graphite", rootStyle.backgroundColor === "rgb(17, 22, 29)");
  record("module text is light graphite", rootStyle.color === "rgb(231, 237, 244)");
  const cardStyle = card ? globalThis.getComputedStyle(card) : null;
  record(
    "cards have graphite surface and border",
    Boolean(
      cardStyle &&
        cardStyle.backgroundColor === "rgb(23, 29, 37)" &&
        cardStyle.borderTopColor === "rgb(45, 55, 69)",
    ),
    cardStyle ? `${cardStyle.backgroundColor}/${cardStyle.borderTopColor}` : "missing",
  );
  record("grid layout is active", grid && globalThis.getComputedStyle(grid).display === "grid");
  record("timeline flex layout is active", timelineTrack && globalThis.getComputedStyle(timelineTrack).display === "flex");
  record(
    "navigation active state is styled",
    activeNav &&
      globalThis.getComputedStyle(activeNav).backgroundColor === "rgb(27, 34, 44)" &&
      globalThis.getComputedStyle(activeNav).boxShadow.includes("rgb(97, 216, 230)"),
  );
  record(
    "timeline segment is styled",
    phase &&
      Number(globalThis.getComputedStyle(phase).flexGrow) > 0 &&
      globalThis.getComputedStyle(phase).backgroundColor !== "rgba(0, 0, 0, 0)",
  );
  record(
    "interactive controls meet 44px touch target",
    [...root.querySelectorAll("button, input, select, textarea")]
      .filter(visible)
      .every((element) => element.getBoundingClientRect().height >= 44),
  );
  const interactive = [...root.querySelectorAll("button, input, select, textarea")];
  record(
    "rendered controls have accessible names",
    interactive.every((element) => Boolean(element.getAttribute("aria-label")?.trim() || element.textContent?.trim())),
  );
  record(
    "rendered forms expose labels",
    [...root.querySelectorAll("input, select, textarea")].every((element) => {
      const labelled = element.getAttribute("aria-label") || element.getAttribute("aria-labelledby");
      return Boolean(labelled || element.closest("label"));
    }),
  );
  record(
    "rendered landmarks and headings are present",
    Boolean(root.querySelector("main") && root.querySelector("nav[aria-label]") && root.querySelector("h1") && root.querySelector("h2")),
  );
  inspectViewport(root, "desktop");

  activeNav?.focus();
  const focusStyle = activeNav ? globalThis.getComputedStyle(activeNav) : null;
  record(
    "visible focus state is exposed",
    Boolean(activeNav?.matches(":focus-visible")) && focusStyle?.outlineStyle !== "none" && focusStyle.outlineWidth !== "0px",
  );

  const viewExpectations = [
    ["Heute", "Eine verlässliche Alltagswahrheit"],
    ["Kalender", "Die nächsten 14 Tage"],
    ["Profile & Regeln", "Automatische Wake-Planung"],
    ["Diagnose", "Owner-lokaler Decision Trace"],
    ["Einstellungen", "Core-State-eigene Quellen und Grenzen"],
  ];
  for (const [label, heading] of viewExpectations) {
    const navButton = [...root.querySelectorAll(".nav-item")].find((element) => element.textContent?.includes(label));
    navButton?.click();
    await waitFor(() => root.querySelector(".view-heading h2")?.textContent?.includes(heading));
    record(`view ${label} renders`, root.querySelector(".view-heading h2")?.textContent?.includes(heading) === true);
  }

  inspected = inspectModule(app);
  root = inspected.root;
  record("document title remains host-owned", document.title === "Core State Shadow DOM Test");
  const outsideAfter = globalThis.getComputedStyle(outsideProbe);
  record(
    "host typography and background remain unchanged",
    outsideStyle.background === outsideAfter.backgroundColor &&
      outsideStyle.color === outsideAfter.color &&
      outsideStyle.font === outsideAfter.fontFamily,
  );

  outerRoot.removeChild(app);
  await wait(0);
  outerRoot.append(app);
  await waitFor(() => app.shadowRoot?.querySelector(".hero-card"));
  inspected = inspectModule(app);
  record("unmount and remount are idempotent", inspected.shadow.querySelectorAll("style[data-bcs-styles]").length === 1 && inspected.shadow.querySelectorAll("[data-bcs-mount]").length === 1);
  record("remount does not duplicate style nodes", secondApp.shadowRoot?.querySelectorAll("style[data-bcs-styles]").length === 1 && document.head.querySelectorAll("style[data-bcs-styles]").length === 0);

  const result = {
    mode: new globalThis.URLSearchParams(globalThis.location.search).has("bundle") ? "generated-build" : "vite-source",
    passed: checks.every((check) => check.passed),
    checks,
  };
  const testState = {
    ...result,
    inspectViewport: (label) => {
      const current = inspectModule(app).root;
      inspectViewport(current, label);
      testState.passed = checks.every((check) => check.passed);
      if (report) {
        report.dataset.checks = JSON.stringify(checks);
        report.dataset.status = testState.passed ? "passed" : "failed";
      }
      return testState;
    },
  };
  document.addEventListener("bcs-shadow-viewport", (event) => {
    testState.inspectViewport(event.detail?.label ?? "tablet");
  });
  outsideProbe.addEventListener("click", () => testState.inspectViewport("tablet"));
  globalThis.__bcsShadowTest = testState;
  if (pageWindow) {
    pageWindow.__bcsShadowTest = testState;
    pageWindow.__bcsInspectViewport = testState.inspectViewport;
  }
  if (report) {
    report.dataset.status = result.passed ? "passed" : "failed";
    report.dataset.checks = JSON.stringify(checks);
    report.textContent = `${result.passed ? "PASS" : "FAIL"}: ${result.mode} (${checks.filter((check) => check.passed).length}/${checks.length})`;
  }
}

run().catch((error) => {
  record("shadow DOM test completed", false, error instanceof Error ? error.message : String(error));
  const failure = { passed: false, checks };
  globalThis.__bcsShadowTest = failure;
  if (pageWindow) pageWindow.__bcsShadowTest = failure;
  if (report) report.dataset.status = "failed";
});
