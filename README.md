<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ce59148c-0a06-4bca-b39b-d8edf296d5da

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### Development Commands

- `npm run dev` - Run the web app locally
- `npm run dev:electron` - Run the desktop app locally (Electron)

## Database Management

This project uses **Drizzle ORM** with **SQLite** (`dev.db`).

### View Database (GUI)
To open a visual interface for the database, run:
```bash
npm run db:studio
```
Then open [https://local.drizzle.studio](https://local.drizzle.studio) in your browser.

### VS Code Extensions
For viewing the database directly in the editor, we recommend:
- **SQLite Viewer** (by qwtel) - simplest for quick viewing.
- **SQLTools** with **SQLite driver** - for advanced SQL queries.

### Other DB Commands
- `npm run db:push` - Push schema changes to the database.
- `npm run db:generate` - Generate new migrations.
- `npm run db:migrate` - Apply pending migrations.
