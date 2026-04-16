# NC IT Weekly Board

A static GitHub Pages website for timetable, announcements, assignments, tests, and full detail view for case studies or class notices.

## Files
- `index.html` — page structure
- `style.css` — design and responsive layout
- `app.js` — logic for search, filters, countdown, sorting, detail modal, timetable rendering
- `data.js` — content file you edit most often
- `README.md` — maintenance guide

## Publish on GitHub Pages
1. Create a GitHub repository.
2. Upload all files.
3. Commit and push.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Set branch to `main` and folder to `/root`.
7. Save.

## Main workflow
1. Open `data.js`
2. Edit an existing item or add a new one
3. Save
4. Commit
5. Push
6. Refresh the site

## Timetable
Edit `TIMETABLE_DATA` in `data.js`.

Break rows use:
```js
{ time: "10:00 – 10:30", monday:{breakLabel:"BREAK"}, tuesday:{breakLabel:"BREAK"}, wednesday:{breakLabel:"BREAK"}, thursday:{breakLabel:"BREAK"}, friday:{breakLabel:"BREAK"} }
```

## Announcement item template
```js
{
  id: "unique-id",
  title: "Programming case study",
  type: "assignment", // assignment | test | notice
  dueLabel: "Due Friday",
  dateValue: "2026-04-17",
  status: "pending", // pending | done
  pinned: true,
  priority: "fasttrack", // fasttrack | normal | postponed
  description: "Short preview shown on the card.",
  detail: "Full content shown when someone clicks View details.",
  questions: ["Question 1", "Question 2"],
  actions: ["Action 1", "Action 2"],
  source: "Ashley / class group",
  updatedAt: "2026-04-16 08:00"
}
```

## Mark as done
Change:
```js
status: "pending"
```
To:
```js
status: "done"
```

## Change date
Always update both:
```js
dueLabel: "Due Monday",
dateValue: "2026-04-20"
```

## Countdown
Countdown is automatic from `dateValue`.
- future date → shows days left
- today → shows Today
- past date → shows late badge

## Postpone
Update date fields, then set:
```js
priority: "postponed"
```
And explain in `detail` if needed.

## Fasttrack
Set:
```js
priority: "fasttrack"
```
Use for urgent items.

## Pin
Set:
```js
pinned: true
```
Use for the most important updates only.

## Add case study questions
Put full questions in:
```js
questions: [
  "Question 1",
  "Question 2"
]
```
Users click **View details** to read them.

## Accuracy rules
- Never post unconfirmed information.
- Always include `source`.
- Always update `updatedAt`.
- Keep `dueLabel` and `dateValue` in sync.
- Use `detail` for full explanations.
- Use `questions` for real assignment prompts.
- Keep old items only if they still help the class.

## Stable routine
### Daily
- confirm new lecturer announcements
- update urgent notices
- adjust postponed or fasttracked items

### End of day
- mark completed items as done
- correct any changes from class

### End of week
- remove stale notices
- add next week's tasks
- update `SITE_CONFIG.lastUpdated`
- update `SITE_CONFIG.weekFocus`
