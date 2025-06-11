-- Add order column to departments table
-- Run this SQL command in your database management tool (phpMyAdmin, MySQL Workbench, etc.)

ALTER TABLE departments ADD COLUMN `order` INT DEFAULT 0 AFTER icon_path;

-- Update existing departments with sequential order values
SET @row_number = 0;
UPDATE departments SET `order` = (@row_number:=@row_number+1) - 1 ORDER BY id;

-- Verify the changes
SELECT id, name, `order` FROM departments ORDER BY `order`, id; 