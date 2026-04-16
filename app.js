const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TODAY_IDX = (() => {
  const d = new Date().getDay();
  return d >= 1 && d <= 5 ? d - 1 : -1;
})();

const SUBJECT_LEGENDS = [
  { type: "prog", label: "Programming Concepts", color: "var(--cyan)" },
  { type: "csm", label: "Computer Systems Maintenance", color: "var(--amber)" },
  { type: "sheq", label: "SHEQ", color: "var(--green)" },
  { type: "iss", label: "Information System Support", color: "var(--violet)" },
  { type: "tc", label: "Technical Communication", color: "var(--rose)" },
  { type: "nass", label: "NASS", color: "var(--lime)" },
  { type: "sports", label: "Sports", color: "var(--orange)" },
];

let activeFilter = "all";
let searchText = "";
let countdownInterval = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDateLabel(dateValue) {
  if (!dateValue) return "No date set";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getCountdownInfo(item) {
  if (item.status === "done") return { label: "", className: "" };

  if (item.dueAt) {
    const due = new Date(item.dueAt);
    if (!Number.isNaN(due.getTime())) {
      const diff = due.getTime() - Date.now();
      if (diff < 0) {
        return { label: `${formatCountdown(Math.abs(diff))} late`, className: "badge-overdue" };
      }
      if (diff <= 86400000) {
        return { label: formatCountdown(diff), className: "badge-today live-countdown", dueAt: item.dueAt };
      }
      return { label: formatCountdown(diff), className: "badge-countdown live-countdown", dueAt: item.dueAt };
    }
  }

  if (item.dateValue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${item.dateValue}T00:00:00`);
    if (!Number.isNaN(due.getTime())) {
      const days = Math.round((due - today) / 86400000);
      if (days < 0) return { label: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} late`, className: "badge-overdue" };
      if (days === 0) return { label: "Today", className: "badge-today" };
      if (days === 1) return { label: "1 day left", className: "badge-countdown" };
      return { label: `${days} days left`, className: "badge-countdown" };
    }
  }

  return { label: "", className: "" };
}

function dueBadge(item) {
  if (!item.dueLabel) return "";
  return `<span class="badge badge-due">${escapeHtml(item.dueLabel)}</span>`;
}

function priorityBadge(priority = "normal") {
  const labelMap = { normal: "Normal", fasttrack: "Fasttrack", postponed: "Postponed" };
  return `<span class="badge badge-priority-${priority}">${labelMap[priority] || "Normal"}</span>`;
}

function renderTopContent() {
  document.getElementById("site-title").textContent = SITE_CONFIG.siteTitle;
  document.getElementById("site-subtitle").textContent = SITE_CONFIG.siteSubtitle;
  document.getElementById("term-label").textContent = SITE_CONFIG.termLabel;
  document.getElementById("week-focus-title").textContent = SITE_CONFIG.weekFocus.title;
  document.getElementById("week-focus-text").textContent = SITE_CONFIG.weekFocus.text;
  document.getElementById("source-note").textContent = SITE_CONFIG.infoSourceNote;
  document.getElementById("last-updated").textContent = SITE_CONFIG.lastUpdated;
}

function renderStats() {
  const pool = ANNOUNCEMENTS.filter(item => item.type !== "notice");
  const total = pool.length || 1;
  const pending = pool.filter(item => item.status === "pending").length;
  const completed = pool.filter(item => item.status === "done").length;
  const openAssignments = pool.filter(item => item.type === "assignment" && item.status === "pending").length;
  const openTests = pool.filter(item => item.type === "test" && item.status === "pending").length;
  const fasttrack = pool.filter(item => item.priority === "fasttrack" && item.status === "pending").length;

  const cards = [
    { label: "Pending", value: pending, note: `${total} assignment/test items` },
    { label: "Completed", value: completed, note: "Still visible for reference" },
    { label: "Open assignments", value: openAssignments, note: "Need action" },
    { label: "Upcoming tests", value: openTests, note: "Prepare early" },
    { label: "Fasttrack", value: fasttrack, note: "Urgent priority" },
  ];

  document.getElementById("stats").innerHTML = cards.map(card => `
    <div class="stat-card">
      <div class="stat-label">${escapeHtml(card.label)}</div>
      <div class="stat-value">${escapeHtml(card.value)}</div>
      <div class="stat-note">${escapeHtml(card.note)}</div>
    </div>
  `).join("");
}

function renderTimetable() {
  const headCols = [
    "<th>Time</th>",
    ...DAY_LABELS.map((label, index) => `<th class="${index === TODAY_IDX ? "today-col" : ""}">${escapeHtml(label)}${index === TODAY_IDX ? " ●" : ""}</th>`)
  ].join("");
  document.getElementById("table-head").innerHTML = `<tr>${headCols}</tr>`;

  if (TODAY_IDX >= 0) {
    document.getElementById("today-indicator").innerHTML = `<span class="today-pill">Today: ${DAY_LABELS[TODAY_IDX]}</span>`;
  }

  document.getElementById("schedule-body").innerHTML = TIMETABLE_DATA.map(slot => {
    const cells = DAYS.map((day, index) => {
      const cell = slot[day];
      const tdClass = index === TODAY_IDX ? ' class="today-col"' : '';
      if (cell.breakLabel) {
        const cls = cell.breakLabel === "LUNCH" ? "lunch" : "tea";
        const icon = cell.breakLabel === "LUNCH" ? "🍽" : "☕";
        return `<td${tdClass}><div class="break-cell"><span class="break-label ${cls}">${icon} ${escapeHtml(cell.breakLabel)}</span></div></td>`;
      }
      const isEmpty = !cell.subject || cell.subject === "No class listed";
      const typeClass = isEmpty ? "subject-empty" : `subject-${cell.type || ""}`;
      return `<td${tdClass}><div class="subject-card ${typeClass}"><div class="subject-name">${escapeHtml(cell.subject || "—")}</div>${cell.lecturer && !isEmpty ? `<div class="subject-lecturer">${escapeHtml(cell.lecturer)}</div>` : ""}</div></td>`;
    }).join("");

    return `<tr><td class="time-cell">${escapeHtml(slot.time)}</td>${cells}</tr>`;
  }).join("");

  document.getElementById("legend").innerHTML = SUBJECT_LEGENDS.map(item => `
    <div class="legend-item"><span class="legend-dot" style="background:${item.color}"></span>${escapeHtml(item.label)}</div>
  `).join("");
}

function getSortedAnnouncements() {
  return [...ANNOUNCEMENTS].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    const priorityRank = { fasttrack: 0, normal: 1, postponed: 2 };
    const aPriority = priorityRank[a.priority || "normal"];
    const bPriority = priorityRank[b.priority || "normal"];
    if (aPriority !== bPriority) return aPriority - bPriority;
    return (a.dateValue || "").localeCompare(b.dateValue || "");
  });
}

function getFilteredAnnouncements() {
  return getSortedAnnouncements().filter(item => {
    if (item.type === "notice") return false;
    const typeMatch = activeFilter === "all" ? true : activeFilter === "open" ? item.status === "pending" : item.type === activeFilter;
    const haystack = [item.title, item.description, item.type, item.dueLabel, item.source, item.detail, ...(item.questions || []), ...(item.actions || [])].join(" ").toLowerCase();
    return typeMatch && haystack.includes(searchText.toLowerCase());
  });
}

function renderNoticeSection() {
  const items = getSortedAnnouncements().filter(item => item.type === "notice");
  const container = document.getElementById("notices-list");
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">No active notices right now.</div>`;
    return;
  }
  container.innerHTML = items.map(item => renderCard(item, true)).join("");
  bindDetailButtons(container);
}

function renderCard(item, isNotice = false) {
  const countdown = getCountdownInfo(item);
  const countdownHtml = countdown.label
    ? `<span class="badge ${countdown.className}" ${countdown.dueAt ? `data-due-at="${escapeHtml(countdown.dueAt)}" data-countdown-target="true"` : ""}>${escapeHtml(countdown.label)}</span>`
    : "";

  return `
    <article class="ann-card type-${escapeHtml(item.type)} status-${escapeHtml(item.status)}${item.pinned ? " pinned-card" : ""}">
      <div class="ann-header">
        <div class="ann-title">${escapeHtml(item.title)}</div>
        <div class="badge-row">
          <span class="badge badge-${escapeHtml(item.type)}">${escapeHtml(item.type.charAt(0).toUpperCase() + item.type.slice(1))}</span>
          <span class="badge badge-${escapeHtml(item.status)}">${item.status === "done" ? "✓ Done" : "Pending"}</span>
          ${item.pinned ? '<span class="badge badge-pinned">📌 Pinned</span>' : ""}
          ${!isNotice ? priorityBadge(item.priority) : ""}
          ${dueBadge(item)}
          ${countdownHtml}
        </div>
      </div>
      <p class="ann-desc">${escapeHtml(item.description)}</p>
      <div class="card-actions">
        <button class="action-btn" data-open-id="${escapeHtml(item.id)}">View details</button>
      </div>
      <div class="ann-footer">
        <span class="ann-meta">Source: ${escapeHtml(item.source)}</span>
        <span class="ann-meta">Updated: ${escapeHtml(item.updatedAt)}</span>
        <span class="ann-meta">Date: ${escapeHtml(formatDateLabel(item.dateValue))}</span>
      </div>
    </article>
  `;
}

function renderAnnouncements() {
  const items = getFilteredAnnouncements();
  const container = document.getElementById("updates");
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">No items match the current filter.</div>`;
    return;
  }
  container.innerHTML = items.map(item => renderCard(item)).join("");
  bindDetailButtons(container);
}

function bindDetailButtons(scope) {
  scope.querySelectorAll("[data-open-id]").forEach(button => {
    button.addEventListener("click", () => openAnnouncement(button.dataset.openId));
  });
}

function listBlock(title, values) {
  if (!values || !values.length) return "";
  return `<div class="detail-block"><h3>${escapeHtml(title)}</h3><ul>${values.map(v => `<li>${escapeHtml(v)}</li>`).join("")}</ul></div>`;
}

function openAnnouncement(id) {
  const item = ANNOUNCEMENTS.find(entry => entry.id === id);
  if (!item) return;

  document.getElementById("modal-title").textContent = item.title;
  document.getElementById("modal-sub").textContent = item.description;

  const countdown = getCountdownInfo(item);

  document.getElementById("modal-content").innerHTML = `
    <div class="meta-grid">
      <div class="meta-card"><small>Type</small><strong>${escapeHtml(item.type)}</strong></div>
      <div class="meta-card"><small>Status</small><strong>${escapeHtml(item.status)}</strong></div>
      <div class="meta-card"><small>Priority</small><strong>${escapeHtml(item.priority || "normal")}</strong></div>
      <div class="meta-card"><small>Due</small><strong>${escapeHtml(item.dueLabel || "No due label")} · ${escapeHtml(formatDateLabel(item.dateValue))}</strong></div>
      <div class="meta-card"><small>Live countdown</small><strong ${countdown.dueAt ? `data-due-at="${escapeHtml(countdown.dueAt)}" data-countdown-target="true"` : ""}>${escapeHtml(countdown.label || "No active countdown")}</strong></div>
      <div class="meta-card"><small>Source</small><strong>${escapeHtml(item.source)}</strong></div>
      <div class="meta-card"><small>Updated</small><strong>${escapeHtml(item.updatedAt)}</strong></div>
      <div class="meta-card"><small>Exact due time</small><strong>${escapeHtml(item.dueAt || "Not set")}</strong></div>
    </div>
    <div class="detail-block"><h3>Full details</h3><p>${escapeHtml(item.detail || "No full detail added yet.")}</p></div>
    ${listBlock("Questions / prompts", item.questions)}
    ${listBlock("Action checklist", item.actions)}
  `;

  document.getElementById("announcement-modal").showModal();
  refreshLiveCountdowns();
}

function refreshLiveCountdowns() {
  document.querySelectorAll('[data-countdown-target="true"]').forEach(el => {
    const dueAt = el.getAttribute('data-due-at');
    if (!dueAt) return;
    const due = new Date(dueAt);
    if (Number.isNaN(due.getTime())) return;
    const diff = due.getTime() - Date.now();
    if (diff < 0) {
      el.textContent = `${formatCountdown(Math.abs(diff))} late`;
      el.classList.remove('badge-today', 'badge-countdown');
      el.classList.add('badge-overdue');
    } else {
      el.textContent = formatCountdown(diff);
    }
  });
}

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(refreshLiveCountdowns, 1000);
}

function bindControls() {
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderAnnouncements();
      refreshLiveCountdowns();
    });
  });

  document.getElementById('search').addEventListener('input', event => {
    searchText = event.target.value;
    renderAnnouncements();
    refreshLiveCountdowns();
  });

  const modal = document.getElementById('announcement-modal');
  document.getElementById('close-modal').addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    const rect = modal.getBoundingClientRect();
    const isInDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
    if (!isInDialog) modal.close();
  });
}

function init() {
  renderTopContent();
  renderNoticeSection();
  renderTimetable();
  renderStats();
  renderAnnouncements();
  bindControls();
  startCountdownTimer();
  refreshLiveCountdowns();
}

document.addEventListener('DOMContentLoaded', init);
