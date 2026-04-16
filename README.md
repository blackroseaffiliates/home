# NC IT Bulletin

A static GitHub Pages website for:

- weekly timetable
- school notices
- assignments
- tests
- full detail view for case studies, homework prompts, and class notices
- live countdowns for exact due times

## File structure

```text
nc-it-bulletin/
├── index.html
├── style.css
├── app.js
├── data.js
└── README.md
```

## Main editing file

You will mostly edit:

- `data.js`

Everything visual and functional is already handled by:

- `index.html`
- `style.css`
- `app.js`

---

## Publish on GitHub Pages

1. Create a GitHub repository.
2. Upload all files.
3. Commit and push.
4. Open the repository **Settings**.
5. Open **Pages**.
6. Under **Build and deployment** choose:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/root`
7. Save.
8. GitHub gives you a public link.

---

# Main maintenance workflow

1. Open `data.js`
2. Add or edit an item
3. Update `source`
4. Update `updatedAt`
5. Save
6. Commit
7. Push to GitHub
8. Refresh the page

---

# Site branding and top text

At the top of `data.js`:

```js
const SITE_CONFIG = { ... }
```

You can change:

- `siteTitle`
- `siteSubtitle`
- `termLabel`
- `lastUpdated`
- `weekFocus.title`
- `weekFocus.text`
- `infoSourceNote`

---

# Timetable editing

The timetable lives in:

```js
const TIMETABLE_DATA = [ ... ]
```

Example class row:

```js
{
  time: "08:00 – 10:00",
  monday: { subject: "SHEQ", lecturer: "B. Ncube", type: "sheq" },
  tuesday: { subject: "Computer Systems Maintenance", lecturer: "T. Sithole", type: "csm" },
  wednesday: { subject: "NASS", lecturer: "Adult", type: "nass" },
  thursday: { subject: "Programming Concepts", lecturer: "S. Mutukwana", type: "prog" },
  friday: { subject: "Information System Support", lecturer: "S. Mutukwana", type: "iss" }
}
```

Example break row:

```js
{
  time: "10:00 – 10:30",
  monday: { breakLabel: "BREAK" },
  tuesday: { breakLabel: "BREAK" },
  wednesday: { breakLabel: "BREAK" },
  thursday: { breakLabel: "BREAK" },
  friday: { breakLabel: "BREAK" }
}
```

### Allowed module types for colors

- `prog`
- `csm`
- `sheq`
- `iss`
- `tc`
- `nass`
- `sports`
- `empty`

---

# Notices, assignments, and tests

These live in:

```js
const ANNOUNCEMENTS = [ ... ]
```

Each item is modular and can contain full detail content.

## Full template

```js
{
  id: "unique-id",
  title: "Programming case study",
  type: "assignment",
  dueLabel: "Due Friday 22:00",
  dateValue: "2026-04-17",
  dueAt: "2026-04-17T22:00:00+02:00",
  status: "pending",
  pinned: true,
  priority: "fasttrack",
  description: "Short preview shown on the card.",
  detail: "Full detail shown in the modal.",
  questions: ["Question 1", "Question 2"],
  actions: ["Action 1", "Action 2"],
  source: "Ashley / class group",
  updatedAt: "2026-04-16 22:25"
}
```

---

# Field guide

## `id`
Must be unique.

## `title`
Main card heading.

## `type`
Allowed values:

- `"assignment"`
- `"test"`
- `"notice"`

### How type behaves
- `notice` appears in the **School notices** section above the timetable
- `assignment` and `test` appear in the lower section with stats and filters

## `dueLabel`
Human-readable due text.

Examples:

- `"Due Friday 22:00"`
- `"Friday 08:00"`
- `"Ongoing"`

## `dateValue`
Used for date ordering and fallback countdown.

Format:

```js
"YYYY-MM-DD"
```

## `dueAt`
This is the **exact date-time countdown field**.

Format:

```js
"2026-04-17T22:00:00+02:00"
```

This tells the browser the exact deadline with timezone.

### Important for Zimbabwe time
Use:

```js
+02:00
```

Examples:

```js
"2026-04-17T22:00:00+02:00"
"2026-04-17T08:00:00+02:00"
"2026-04-17T10:30:00+02:00"
```

### How countdown works
- If `dueAt` is present, the site shows a **live countdown** that updates every second.
- If `dueAt` is missing but `dateValue` is present, the site falls back to a date countdown like `2 days left`.
- If the deadline has passed, it shows a late badge.

### Where time comes from
The countdown uses the **visitor’s browser clock**.
That works well on GitHub Pages because it needs no backend server.

For best accuracy:
- use a full `dueAt` with `+02:00`
- keep device time correct

---

# Mark an item as done

Change:

```js
status: "pending"
```

to:

```js
status: "done"
```

Done items:
- stay visible
- become faded
- show classmates that the item was completed or already passed

---

# Change a due date

Update these fields together:

```js
dueLabel: "Due Friday 22:00",
dateValue: "2026-04-17",
dueAt: "2026-04-17T22:00:00+02:00"
```

Example moved to Monday 18:00:

```js
dueLabel: "Due Monday 18:00",
dateValue: "2026-04-20",
dueAt: "2026-04-20T18:00:00+02:00"
```

Always update all matching fields so the display and countdown stay correct.

---

# Postpone an item

If something is delayed:

1. change `dueLabel`
2. change `dateValue`
3. change `dueAt` if exact time is known
4. set:

```js
priority: "postponed"
```

5. explain it in `detail`
6. update `updatedAt`

Example:

```js
priority: "postponed",
dueLabel: "Moved to next Tuesday 14:00",
dateValue: "2026-04-21",
dueAt: "2026-04-21T14:00:00+02:00",
detail: "Lecturer postponed submission because of timetable changes.",
updatedAt: "2026-04-16 22:40"
```

---

# Fasttrack an item

If something becomes urgent:

```js
priority: "fasttrack"
```

Use fasttrack for:
- urgent deadline changes
- major assignment reminders
- last-minute lecturer instructions
- high-priority tests

---

# Pin an item

To force it near the top:

```js
pinned: true
```

Use pin for:
- urgent notices
- most important work of the week
- changed deadlines
- major test reminders

Do not pin everything.

---

# Add full case study questions

Example:

```js
{
  id: "iss-case-study-week-3",
  title: "ISS case study",
  type: "assignment",
  dueLabel: "Due Thursday 22:00",
  dateValue: "2026-04-23",
  dueAt: "2026-04-23T22:00:00+02:00",
  status: "pending",
  pinned: true,
  priority: "fasttrack",
  description: "ISS case study for this week.",
  detail: "Answer all questions clearly and use examples where needed.",
  questions: [
    "Define information systems support.",
    "Explain two challenges faced by support teams.",
    "Suggest methods to improve user satisfaction."
  ],
  actions: [
    "Write the answers neatly",
    "Check if printing is required",
    "Submit before class starts"
  ],
  source: "Lecturer",
  updatedAt: "2026-04-16 23:00"
}
```

Visitors can click **View details** and read everything.

---

# Add a notice above the timetable

Use:

```js
type: "notice"
```

Example:

```js
{
  id: "room-change-tc",
  title: "Technical Communication room changed",
  type: "notice",
  dueLabel: "Friday morning",
  dateValue: "2026-04-17",
  dueAt: "2026-04-17T07:30:00+02:00",
  status: "pending",
  pinned: true,
  priority: "fasttrack",
  description: "Technical Communication will now be in Room B12.",
  detail: "The lecturer changed the room because another class is using the original venue.",
  questions: [],
  actions: [
    "Go to Room B12 instead of the old room"
  ],
  source: "Lecturer",
  updatedAt: "2026-04-16 22:50"
}
```

---

# Recommended stable maintenance rules

## 1. Never post unconfirmed information
Only post when confirmed by:
- lecturer
- class rep
- official timetable
- trusted class update

## 2. Always include `source`
This improves trust.

## 3. Always update `updatedAt`
This tells users the information is current.

## 4. Keep `dueLabel`, `dateValue`, and `dueAt` consistent
Never change only one if the deadline changed.

## 5. Use `detail` for clarity
Keep the card preview short and the full explanation in `detail`.

## 6. Use `questions` and `actions`
That is what makes this site more useful than a normal group chat.

## 7. Keep notices short and high signal
Important notices should be quick to read.

## 8. End-of-week cleanup
At the end of each week:
- mark finished items as done
- remove stale notices
- update week focus
- update site `lastUpdated`

---

# Good routine

## Daily
- confirm new lecturer updates
- add urgent notices
- adjust postponed or fasttracked items

## End of day
- mark completed tests or submissions as done
- correct anything that changed during class

## End of week
- remove stale items
- add next week’s tasks
- update `weekFocus`
- update `lastUpdated`

---

# Best practical advice

For day-to-day use:
- mostly edit `data.js`
- use `notice` for school/class alerts
- use `assignment` and `test` for tracked work
- use `dueAt` whenever you know the exact time
- pin only what is urgent
- keep the source and timestamp accurate
