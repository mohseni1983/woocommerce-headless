# VSCode Debug Configuration

This project includes VSCode debug configurations for Next.js development.

## Available Debug Configurations

### 1. Next.js: debug server-side
- Debugs server-side code (API routes, Server Components)
- Uses Node.js terminal
- Start: Press F5 and select this configuration

### 2. Next.js: debug client-side
- Debugs client-side code (React components in browser)
- Opens Chrome with debugging enabled
- Requires server to be running on `http://localhost:3000`

### 3. Next.js: debug full stack
- Automatically starts server and opens Chrome debugger
- Best for full-stack debugging
- Recommended for most use cases

### 4. Next.js: debug with inspect
- Uses Node.js inspect mode
- Best for debugging server-side issues
- Runs `npm run dev:debug`

### 5. Attach to Next.js
- Attach to an already running Next.js process
- Useful if you started the server manually

### 6. Next.js: debug server + client (Compound)
- Runs both server-side and client-side debuggers simultaneously
- Best for debugging full-stack issues

## How to Use

1. **Set Breakpoints**: Click in the gutter (left of line numbers) to set breakpoints
2. **Start Debugging**: 
   - Press `F5` or
   - Go to Run and Debug (Ctrl+Shift+D / Cmd+Shift+D)
   - Select a configuration from the dropdown
   - Click the green play button
3. **Debug Console**: View variables, evaluate expressions in the Debug Console panel

## Recommended Extensions

The `.vscode/extensions.json` file recommends:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript

Install them when VSCode prompts you.

## Tips

- **Server-side breakpoints**: Set breakpoints in API routes (`src/app/api/**`) and Server Components
- **Client-side breakpoints**: Set breakpoints in Client Components (files with `"use client"`)
- **Debug Console**: Use `console.log()` or the Debug Console to inspect variables
- **Watch Expressions**: Add variables to the Watch panel for continuous monitoring


