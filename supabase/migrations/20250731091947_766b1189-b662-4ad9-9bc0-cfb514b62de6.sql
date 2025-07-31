-- Merge duplicate chats between users
-- This will consolidate messages from duplicate chat conversations into single chats

-- First, create a temporary function to merge chats
CREATE OR REPLACE FUNCTION merge_duplicate_chats()
RETURNS void AS $$
DECLARE
    chat_pair RECORD;
    keeper_chat_id UUID;
    duplicate_chat_id UUID;
BEGIN
    -- Find all duplicate chat pairs (where users have chats in both directions)
    FOR chat_pair IN 
        SELECT DISTINCT
            LEAST(c1.employee_id, c1.admin_id) as user1_id,
            GREATEST(c1.employee_id, c1.admin_id) as user2_id
        FROM chats c1
        WHERE c1.is_active = true
          AND EXISTS (
              SELECT 1 FROM chats c2 
              WHERE c2.is_active = true 
                AND c2.id != c1.id
                AND ((c2.employee_id = c1.admin_id AND c2.admin_id = c1.employee_id))
          )
    LOOP
        -- Find the chat to keep (the one with the most recent activity or earliest creation)
        SELECT c.id INTO keeper_chat_id
        FROM chats c
        WHERE c.is_active = true
          AND ((c.employee_id = chat_pair.user1_id AND c.admin_id = chat_pair.user2_id) 
               OR (c.employee_id = chat_pair.user2_id AND c.admin_id = chat_pair.user1_id))
        ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
        LIMIT 1;
        
        -- Find the duplicate chat to merge
        SELECT c.id INTO duplicate_chat_id
        FROM chats c
        WHERE c.is_active = true
          AND c.id != keeper_chat_id
          AND ((c.employee_id = chat_pair.user1_id AND c.admin_id = chat_pair.user2_id) 
               OR (c.employee_id = chat_pair.user2_id AND c.admin_id = chat_pair.user1_id));
               
        -- If we found a duplicate, merge the messages
        IF duplicate_chat_id IS NOT NULL THEN
            -- Move all messages from duplicate chat to keeper chat
            UPDATE messages 
            SET chat_id = keeper_chat_id 
            WHERE chat_id = duplicate_chat_id;
            
            -- Update the keeper chat's last_message_at if the duplicate had more recent activity
            UPDATE chats 
            SET last_message_at = GREATEST(
                COALESCE(chats.last_message_at, chats.created_at),
                (SELECT COALESCE(MAX(m.created_at), chats.created_at) FROM messages m WHERE m.chat_id = keeper_chat_id)
            )
            WHERE id = keeper_chat_id;
            
            -- Deactivate the duplicate chat
            UPDATE chats 
            SET is_active = false 
            WHERE id = duplicate_chat_id;
            
            RAISE NOTICE 'Merged chat % into chat % for users % and %', 
                duplicate_chat_id, keeper_chat_id, chat_pair.user1_id, chat_pair.user2_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the merge function
SELECT merge_duplicate_chats();

-- Drop the temporary function
DROP FUNCTION merge_duplicate_chats();