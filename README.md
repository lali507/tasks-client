# מערכת ניהול משימות – לקוח React

הלקוח של מערכת ניהול המשימות: React 19, Vite ו-TypeScript.

- **האתר:** https://tasks-client-3r5m.onrender.com
- **השרת, ההסבר המלא, הוראות ההרצה ומשתמשי הדמו:** https://github.com/lali507/tasks-api#readme

## הרצה מקומית
דרוש Node.js 22.

```bash
npm install
```
יוצרים קובץ `.env.development` (לדוגמה, לפי `.env.example`) עם כתובת השרת:
```
VITE_API_URL=http://localhost:5122
```
הכתובת `5122` היא לשרת שרץ מ-Visual Studio. לשרת שרץ ב-Docker הכתובת היא `8080`.

ואז מריצים:
```bash
npm run dev
```
הלקוח עולה בכתובת http://localhost:5173.

## פריסה (Render Static Site)
| | |
|---|---|
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| משתנה סביבה | `VITE_API_URL` = כתובת השרת (נקרא בזמן ה-build) |
| Rewrite | `/*` ← `/index.html` |

## מבנה
| תיקייה | תוכן |
|---|---|
| `src/api` | שירות הבקשות (כתובת, טוקן, שגיאות ProblemDetails) והטיפוסים |
| `src/auth` | מצב ההתחברות (localStorage, ניתוק ב-401, סנכרון בין חלונות) |
| `src/components` | תפריט, טפסים, כרטיס משימה, חלון קופץ, עמודים |
| `src/pages` | התחברות, הרשמה, משימות, המשימות שלי, ניהול פרויקטים, תוויות ומשתמשים |
