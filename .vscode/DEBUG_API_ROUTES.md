# Debugging Next.js API Routes in VSCode

## Problem: Breakpoints Not Binding

If breakpoints in API routes (`src/app/api/**/route.ts`) are not working, follow these steps:

## Solution 1: Use the Recommended Debug Configuration

1. **Stop your current dev server** (if running)
2. **Set breakpoints** in your API route file (click in the gutter next to line numbers)
3. **Press F5** or go to **Run and Debug** (Ctrl+Shift+D / Cmd+Shift+D)
4. **Select**: `"Next.js: debug with inspect (Recommended)"`
5. **Click the green play button**

This configuration:
- Uses Node.js inspect mode
- Enables source maps
- Properly resolves source map locations including `.next` folder
- Works with Next.js 16 and Turbopack

## Solution 2: Manual Attach (If Already Running)

If your dev server is already running:

1. **Start dev server with debug mode**:
   ```bash
   npm run dev:debug
   ```

2. **In VSCode**: Press F5 → Select `"Attach to Next.js"`

3. **Set breakpoints** in your API route

4. **Make a request** to trigger the API route

## Solution 3: Disable Turbopack (If Issues Persist)

If breakpoints still don't work with Turbopack, you can disable it:

1. Update `package.json`:
   ```json
   "dev": "next dev --no-turbo",
   "dev:debug": "NODE_OPTIONS='--inspect' next dev --no-turbo"
   ```

2. Restart the debugger

## Troubleshooting

### Breakpoints show as "Unbound" (gray circle)

**Causes:**
- Source maps not generated
- Dev server not running in debug mode
- Wrong debug configuration selected

**Fix:**
1. Make sure you're using `"Next.js: debug with inspect (Recommended)"`
2. Check that `NODE_OPTIONS='--inspect'` is set
3. Restart VSCode and the debugger

### Breakpoints don't hit

**Causes:**
- Code path not executed
- Source map mismatch
- Turbopack caching issues

**Fix:**
1. Add `console.log()` to verify code is running
2. Clear `.next` folder: `rm -rf .next`
3. Restart debugger
4. Try disabling Turbopack (see Solution 3)

### "Cannot connect to runtime process"

**Fix:**
1. Make sure port 9229 is not in use
2. Check if another Node process is using it: `lsof -i :9229`
3. Kill the process if needed
4. Restart debugger

## Best Practices

1. **Always use the debug configuration** instead of running `npm run dev` manually
2. **Set breakpoints before starting debugger** (they bind better)
3. **Use Debug Console** to inspect variables
4. **Check the Debug panel** for any error messages

## Testing Breakpoints

1. Set a breakpoint in `src/app/api/auth/register/route.ts` (line 25 for example)
2. Start debugger with `"Next.js: debug with inspect (Recommended)"`
3. Open browser and go to `/register`
4. Fill the form and submit
5. Breakpoint should hit in VSCode

## Additional Configuration

The debug configuration now includes:
- ✅ Source maps enabled
- ✅ Proper source map resolution (including `.next` folder)
- ✅ Skip node internals
- ✅ Auto-attach filter
- ✅ Break on conditional errors

If issues persist, check:
- VSCode JavaScript Debugger extension is installed
- TypeScript version matches Next.js requirements
- No conflicting debug configurations

