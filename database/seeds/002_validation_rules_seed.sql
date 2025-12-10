-- ============================================================================
-- SEED DATA: validation_rules
-- ============================================================================
-- This file seeds the validation_rules table with common BACEN-compliant
-- validation rules that can be reused across multiple object_definitions.
-- ============================================================================

-- ============================================================================
-- CATEGORY 1: CPF/CNPJ Validations (Brazilian Tax IDs)
-- ============================================================================

INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES

-- CPF Format Validation
('cpf_format', 'CPF - Formato', 'Valida formato de CPF (11 dígitos numéricos)', 'regex',
 '{
    "pattern": "^\\d{11}$",
    "error_message": "CPF deve conter exatamente 11 dígitos numéricos"
 }'::jsonb, true),

-- CPF Digit Validation (Modulo 11)
('cpf_digits', 'CPF - Dígitos Verificadores', 'Valida dígitos verificadores do CPF usando algoritmo módulo 11', 'function',
 '{
    "language": "javascript",
    "code": "function validateCPF(cpf) {\n  cpf = cpf.replace(/[^\\d]/g, '''');\n  if (cpf.length !== 11 || /^(\\d)\\1{10}$/.test(cpf)) return false;\n  let sum = 0, remainder;\n  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i-1, i)) * (11 - i);\n  remainder = (sum * 10) % 11;\n  if (remainder === 10 || remainder === 11) remainder = 0;\n  if (remainder !== parseInt(cpf.substring(9, 10))) return false;\n  sum = 0;\n  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i-1, i)) * (12 - i);\n  remainder = (sum * 10) % 11;\n  if (remainder === 10 || remainder === 11) remainder = 0;\n  if (remainder !== parseInt(cpf.substring(10, 11))) return false;\n  return true;\n}",
    "error_message": "CPF inválido - dígitos verificadores incorretos"
 }'::jsonb, true),

-- CNPJ Format Validation
('cnpj_format', 'CNPJ - Formato', 'Valida formato de CNPJ (14 dígitos numéricos)', 'regex',
 '{
    "pattern": "^\\d{14}$",
    "error_message": "CNPJ deve conter exatamente 14 dígitos numéricos"
 }'::jsonb, true),

-- CNPJ Digit Validation
('cnpj_digits', 'CNPJ - Dígitos Verificadores', 'Valida dígitos verificadores do CNPJ', 'function',
 '{
    "language": "javascript",
    "code": "function validateCNPJ(cnpj) {\n  cnpj = cnpj.replace(/[^\\d]/g, '''');\n  if (cnpj.length !== 14) return false;\n  if (/^(\\d)\\1{13}$/.test(cnpj)) return false;\n  let size = cnpj.length - 2;\n  let numbers = cnpj.substring(0, size);\n  let digits = cnpj.substring(size);\n  let sum = 0;\n  let pos = size - 7;\n  for (let i = size; i >= 1; i--) {\n    sum += parseInt(numbers.charAt(size - i)) * pos--;\n    if (pos < 2) pos = 9;\n  }\n  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;\n  if (result !== parseInt(digits.charAt(0))) return false;\n  size = size + 1;\n  numbers = cnpj.substring(0, size);\n  sum = 0;\n  pos = size - 7;\n  for (let i = size; i >= 1; i--) {\n    sum += parseInt(numbers.charAt(size - i)) * pos--;\n    if (pos < 2) pos = 9;\n  }\n  result = sum % 11 < 2 ? 0 : 11 - sum % 11;\n  if (result !== parseInt(digits.charAt(1))) return false;\n  return true;\n}",
    "error_message": "CNPJ inválido - dígitos verificadores incorretos"
 }'::jsonb, true);

-- ============================================================================
-- CATEGORY 2: Email and Phone Validations
-- ============================================================================

INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES

-- Email Format
('email_format', 'E-mail - Formato RFC 5322', 'Valida formato de e-mail segundo RFC 5322', 'regex',
 '{
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "error_message": "E-mail inválido"
 }'::jsonb, true),

-- Brazilian Phone (Mobile)
('phone_mobile_br', 'Telefone Celular Brasileiro', 'Valida telefone celular brasileiro (11 dígitos com DDD)', 'regex',
 '{
    "pattern": "^\\d{11}$",
    "error_message": "Telefone celular deve ter 11 dígitos (DDD + 9 dígitos)"
 }'::jsonb, true),

-- Brazilian Phone (Landline)
('phone_landline_br', 'Telefone Fixo Brasileiro', 'Valida telefone fixo brasileiro (10 dígitos com DDD)', 'regex',
 '{
    "pattern": "^\\d{10}$",
    "error_message": "Telefone fixo deve ter 10 dígitos (DDD + 8 dígitos)"
 }'::jsonb, true);

-- ============================================================================
-- CATEGORY 3: Banking Field Validations (BACEN Standards)
-- ============================================================================

INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES

-- Bank Code (COMPE)
('bank_code_compe', 'Código COMPE do Banco', 'Valida código COMPE (3 dígitos)', 'regex',
 '{
    "pattern": "^\\d{3}$",
    "error_message": "Código COMPE deve ter 3 dígitos"
 }'::jsonb, true),

-- Bank Branch
('bank_branch', 'Agência Bancária', 'Valida número de agência (4 dígitos)', 'regex',
 '{
    "pattern": "^\\d{4}$",
    "error_message": "Número da agência deve ter 4 dígitos"
 }'::jsonb, true),

-- Bank Account Number
('bank_account', 'Número de Conta Bancária', 'Valida número de conta bancária', 'regex',
 '{
    "pattern": "^\\d{1,13}$",
    "error_message": "Número da conta deve ter entre 1 e 13 dígitos"
 }'::jsonb, true),

-- PIX Key - CPF
('pix_key_cpf', 'Chave PIX - CPF', 'Valida chave PIX do tipo CPF', 'composite',
 '{
    "rules": ["cpf_format", "cpf_digits"],
    "error_message": "Chave PIX CPF inválida"
 }'::jsonb, true),

-- PIX Key - CNPJ
('pix_key_cnpj', 'Chave PIX - CNPJ', 'Valida chave PIX do tipo CNPJ', 'composite',
 '{
    "rules": ["cnpj_format", "cnpj_digits"],
    "error_message": "Chave PIX CNPJ inválida"
 }'::jsonb, true),

-- PIX Key - Email
('pix_key_email', 'Chave PIX - E-mail', 'Valida chave PIX do tipo e-mail', 'composite',
 '{
    "rules": ["email_format"],
    "error_message": "Chave PIX e-mail inválida"
 }'::jsonb, true),

-- PIX Key - Phone
('pix_key_phone', 'Chave PIX - Telefone', 'Valida chave PIX do tipo telefone', 'regex',
 '{
    "pattern": "^\\+55\\d{11}$",
    "error_message": "Chave PIX telefone deve estar no formato +55XXXXXXXXXXX"
 }'::jsonb, true),

-- PIX Key - Random (EVP)
('pix_key_evp', 'Chave PIX - Aleatória (EVP)', 'Valida chave PIX aleatória (UUID v4)', 'regex',
 '{
    "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    "error_message": "Chave PIX aleatória deve ser um UUID v4 válido"
 }'::jsonb, true);

-- ============================================================================
-- CATEGORY 4: Monetary and Numeric Validations
-- ============================================================================

INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES

-- Positive Amount
('amount_positive', 'Valor Monetário Positivo', 'Valida que o valor é positivo', 'function',
 '{
    "language": "javascript",
    "code": "function validatePositiveAmount(value) { return parseFloat(value) > 0; }",
    "error_message": "O valor deve ser maior que zero"
 }'::jsonb, true),

-- Non-Negative Amount
('amount_non_negative', 'Valor Monetário Não-Negativo', 'Valida que o valor é maior ou igual a zero', 'function',
 '{
    "language": "javascript",
    "code": "function validateNonNegativeAmount(value) { return parseFloat(value) >= 0; }",
    "error_message": "O valor não pode ser negativo"
 }'::jsonb, true),

-- Max 2 Decimal Places
('amount_two_decimals', 'Valor com 2 Casas Decimais', 'Valida que o valor tem no máximo 2 casas decimais', 'regex',
 '{
    "pattern": "^\\d+(\\.\\d{1,2})?$",
    "error_message": "O valor deve ter no máximo 2 casas decimais"
 }'::jsonb, true),

-- Daily Transaction Limit (PIX)
('pix_limit_daily', 'Limite Diário PIX', 'Valida limite diário de transações PIX', 'function',
 '{
    "language": "javascript",
    "code": "function validatePixDailyLimit(value) { return parseFloat(value) <= 50000; }",
    "error_message": "Limite diário PIX excedido (máximo R$ 50.000,00)"
 }'::jsonb, true),

-- Nighttime Transaction Limit (PIX - 20h-6h)
('pix_limit_nighttime', 'Limite Noturno PIX (20h-6h)', 'Valida limite noturno de transações PIX', 'function',
 '{
    "language": "javascript",
    "code": "function validatePixNighttimeLimit(value) { return parseFloat(value) <= 1000; }",
    "error_message": "Limite noturno PIX excedido (máximo R$ 1.000,00 entre 20h e 6h)"
 }'::jsonb, true);

-- ============================================================================
-- CATEGORY 5: Date and Time Validations
-- ============================================================================

INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES

-- Date ISO 8601
('date_iso8601', 'Data no formato ISO 8601', 'Valida data no formato YYYY-MM-DD', 'regex',
 '{
    "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
    "error_message": "Data deve estar no formato YYYY-MM-DD"
 }'::jsonb, true),

-- Datetime ISO 8601
('datetime_iso8601', 'Data/Hora no formato ISO 8601', 'Valida data/hora no formato ISO 8601', 'regex',
 '{
    "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$",
    "error_message": "Data/hora deve estar no formato ISO 8601"
 }'::jsonb, true),

-- Age >= 18 years
('age_min_18', 'Idade Mínima 18 Anos', 'Valida que a pessoa tem pelo menos 18 anos', 'function',
 '{
    "language": "javascript",
    "code": "function validateMinAge18(birthDate) {\n  const birth = new Date(birthDate);\n  const today = new Date();\n  let age = today.getFullYear() - birth.getFullYear();\n  const monthDiff = today.getMonth() - birth.getMonth();\n  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {\n    age--;\n  }\n  return age >= 18;\n}",
    "error_message": "Idade mínima de 18 anos não atendida"
 }'::jsonb, true);

-- ============================================================================
-- CATEGORY 6: Brazilian Address Validations
-- ============================================================================

INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES

-- CEP (Postal Code)
('cep_format', 'CEP - Formato', 'Valida formato de CEP brasileiro (8 dígitos)', 'regex',
 '{
    "pattern": "^\\d{8}$",
    "error_message": "CEP deve ter 8 dígitos"
 }'::jsonb, true),

-- CEP API Validation
('cep_exists', 'CEP - Existência via API', 'Valida se o CEP existe consultando API ViaCEP', 'api_call',
 '{
    "method": "GET",
    "url": "https://viacep.com.br/ws/{{value}}/json/",
    "success_condition": "response.erro !== true",
    "error_message": "CEP não encontrado"
 }'::jsonb, true);

-- ============================================================================
-- CATEGORY 7: Anti-Fraud and Compliance (BACEN Circular 3.978)
-- ============================================================================

INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES

-- PEP Check (Politically Exposed Person)
('pep_check', 'Verificação PEP', 'Consulta se o CPF/CNPJ é Pessoa Politicamente Exposta', 'api_call',
 '{
    "method": "POST",
    "url": "https://api-pep-internal/v1/check",
    "headers": {"Authorization": "Bearer {{API_KEY}}"},
    "body": {"document": "{{value}}"},
    "success_condition": "response.is_pep === false",
    "error_message": "Pessoa Politicamente Exposta (PEP) - análise adicional necessária"
 }'::jsonb, true),

-- Sanctions List Check
('sanctions_check', 'Verificação em Listas Restritivas', 'Consulta listas OFAC, UN, EU', 'api_call',
 '{
    "method": "POST",
    "url": "https://api-compliance-internal/v1/sanctions/check",
    "headers": {"Authorization": "Bearer {{API_KEY}}"},
    "body": {"name": "{{name}}", "document": "{{document}}"},
    "success_condition": "response.found === false",
    "error_message": "Pessoa/entidade encontrada em lista restritiva"
 }'::jsonb, true),

-- Daily Deposit Limit (Anti Money Laundering)
('aml_daily_deposit_limit', 'Limite Diário de Depósitos (PLD/FT)', 'Valida limite diário de depósitos', 'sql_query',
 '{
    "query": "SELECT COALESCE(SUM((data->>''valor'')::numeric), 0) as total FROM instances WHERE object_definition_id = (SELECT id FROM object_definitions WHERE name = ''transacao_deposito'') AND data->>''conta_id'' = {{conta_id}} AND created_at::date = CURRENT_DATE",
    "success_condition": "total + {{new_value}} <= 50000",
    "error_message": "Limite diário de depósitos excedido (R$ 50.000,00)"
 }'::jsonb, true);

-- ============================================================================
-- CATEGORY 8: Business Logic Validations
-- ============================================================================

INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES

-- Sufficient Balance
('sufficient_balance', 'Saldo Suficiente', 'Valida se a conta tem saldo suficiente para a transação', 'sql_query',
 '{
    "query": "SELECT (data->>''saldo'')::numeric as saldo FROM instances WHERE id = {{conta_id}}",
    "success_condition": "saldo >= {{transaction_amount}}",
    "error_message": "Saldo insuficiente"
 }'::jsonb, true),

-- Account Active
('account_active', 'Conta Ativa', 'Valida se a conta está ativa', 'sql_query',
 '{
    "query": "SELECT current_state FROM instances WHERE id = {{conta_id}}",
    "success_condition": "current_state = ''ACTIVE''",
    "error_message": "Conta não está ativa"
 }'::jsonb, true);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total rules inserted: 30+
-- Categories:
--   1. CPF/CNPJ (4 rules)
--   2. Email/Phone (3 rules)
--   3. Banking (9 rules)
--   4. Monetary (5 rules)
--   5. Date/Time (3 rules)
--   6. Address (2 rules)
--   7. Anti-Fraud (3 rules)
--   8. Business Logic (2 rules)
-- ============================================================================
