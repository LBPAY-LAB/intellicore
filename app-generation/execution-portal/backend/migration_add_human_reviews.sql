-- Migration: Add Human Reviews Table
-- Purpose: Support Human-in-the-Loop review checkpoints every 6 hours

CREATE TABLE IF NOT EXISTS human_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    review_id TEXT NOT NULL UNIQUE,
    phase TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    summary TEXT NOT NULL,
    artifacts TEXT,  -- JSON array of artifact paths
    status TEXT NOT NULL DEFAULT 'AWAITING_APPROVAL',  -- AWAITING_APPROVAL | APPROVED | REJECTED
    approved_by TEXT,
    approved_at TEXT,
    rejection_reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE INDEX IF NOT EXISTS idx_human_reviews_session ON human_reviews(session_id);
CREATE INDEX IF NOT EXISTS idx_human_reviews_status ON human_reviews(status);
CREATE INDEX IF NOT EXISTS idx_human_reviews_review_id ON human_reviews(review_id);

-- Sample queries for portal UI:

-- Get pending reviews for current session
-- SELECT * FROM human_reviews WHERE session_id = ? AND status = 'AWAITING_APPROVAL' ORDER BY timestamp DESC;

-- Approve review
-- UPDATE human_reviews SET status = 'APPROVED', approved_by = ?, approved_at = datetime('now') WHERE review_id = ?;

-- Reject review
-- UPDATE human_reviews SET status = 'REJECTED', approved_by = ?, approved_at = datetime('now'), rejection_reason = ? WHERE review_id = ?;
