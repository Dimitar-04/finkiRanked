const supabase = require('../supabaseClient');

async function deleteAllUsers() {
  // 1. Get all user IDs from the users table
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('id');
  if (fetchError) {
    console.error('Error fetching users:', fetchError);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found.');
    return;
  }

  // 2. Delete users from Supabase Auth
  for (const user of users) {
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
    if (authError) {
      if (authError.status === 404 && authError.code === 'user_not_found') {
        console.warn(`Auth user ${user.id} not found (already deleted).`);
      } else {
        console.error(`Error deleting auth user ${user.id}:`, authError);
      }
    } else {
      console.log(`Deleted auth user ${user.id}`);
    }
  }
  // 3. Delete all users from the users table
  const { error: tableError } = await supabase
    .from('users')
    .delete()
    .not('id', 'is', null);
  if (tableError) {
    console.error('Error deleting users from table:', tableError);
  } else {
    console.log('Deleted all users from users table.');
  }
}

deleteAllUsers();
