-- Reset password for admin@hrapp.com to 'admin123'
-- First, let's check if the user exists and delete if needed to recreate
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the admin user if it exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@hrapp.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Delete the existing user completely
        DELETE FROM auth.users WHERE id = admin_user_id;
        RAISE NOTICE 'Deleted existing admin@hrapp.com user';
    END IF;
    
    -- Create new admin user with correct password
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        confirmation_token,
        recovery_sent_at,
        recovery_token,
        email_change_sent_at,
        email_change,
        email_change_token_new,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        auth_session_limit,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current_segment,
        email_change_token_new_segment
    ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'admin@hrapp.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        '',
        NOW(),
        '',
        NOW(),
        '',
        '',
        '',
        0,
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        NULL,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NOW(),
        '',
        ''
    );
    
    RAISE NOTICE 'Created new admin@hrapp.com user with password admin123';
END $$;