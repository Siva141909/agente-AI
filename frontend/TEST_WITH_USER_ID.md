# Testing with User ID

## Quick Setup

To test the application with your user ID without logging in, run this in your browser console:

```javascript
// Set your user ID
localStorage.setItem('user_id', '11111111-2222-3333-4444-555555555555');

// Set a dummy auth token (optional, but some checks might need it)
localStorage.setItem('auth_token', 'test-token');

// Refresh the page
window.location.reload();
```

## After Setting User ID

1. Navigate to any page (Dashboard, Transactions, Profile, etc.)
2. All data should load from the database for this user
3. No backend login required - data fetches directly from Supabase

## Verify It's Working

Check browser console - you should see:
- No "Not authenticated" errors
- Data loading from database
- User information displayed

## Reset

To clear and start fresh:
```javascript
localStorage.clear();
window.location.reload();
```

