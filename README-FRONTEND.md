Frontend run instructions

From the repository root ("D:/DTANS/Final Project") run:

1) Install frontend dependencies:

```powershell
npm run install:frontend
```

2) Start the dev server:

```powershell
npm run dev:frontend
```

Notes:
- If you get permission/EPERM errors on Windows, run your terminal as Administrator or check antivirus/Windows Defender interference.
- If `npm run install:frontend` fails, cd into `frontend` and run `npm install` manually.
- The `dev` script uses Vite and will serve the app, usually at http://localhost:5173
