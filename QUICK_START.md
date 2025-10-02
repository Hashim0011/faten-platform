# Quick Start - Supabase Authentication

## ✅ Migration Complete

Your authentication system now uses **Supabase only** with a unified `profiles` table instead of separate admin/expert/user tables.

---

## 🚀 Get Started (3 Steps)

### Step 1: Run SQL Migration

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Open the file: `CREATE_PROFILES_TABLE.sql`
4. Copy and paste into SQL Editor
5. Click **Run**

**Expected output:**
```
✅ Profiles table created successfully!
✅ RLS policies enabled
✅ Existing data migrated
✅ Default accounts created

Test accounts:
  Admin: admin@example.com / Admin@123
  Expert: expert@example.com / Expert@123
```

### Step 2: Verify Setup

Visit: `http://localhost:5173/setup-accounts`

Should show:
- ✅ Admin account ready
- ✅ Expert account ready

### Step 3: Test Login

1. Go to: `http://localhost:5173/login`
2. Login with: `admin@example.com` / `Admin@123`
3. Should redirect to: `/admin-dashboard`

---

## 📊 What Changed

### Database Structure

**Before:**
- ❌ 3 separate tables: `admins`, `experts`, `users`
- ❌ Different columns for each table
- ❌ 3 queries to find user role

**After:**
- ✅ 1 unified table: `profiles`
- ✅ Consistent structure for all users
- ✅ 1 query to find user role

### Code Changes

**Before:**
```javascript
// Check multiple tables
const { data: admin } = await supabase.from('admins')...
const { data: expert } = await supabase.from('experts')...
const { data: user } = await supabase.from('users')...
```

**After:**
```javascript
// Single query
const { data: profile } = await supabase
  .from('profiles')
  .select('role, status')
  .eq('id', userId);
```

---

## 🎯 How It Works

### Login Flow

```
1. User enters email & password
   ↓
2. Supabase Auth validates credentials
   ↓
3. Query profiles table for role
   ↓
4. Check status = 'active'
   ↓
5. Redirect based on role:
   - admin  → /admin-dashboard
   - expert → /expert-dashboard
   - user   → /dashboard
```

### profiles Table Structure

```
id              UUID      (Primary key, references auth.users)
email           TEXT      (User email)
full_name       TEXT      (Full name)
role            TEXT      ('admin', 'expert', or 'user')
status          TEXT      ('active' or 'inactive')
avatar_url      TEXT      (Profile picture)
bio             TEXT      (Biography)
specialization  TEXT      (For experts)
permissions     JSONB     (For admins)
created_at      TIMESTAMP (Creation date)
updated_at      TIMESTAMP (Last update)
```

---

## 🔐 Test Accounts

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | admin@example.com | Admin@123 | /admin-dashboard |
| **Expert** | expert@example.com | Expert@123 | /expert-dashboard |

---

## 📝 Usage Examples

### Get User Profile

```javascript
import { getUserProfile } from '../lib/supabaseClient';

const profile = await getUserProfile(userId);

console.log(profile.role);        // 'admin', 'expert', or 'user'
console.log(profile.status);      // 'active' or 'inactive'
console.log(profile.full_name);   // User's name
```

### Get User Role Only

```javascript
import { getUserRole } from '../lib/supabaseClient';

const role = await getUserRole(userId);

if (role === 'admin') {
  // Allow admin access
}
```

### Redirect by Role

```javascript
import { redirectByRole } from '../lib/supabaseClient';

redirectByRole('admin', navigate);
// Navigates to /admin-dashboard
```

### Check Current User

```javascript
import { supabase } from '../lib/supabaseClient';

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Get their profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

---

## 🛠️ Common Tasks

### Create New User

```javascript
// Sign up creates auth user and profile automatically
const { data, error } = await supabase.auth.signUp({
  email: 'newuser@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'New User',
      role: 'user' // Optional, defaults to 'user'
    }
  }
});
```

### Update Profile

```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Updated Name',
    bio: 'New bio',
    avatar_url: 'https://...'
  })
  .eq('id', userId);
```

### Change User Role (Admin only)

```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ role: 'expert' })
  .eq('id', userId);
```

### Deactivate Account (Admin only)

```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({ status: 'inactive' })
  .eq('id', userId);
```

---

## 🔒 Security (RLS)

The `profiles` table has Row Level Security enabled:

1. ✅ Users can read their own profile
2. ✅ Users can update their own profile (except role/status)
3. ✅ Admins can read all profiles
4. ✅ Admins can update all profiles
5. ✅ Only active users can login

---

## 📁 Files Modified

1. `src/lib/supabaseClient.js` - Query profiles table
2. `src/pages/Login.tsx` - Use profiles for role detection
3. `src/pages/LoginPage.jsx` - Already correct
4. `src/pages/SetupAccounts.tsx` - Check profiles table

---

## 📁 Files Created

1. `CREATE_PROFILES_TABLE.sql` - Database migration
2. `MIGRATION_COMPLETE.md` - Full documentation
3. `QUICK_START.md` - This guide

---

## ❓ Troubleshooting

### "No profile found"
User exists in auth but not in profiles table.

**Fix:**
```sql
INSERT INTO profiles (id, email, role, status)
VALUES (
  'user-id-here',
  'email@example.com',
  'user',
  'active'
);
```

### "Account is inactive"
Profile has `status = 'inactive'`.

**Fix:**
```sql
UPDATE profiles SET status = 'active' WHERE id = 'user-id-here';
```

### Wrong redirect
User has wrong role in profiles.

**Fix:**
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';
```

---

## ✨ You're Ready!

1. ✅ Run the SQL migration
2. ✅ Visit `/setup-accounts` to verify
3. ✅ Test login with admin account
4. ✅ Start building your app

Your authentication system is now:
- Simple and clean
- Using Supabase only
- Secure with RLS
- Ready for production

**Happy coding!** 🎉
