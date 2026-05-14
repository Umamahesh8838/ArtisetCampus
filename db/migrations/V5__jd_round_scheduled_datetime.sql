-- Migration: V5__jd_round_scheduled_datetime.sql
-- Purpose: store the round date/time on the JD round config itself so the admin UI can persist it reliably.

ALTER TABLE tbl_cp_jd_round_config
  ADD COLUMN scheduled_datetime DATETIME NULL DEFAULT NULL AFTER is_exam;
