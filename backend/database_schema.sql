-- SQL schema for mockup_templates table

CREATE TABLE mockup_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(255) NOT NULL, -- Path to the device frame image
    screen_x INTEGER, -- X-coordinate for wallpaper top-left on the frame image
    screen_y INTEGER, -- Y-coordinate for wallpaper top-left on the frame image
    screen_width INTEGER, -- Width of the wallpaper area on the frame image
    screen_height INTEGER, -- Height of the wallpaper area on the frame image
    css_class VARCHAR(100), -- A class name to apply on the frontend for this template
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example of how to update the updated_at column automatically on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mockup_templates_updated_at
    BEFORE UPDATE
    ON
        mockup_templates
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
