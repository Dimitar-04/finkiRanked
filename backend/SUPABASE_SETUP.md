# Supabase Setup Instructions

Follow these steps to set up Supabase for your project:

## 1. Create a Supabase Project

- Go to [https://app.supabase.com/](https://app.supabase.com/) and sign in or create an account.
- Click **New Project** and fill in the project name, password, and select a region.
- Wait for the project to initialize.

## 2. Get Your Supabase Credentials

- In your Supabase project dashboard, go to **Project Settings > API**.
- Copy the **Project URL** and **Service Role Key** (never expose the service role key to the frontend).
- Add these to your `.env` file in `/backend`:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 3. Enable Email Auth

- In the dashboard, go to **Authentication > Providers**.
- Enable **Email** provider.

## 4. Create the `users` Table

- Go to **Table Editor** in the dashboard.
- Click **New Table** and name it `users`.
- Add the following columns:
  - `id` (UUID, Primary Key, default value: `auth.uid()`)
  - `username` (text, unique)
  - `email` (text, unique)
- Save the table.

## 5. Set Row Level Security (RLS)

- Enable RLS for the `users` table.
- Add a policy to allow inserts by authenticated users (or by service role for admin registration).

## 6. (Optional) Add More Tables

- You can add more tables for posts, tasks, etc., as your app grows.

## 7. Test Registration

- Use your app's registration form to create a new user. The backend will use Supabase Auth and insert into the `users` table.

---

**Note:** Never expose your service role key to the frontend. Only use it in the backend.

For more details, see the [Supabase documentation](https://supabase.com/docs).
