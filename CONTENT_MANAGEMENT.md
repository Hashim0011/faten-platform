# Content Management - Database Integration

## Overview
Content added by admins and experts is now stored in Supabase and displayed to all users.

## How It Works

### 1. Adding Content (Admin/Expert)

**Admin Dashboard:**
- Navigate to "إدارة المحتوى" section
- Click "إضافة محتوى" button
- Fill in the form:
  - Title (required)
  - Content type: ebook/video/article
  - Category (required)
  - Author (required)
  - Description (required)
  - Image URL (optional - defaults to placeholder)
  - Content URL (optional)
  - Status: published/draft
- Click "إضافة المحتوى"
- Content is saved to Supabase `content` table

**Expert Dashboard:**
- Same process as Admin Dashboard
- Navigate to "إدارة المحتوى" section
- Click "إضافة محتوى" button

### 2. Viewing Content (All Users)

**User Dashboard:**
- All published content is displayed
- Content is automatically fetched from Supabase
- Users can browse by tabs:
  - Books (الكتب)
  - Videos (مقاطع الفيديو)
  - Articles (المقالات)
- Search functionality available

### 3. Deleting Content (Admin/Expert)

- Click the trash icon on any content card
- Confirm deletion
- Content is removed from database
- Page updates automatically

## Database Schema

### Content Table
```sql
- id (UUID)
- title (TEXT)
- description (TEXT)
- content_type ('article' | 'video' | 'ebook')
- category (TEXT)
- author (TEXT)
- image_url (TEXT)
- content_url (TEXT, optional)
- status ('published' | 'draft' | 'archived')
- views_count (INTEGER, default 0)
- likes_count (INTEGER, default 0)
- created_by_expert_id (UUID, references experts.id)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- published_at (TIMESTAMPTZ)
```

## Key Files

### New Components
- `src/components/AddContentModal.tsx` - Modal for adding content
- `src/components/ContentGrid.tsx` - Grid display for content cards
- `src/hooks/useContent.ts` - Hook for content CRUD operations
- `src/hooks/usePublicContent.ts` - Hook for fetching published content
- `src/pages/AdminDashboardContent.tsx` - Content section for admin
- `src/pages/ExpertDashboardContent.tsx` - Content section for expert

### Integration Points
- Admin Dashboard: Uses AddContentModal and ContentGrid
- Expert Dashboard: Uses AddContentModal and ContentGrid
- User Dashboard: Can be updated to use usePublicContent hook

## Features

### Admin/Expert Features
- Add new content with full details
- Delete existing content
- View all content (published and drafts)
- Search through content
- Filter content (placeholder)

### User Features
- View all published content
- Browse by content type
- Search functionality
- See views and likes count
- Content automatically updates when admin/expert adds new items

## Row Level Security (RLS)

The database enforces RLS policies:
- Anyone (authenticated) can view published content
- Admins and experts can create content
- Only content creators and admins can update/delete content
- Users can only see published content

## To Use

1. **Setup accounts** (if not done):
   - Visit `/setup-accounts`
   - Click "إنشاء الحسابات"

2. **Login as Admin/Expert**:
   - admin@example.com / Admin@123
   - expert@example.com / Expert@123

3. **Add content**:
   - Navigate to content management section
   - Click "إضافة محتوى"
   - Fill form and submit

4. **View as user**:
   - Register a regular user account
   - Login and see published content on dashboard

## Next Steps

To fully integrate with existing dashboards:
1. Replace mock content arrays in Dashboard.tsx with `usePublicContent` hook
2. Replace content section in AdminDashboard.tsx with `<AdminDashboardContent />`
3. Replace content section in ExpertDashboard.tsx with `<ExpertDashboardContent />`
