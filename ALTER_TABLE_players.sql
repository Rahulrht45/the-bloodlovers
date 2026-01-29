-- Run this command in your Supabase SQL Editor to add the monthly MVP points column
ALTER TABLE players ADD COLUMN mvp_points_monthly INTEGER DEFAULT 0;
