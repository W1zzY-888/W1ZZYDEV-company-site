import './structure-check.js';
import './syntax-check.js';
import './imports-check.js';
import './build-check.js';
import '../routing/tests/routing-unit.test.js';
import '../routing/tests/routing-integration.test.js';
import '../routing/tests/routing-security.test.js';
import '../api/v1/leads/tests/lead-unit.test.js';
import '../api/v1/leads/tests/lead-integration.test.js';
import '../api/v1/leads/tests/persistence/lead-persistence.test.js';
import '../database/tests/migration-validation.test.js';
import './chat-locale-static.test.js';
import './chat-attachments-static.test.js';

console.log('backend-core checks: ok');
