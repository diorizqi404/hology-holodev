-- Persist the farmer's ruleset choice when requesting trusted review.
ALTER TABLE decision_cases
  ADD COLUMN IF NOT EXISTS selected_action_option_id UUID;

ALTER TABLE decision_cases
  DROP CONSTRAINT IF EXISTS fk_decision_cases_selected_action_option;

ALTER TABLE decision_cases
  ADD CONSTRAINT fk_decision_cases_selected_action_option
  FOREIGN KEY (selected_action_option_id) REFERENCES action_options(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_decision_cases_selected_action_option_id
  ON decision_cases(selected_action_option_id);