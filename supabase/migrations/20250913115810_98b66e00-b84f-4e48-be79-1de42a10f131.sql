do $$
declare
  v_user_id uuid;
begin
  -- Find the user id by email
  select id into v_user_id from auth.users where email = 'd0bl3@abv.bg';
  if v_user_id is null then
    raise exception 'User with email % not found', 'd0bl3@abv.bg';
  end if;

  -- Grant employer role (maps to Manager in UI) if not already present
  insert into public.user_roles (user_id, role)
  select v_user_id, 'employer'::public.app_role
  where not exists (
    select 1 from public.user_roles where user_id = v_user_id and role = 'employer'::public.app_role
  );
end $$;