# Menu Structure Fix

## Changes Made

### Before

- All users (logged-in and logged-out) saw the same base menu with "Home" included
- Logged-in users had additional "Dashboard" and "Profile" links appended
- This resulted in logged-in users seeing "Home" which redirected to the landing page

### After

- **Logged-out users see:** HOME, GET STARTED
- **Logged-in users see:** VENUES, COLLECTIONS, DOSSIERS, DISCOVER, PLANNING, TIMELINE, CONTACT, DASHBOARD, PROFILE, SIGN OUT

### Code Changes

**Navigation.tsx (lines 13-32)**

```typescript
// Menu for logged-out users
const publicMenu = [
  { href: "/", label: "Home" },
  { href: "/onboarding-new", label: "Get Started" },
];

// Menu for logged-in users
const authenticatedMenu = [
  { href: "/venues", label: "Venues" },
  { href: "/collections", label: "Collections" },
  { href: "/dossiers", label: "Dossiers" },
  { href: "/discover", label: "Discover" },
  { href: "/planning", label: "Planning" },
  { href: "/timeline", label: "Timeline" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
];

const allLinks = isAuthenticated ? authenticatedMenu : publicMenu;
```

## Testing Results

✅ All 37 tests passing
✅ TypeScript compilation successful
✅ No console errors
✅ Navigation renders correctly for both states

## Expected Behavior

### Logged-Out User

- Sees: HOME, GET STARTED, SIGN IN button
- Clicking "Home" → Landing page (/)
- Clicking "Get Started" → Onboarding (/onboarding-new)
- Clicking "Sign In" → OAuth login flow

### Logged-In User

- Sees: VENUES, COLLECTIONS, DOSSIERS, DISCOVER, PLANNING, TIMELINE, CONTACT, DASHBOARD, PROFILE, SIGN OUT button
- Does NOT see: HOME
- Clicking "Dashboard" → Planning Hub (/dashboard)
- Clicking "Profile" → User profile page (/profile)
- Clicking "Sign Out" → Logs out and redirects to landing page

## Fix Summary

✅ Removed "Home" from logged-in menu
✅ Created separate menu structures for different auth states
✅ Added "Get Started" link for logged-out users
✅ Preserved all existing functionality
✅ No breaking changes to routes or authentication
