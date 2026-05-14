-- V6__exam_session_enhancements.sql
-- Add lifecycle, token, timers, reconnect support to exam sessions.
ALTER TABLE tbl_cp_exam_session
  ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'pending' AFTER round_config_id,
  ADD COLUMN session_token VARCHAR(64) NULL DEFAULT NULL AFTER status,
  ADD COLUMN allotted_seconds INT NULL DEFAULT NULL AFTER session_token,
  ADD COLUMN started_at DATETIME NULL DEFAULT NULL AFTER allotted_seconds,
  ADD COLUMN ended_at DATETIME NULL DEFAULT NULL AFTER started_at,
  ADD COLUMN last_heartbeat DATETIME NULL DEFAULT NULL AFTER ended_at,
  ADD COLUMN allow_reconnect TINYINT(1) NOT NULL DEFAULT 0 AFTER last_heartbeat;

-- Add richer response fields for answer text/files and autosave
ALTER TABLE tbl_cp_m2m_exam_question_response
  ADD COLUMN answer_text TEXT NULL AFTER marks_awarded,
  ADD COLUMN file_url VARCHAR(512) NULL AFTER answer_text,
  ADD COLUMN is_draft TINYINT(1) NOT NULL DEFAULT 0 AFTER file_url,
  ADD COLUMN saved_at DATETIME NULL DEFAULT NULL AFTER is_draft;

-- Optional indexes (improve lookups)
CREATE INDEX idx_exam_session_token ON tbl_cp_exam_session(session_token);
CREATE INDEX idx_exam_session_status ON tbl_cp_exam_session(status);
-- user_id column does not exist; index on exam_session_id + question_id is more appropriate
CREATE INDEX idx_response_exam_question ON tbl_cp_m2m_exam_question_response(exam_session_id, question_id);
