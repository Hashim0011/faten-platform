# Account Setup Guide

## Problem
You had to create accounts every time - now the accounts are permanent in the database.

## Solution

### Option 1: Run SQL Script (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `SETUP_ACCOUNTS.sql`
4. Click **Run**

This will create:
- **Admin Account:** admin@example.com / Admin@123
- **Expert Account:** expert@example.com / Expert@123

### Option 2: Check Account Status

Visit `/setup-accounts` page and it will:
- ✅ Show if accounts are ready
- ❌ Show if accounts need to be created
- Provide login credentials

## Accounts Created

Once the SQL runs successfully, you'll have these permanent accounts:

### Admin Account
- Email: `admin@example.com`
- Password: `Admin@123`
- Access: Full platform admin dashboard

### Expert Account
- Email: `expert@example.com`
- Password: `Expert@123`
- Access: Expert dashboard with content management

## Using Your Real Email

If you want to use your real email instead, edit the SQL file and replace:
- `admin@example.com` → your email
- `Admin@123` → your password
- `expert@example.com` → your expert email
- `Expert@123` → your expert password

Then run the modified SQL.

## What Changed

**Before:**
- Had to click "إنشاء الحسابات" every time
- Accounts weren't persisting
- Email confirmation issues

**After:**
- Accounts are created once in the database
- Always ready to login
- No email confirmation needed
- Emails are pre-confirmed

## Login Flow

1. Visit `/setup-accounts` to verify accounts exist
2. Click "الانتقال لتسجيل الدخول"
3. Login with:
   - admin@example.com / Admin@123 (for admin)
   - expert@example.com / Expert@123 (for expert)
4. Start using the platform immediately

## Troubleshooting

**If login fails:**
1. Visit `/setup-accounts`
2. Check if accounts show as ready ✅
3. If not ready ❌, run the SQL script
4. Click "إعادة التحقق" to refresh status

**If SQL script fails:**
- Accounts might already exist (this is OK!)
- Check the Supabase logs for NOTICE messages
- Try logging in anyway - they might work

## Security Note

These are default accounts for development. In production:
- Change the passwords immediately
- Use your real email addresses
- Enable 2FA if available
- Consider removing example.com emails
