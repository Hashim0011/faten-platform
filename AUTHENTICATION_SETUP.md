# Supabase Authentication Setup - Complete Guide

## Overview
Your login system is now fully connected to **Supabase Auth** with role-based redirection using database queries (not metadata).

---

## Files Created/Updated

### 1. **supabaseClient.js** - Supabase Client & Helper Functions
**Location:** `src/lib/supabaseClient.js`

**Features:**
- Supabase client initialization
- `getUserRole()` function - queries database tables to find user role
- `redirectByRole()` function - handles automatic redirection

**Code:**
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getUserRole = async (userId) => {
  // Checks admins table first
  // Then experts table
  // Then users table
  // Returns: 'admin', 'expert', 'user', or null
};

export const redirectByRole = (role, navigate) => {
  // Redirects to appropriate dashboard
};
```

---

### 2. **LoginPage.jsx** - New Modern Login Page
**Location:** `src/pages/LoginPage.jsx`

**Features:**
- ✅ Email + Password authentication
- ✅ Supabase Auth integration
- ✅ Database role detection (queries tables)
- ✅ Automatic redirection by role
- ✅ Error handling with Arabic messages
- ✅ Loading states
- ✅ Password visibility toggle
- ✅ Test account hints

**Usage:**
```jsx
// In your router:
<Route path="/login-new" element={<LoginPage />} />
```

---

### 3. **Login.tsx** - Updated Existing Login
**Location:** `src/pages/Login.tsx`

**Updated:**
- Now queries database tables instead of using metadata
- Checks `admins`, `experts`, `users` tables in order
- Verifies `status = 'active'`
- Better error handling

---

## How It Works

### Login Flow:

1. **User enters email & password**
   ```javascript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: email,
     password: password
   });
   ```

2. **System queries database for role**
   ```javascript
   // Check admins table
   const { data: admin } = await supabase
     .from('admins')
     .select('user_id, status')
     .eq('user_id', data.user.id)
     .eq('status', 'active')
     .maybeSingle();

   if (admin) return 'admin';
   // Then check experts, then users...
   ```

3. **Automatic redirection**
   ```javascript
   if (role === 'admin')  → navigate('/admin-dashboard')
   if (role === 'expert') → navigate('/expert-dashboard')
   if (role === 'user')   → navigate('/dashboard')
   ```

---

## Database Requirements

Your Supabase database must have these tables:

### `admins` table
```sql
CREATE TABLE admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  status TEXT DEFAULT 'active',
  permissions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `experts` table
```sql
CREATE TABLE experts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  status TEXT DEFAULT 'active',
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `users` table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Test Accounts

Use these accounts to test (after running SETUP_ACCOUNTS.sql):

### Admin Account
- **Email:** admin@example.com
- **Password:** Admin@123
- **Redirects to:** `/admin-dashboard`

### Expert Account
- **Email:** expert@example.com
- **Password:** Expert@123
- **Redirects to:** `/expert-dashboard`

---

## Error Messages (Arabic)

| Error | Message |
|-------|---------|
| Invalid credentials | البريد الإلكتروني أو كلمة المرور غير صحيحة |
| No role found | لم يتم العثور على صلاحيات لهذا الحساب |
| Email not confirmed | يرجى تأكيد بريدك الإلكتروني أولاً |
| Generic error | حدث خطأ أثناء تسجيل الدخول |

---

## Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Usage Examples

### Using the new LoginPage component:
```jsx
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
```

### Using the helper functions directly:
```javascript
import { getUserRole, redirectByRole } from './lib/supabaseClient';

// Get user role
const role = await getUserRole(userId);

// Redirect based on role
redirectByRole(role, navigate);
```

---

## Key Differences from Old System

| Old System | New System |
|------------|------------|
| Used `user_metadata` | Queries database tables |
| Role stored in JWT | Role determined by table membership |
| Single source of truth | Separated by user type |
| No status checking | Checks `status = 'active'` |
| Less secure | More secure & flexible |

---

## Security Features

✅ **Active status checking** - Only active users can login
✅ **Database verification** - Role is not stored in JWT
✅ **Table-based permissions** - Separated admin/expert/user data
✅ **Email confirmation support** - Handles unconfirmed emails
✅ **Error message sanitization** - Safe error messages to users

---

## Troubleshooting

### Problem: "لم يتم العثور على صلاحيات"
**Solution:** User account exists in auth.users but not in admins/experts/users tables

**Fix:** Run this SQL:
```sql
-- Add user to users table
INSERT INTO users (user_id, email, full_name, status)
VALUES ('user-id-here', 'email@example.com', 'Full Name', 'active');
```

### Problem: Login works but wrong redirect
**Solution:** Check which table the user is in

**Fix:** Query the tables:
```sql
SELECT 'admin' as role FROM admins WHERE user_id = 'user-id'
UNION
SELECT 'expert' as role FROM experts WHERE user_id = 'user-id'
UNION
SELECT 'user' as role FROM users WHERE user_id = 'user-id';
```

### Problem: "Invalid login credentials"
**Solution:** Email or password is wrong, or account doesn't exist

**Fix:**
1. Verify email in Supabase Auth dashboard
2. Reset password if needed
3. Check if account is confirmed

---

## Next Steps

1. ✅ Run `SETUP_ACCOUNTS.sql` to create test accounts
2. ✅ Visit `/setup-accounts` to verify accounts are ready
3. ✅ Test login with admin@example.com / Admin@123
4. ✅ Test login with expert@example.com / Expert@123
5. ✅ Verify correct dashboard redirection

---

## Production Checklist

Before deploying to production:

- [ ] Change default account passwords
- [ ] Use real email addresses
- [ ] Enable email confirmation in Supabase
- [ ] Set up password reset flow
- [ ] Add rate limiting
- [ ] Enable 2FA if available
- [ ] Review RLS policies
- [ ] Test all error scenarios
- [ ] Add logging/monitoring

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify environment variables
4. Test with default accounts first
5. Check database table structure
