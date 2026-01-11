-- Notifications Table
-- Stores user notifications and alerts

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    
    -- Status
    read BOOLEAN DEFAULT false,
    
    -- Optional link to related entity
    entity_type VARCHAR(50), -- 'design', 'plan', 'credit', etc.
    entity_id UUID,
    link VARCHAR(255), -- URL to navigate to when clicked
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: System can insert notifications for any user
CREATE POLICY "System can insert notifications"
    ON notifications
    FOR INSERT
    WITH CHECK (true);

-- Function to create welcome notification for new users
CREATE OR REPLACE FUNCTION create_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create welcome notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        NEW.id,
        'Welcome to Pixova! 🎉',
        'Your account has been created successfully. Start creating amazing designs with AI!',
        'success'
    );
    
    -- Create credits notification
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        NEW.id,
        'Free Credits Added ✨',
        'You received 100 free AI credits to get started. Create your first design now!',
        'info'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create welcome notifications for new users
DROP TRIGGER IF EXISTS trigger_create_welcome_notification ON auth.users;
CREATE TRIGGER trigger_create_welcome_notification
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_welcome_notification();

-- Function to create notification when credits are low
CREATE OR REPLACE FUNCTION check_low_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if credits dropped below 20 and weren't already low
    IF NEW.credits < 20 AND OLD.credits >= 20 THEN
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.id,
            'Credits Running Low ⚠️',
            'You have less than 20 AI credits remaining. Upgrade your plan to continue creating.',
            'warning',
            '/pricing'
        );
    END IF;
    
    -- Check if credits depleted
    IF NEW.credits = 0 AND OLD.credits > 0 THEN
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.id,
            'Credits Depleted 🚫',
            'You have run out of AI credits. Upgrade your plan to continue creating designs.',
            'error',
            '/pricing'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to monitor credit levels
DROP TRIGGER IF EXISTS trigger_check_low_credits ON user_profiles;
CREATE TRIGGER trigger_check_low_credits
    AFTER UPDATE OF credits ON user_profiles
    FOR EACH ROW
    WHEN (NEW.credits IS DISTINCT FROM OLD.credits)
    EXECUTE FUNCTION check_low_credits();

-- Function to create notification when design is created
CREATE OR REPLACE FUNCTION notify_design_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, title, message, type, entity_type, entity_id, link)
    VALUES (
        NEW.user_id,
        'Design Created Successfully! 🎨',
        format('Your design "%s" has been generated and saved.', NEW.name),
        'success',
        'design',
        NEW.id,
        format('/editor?id=%s', NEW.id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify when design is created
DROP TRIGGER IF EXISTS trigger_notify_design_created ON designs;
CREATE TRIGGER trigger_notify_design_created
    AFTER INSERT ON designs
    FOR EACH ROW
    EXECUTE FUNCTION notify_design_created();

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET read = true, read_at = NOW()
    WHERE id = notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET read = true, read_at = NOW()
    WHERE user_id = auth.uid() AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete old read notifications (cleanup job)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications
    WHERE read = true
    AND read_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE notifications IS 'Stores user notifications and alerts';
COMMENT ON COLUMN notifications.type IS 'Notification type: info, success, warning, or error';
COMMENT ON COLUMN notifications.entity_type IS 'Type of related entity (design, plan, credit, etc.)';
COMMENT ON COLUMN notifications.metadata IS 'Additional notification data in JSON format';
