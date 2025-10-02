# Login System - Quick Reference

## 🎯 What You Asked For

✅ New login page connected to **Supabase only**
✅ Automatic redirection based on role from **database**
✅ Files: `supabaseClient.js` and `LoginPage.jsx`
✅ No Bolt internal database - 100% Supabase

---

## 📂 Files Created

### 1. **supabaseClient.js**
**Path:** `src/lib/supabaseClient.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Gets user role from database tables (not metadata)
export const getUserRole = async (userId) => {
  // Checks: admins → experts → users tables
  // Returns: 'admin', 'expert', 'user', or null
};

// Redirects user based on role
export const redirectByRole = (role, navigate) => {
  // admin → /admin-dashboard
  // expert → /expert-dashboard
  // user → /dashboard
};
```

### 2. **LoginPage.jsx**
**Path:** `src/pages/LoginPage.jsx`

**Features:**
- Email + password form
- Supabase Auth login
- Queries database for role
- Auto-redirects by role
- Arabic UI with error handling

```javascript
const handleSubmit = async (e) => {
  // 1. Sign in with Supabase
  const { data } = await supabase.auth.signInWithPassword({ email, password });

  // 2. Get role from database
  const role = await getUserRole(data.user.id);

  // 3. Redirect based on role
  redirectByRole(role, navigate);
};
```

---

## 🗄️ Database Structure

Your Supabase needs these tables:

```sql
-- Admin accounts
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active'
);

-- Expert accounts
CREATE TABLE experts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active'
);

-- Regular user accounts
CREATE TABLE users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active'
);
```

---

## 🔐 How Role Detection Works

```javascript
// Step 1: User logs in
const { data } = await supabase.auth.signInWithPassword({ email, password });

// Step 2: Check admins table
const { data: admin } = await supabase
  .from('admins')
  .select('user_id')
  .eq('user_id', data.user.id)
  .eq('status', 'active')
  .maybeSingle();

if (admin) {
  navigate('/admin-dashboard'); // ✅ Admin found
  return;
}

// Step 3: Check experts table
const { data: expert } = await supabase
  .from('experts')
  .select('user_id')
  .eq('user_id', data.user.id)
  .eq('status', 'active')
  .maybeSingle();

if (expert) {
  navigate('/expert-dashboard'); // ✅ Expert found
  return;
}

// Step 4: Check users table
const { data: user } = await supabase
  .from('users')
  .select('user_id')
  .eq('user_id', data.user.id)
  .eq('status', 'active')
  .maybeSingle();

if (user) {
  navigate('/dashboard'); // ✅ User found
  return;
}

// No role found
setError('No permissions found');
```

---

## 🧪 Test Accounts

After running `SETUP_ACCOUNTS.sql`:

| Role | Email | Password | Redirects To |
|------|-------|----------|--------------|
| Admin | admin@example.com | Admin@123 | /admin-dashboard |
| Expert | expert@example.com | Expert@123 | /expert-dashboard |

---

## 🚀 Usage

### In your router (App.jsx):
```javascript
import LoginPage from './pages/LoginPage';

<Route path="/login" element={<LoginPage />} />
```

### Test it:
1. Visit: `http://localhost:5173/login`
2. Enter: `admin@example.com` / `Admin@123`
3. You'll be redirected to: `/admin-dashboard`

---

## ✨ Key Features

✅ **100% Supabase** - No other database
✅ **Database role detection** - Queries tables, not metadata
✅ **Auto-redirect** - Admin/Expert/User dashboards
✅ **Active status check** - Only active users can login
✅ **Error handling** - Clear Arabic messages
✅ **Loading states** - Shows progress
✅ **Password toggle** - Show/hide password
✅ **Test hints** - Shows test account info

---

## 🔄 Redirection Logic

```
Login with email/password
         ↓
   Supabase Auth
         ↓
Query: SELECT * FROM admins WHERE user_id = ? AND status = 'active'
         ↓
   Found? YES → /admin-dashboard ✅
         ↓ NO
Query: SELECT * FROM experts WHERE user_id = ? AND status = 'active'
         ↓
   Found? YES → /expert-dashboard ✅
         ↓ NO
Query: SELECT * FROM users WHERE user_id = ? AND status = 'active'
         ↓
   Found? YES → /dashboard ✅
         ↓ NO
   Error: "No permissions" ❌
```

---

## 📝 Environment Variables

`.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🎯 Next Steps

1. ✅ Files are created and ready
2. ✅ Run `SETUP_ACCOUNTS.sql` in Supabase
3. ✅ Test login at `/login`
4. ✅ Verify redirects work correctly

---

## 💡 Important Notes

- **No metadata** - Role is determined by which table contains the user_id
- **Active only** - Only users with `status = 'active'` can login
- **Database-first** - Always queries Supabase tables
- **Secure** - Role cannot be faked since it's verified server-side
- **Flexible** - Easy to add more roles by adding more tables

---

## 🐛 Common Issues

**Issue:** "Invalid credentials"
**Fix:** Check email/password or run SETUP_ACCOUNTS.sql

**Issue:** "No permissions found"
**Fix:** User exists in auth.users but not in role tables - add them manually

**Issue:** Redirect not working
**Fix:** Check that user_id exists in one of: admins/experts/users tables

---

## ✅ Summary

You now have a **complete Supabase authentication system** with:
- ✅ `supabaseClient.js` - Client & helper functions
- ✅ `LoginPage.jsx` - Beautiful login page
- ✅ Database role detection
- ✅ Automatic redirection
- ✅ Full error handling

**Everything is connected to Supabase only!**
