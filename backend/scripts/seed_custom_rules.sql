-- Seed Custom Validation Rules
-- This script creates example custom validation rules for testing and demonstration

-- 1. Non-negative balance rule (simple numeric comparison)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'non_negative_balance',
    'Non-Negative Balance',
    'Ensures account balance is greater than or equal to zero',
    'custom',
    '{
        "expression": "value >= 0",
        "error_message": "Balance cannot be negative",
        "field": "balance"
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 2. Valid CPF format rule (regex validation)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'valid_cpf_format',
    'Valid CPF Format',
    'Validates Brazilian CPF format (XXX.XXX.XXX-XX)',
    'custom',
    '{
        "expression": "matches \"^\\\\d{3}\\\\.\\\\d{3}\\\\.\\\\d{3}-\\\\d{2}$\"",
        "error_message": "CPF must be in format XXX.XXX.XXX-XX",
        "field": "cpf",
        "fail_on_missing": false
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 3. Valid email format rule (regex validation)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'valid_email',
    'Valid Email Address',
    'Validates email address format',
    'custom',
    '{
        "expression": "matches \"^[\\\\w\\\\.-]+@[\\\\w\\\\.-]+\\\\.[a-zA-Z]{2,}$\"",
        "error_message": "Invalid email address format",
        "field": "email",
        "fail_on_missing": false
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 4. Minimum age requirement (numeric comparison)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'minimum_age_18',
    'Minimum Age 18',
    'Ensures person is at least 18 years old',
    'custom',
    '{
        "expression": "value >= 18",
        "error_message": "Age must be at least 18",
        "field": "age",
        "fail_on_missing": true
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 5. Password strength rule (length check)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'strong_password',
    'Strong Password',
    'Password must be at least 8 characters long',
    'custom',
    '{
        "expression": "len(value) >= 8",
        "error_message": "Password must be at least 8 characters",
        "field": "password",
        "fail_on_missing": false
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 6. Valid phone format (Brazilian)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'valid_phone_br',
    'Valid Brazilian Phone',
    'Validates Brazilian phone format (XX) XXXXX-XXXX',
    'custom',
    '{
        "expression": "matches \"^\\\\(\\\\d{2}\\\\)\\\\s\\\\d{4,5}-\\\\d{4}$\"",
        "error_message": "Phone must be in format (XX) XXXXX-XXXX",
        "field": "phone",
        "fail_on_missing": false
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 7. Credit limit within range (complex CEL expression)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'valid_credit_limit',
    'Valid Credit Limit',
    'Credit limit must be between 0 and 100000',
    'custom',
    '{
        "expression": "data.credit_limit >= 0 && data.credit_limit <= 100000",
        "error_message": "Credit limit must be between 0 and 100,000"
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 8. Active account with positive balance (complex CEL expression)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'active_account_positive_balance',
    'Active Account Balance Check',
    'Active accounts must have positive balance',
    'custom',
    '{
        "expression": "data.status != ''active'' || data.balance > 0",
        "error_message": "Active accounts must maintain a positive balance"
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 9. Username length and format (length check)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'valid_username_length',
    'Valid Username Length',
    'Username must be between 3 and 20 characters',
    'custom',
    '{
        "expression": "len(value) >= 3 && len(value) <= 20",
        "error_message": "Username must be between 3 and 20 characters",
        "field": "username",
        "fail_on_missing": true
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 10. Non-empty required field (length check)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'non_empty_name',
    'Non-Empty Name',
    'Name field cannot be empty',
    'custom',
    '{
        "expression": "len(value) > 0",
        "error_message": "Name cannot be empty",
        "field": "name",
        "fail_on_missing": true
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 11. Percentage value validation (0-100)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'valid_percentage',
    'Valid Percentage',
    'Value must be between 0 and 100',
    'custom',
    '{
        "expression": "value >= 0 && value <= 100",
        "error_message": "Percentage must be between 0 and 100",
        "field": "percentage"
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 12. Valid CNPJ format (regex validation)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'valid_cnpj_format',
    'Valid CNPJ Format',
    'Validates Brazilian CNPJ format (XX.XXX.XXX/XXXX-XX)',
    'custom',
    '{
        "expression": "matches \"^\\\\d{2}\\\\.\\\\d{3}\\\\.\\\\d{3}/\\\\d{4}-\\\\d{2}$\"",
        "error_message": "CNPJ must be in format XX.XXX.XXX/XXXX-XX",
        "field": "cnpj",
        "fail_on_missing": false
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 13. Transaction amount positive (for payment transactions)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'positive_transaction_amount',
    'Positive Transaction Amount',
    'Transaction amount must be greater than zero',
    'custom',
    '{
        "expression": "value > 0",
        "error_message": "Transaction amount must be greater than zero",
        "field": "amount",
        "fail_on_missing": true
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 14. Valid PIX key format (Brazilian instant payment)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'valid_pix_key',
    'Valid PIX Key',
    'Validates PIX key format (email, phone, CPF, CNPJ, or random key)',
    'custom',
    '{
        "expression": "len(value) > 0",
        "error_message": "PIX key cannot be empty",
        "field": "pix_key",
        "fail_on_missing": false
    }'::jsonb,
    true
) ON CONFLICT (name) DO NOTHING;

-- 15. Future date validation (using CEL)
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'future_date_required',
    'Future Date Required',
    'Date must be in the future',
    'custom',
    '{
        "expression": "data.date > timestamp(now())",
        "error_message": "Date must be in the future"
    }'::jsonb,
    false
) ON CONFLICT (name) DO NOTHING;

-- Print summary
SELECT
    COUNT(*) as total_rules,
    COUNT(CASE WHEN is_system THEN 1 END) as system_rules,
    COUNT(CASE WHEN NOT is_system THEN 1 END) as custom_rules
FROM validation_rules
WHERE rule_type = 'custom';

-- Show all custom rules
SELECT
    name,
    display_name,
    description,
    is_system,
    config->'expression' as expression,
    config->'error_message' as error_message
FROM validation_rules
WHERE rule_type = 'custom'
ORDER BY is_system DESC, name;
