# How to Update to New SharedCart Logo

## Steps:

1. **Save your new logo image** as `SharedCartLogo.png`

2. **Place the file in these two locations:**
   - `cards/frontend/src/assets/SharedCartLogo.png`
   - `cards/frontend/public/SharedCartLogo.png`

3. **After adding the files, run this command to update the code:**
   ```bash
   cd cards/frontend/src/components
   # Update PageTitle.tsx to use SharedCartLogo.png
   ```

4. **Or tell me when the file is added and I'll update the code for you!**

## File Requirements:
- Format: PNG (preferred) or any image format
- Recommended size: 512x512px or larger (will be scaled down)
- Transparent background recommended

## What will be updated:
- ✅ Logo on all auth pages (login, signup, etc.)
- ✅ Browser tab favicon
- ✅ Logo size: 100x100px (adjustable)

## Current Status:
- App is using `NewLogo.png` (working)
- Ready to switch to `SharedCartLogo.png` once file is added

