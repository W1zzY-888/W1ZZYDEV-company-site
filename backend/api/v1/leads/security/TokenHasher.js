import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { InfrastructureError } from '../../../../core/errors.js';

export class TokenHasher {
  constructor({ secret, version = 'v1' }) {
    this.secret = secret;
    this.version = version;
  }

  ensureReady() {
    if (!this.secret || this.secret.length < 24) throw new InfrastructureError('Public token hash secret is not configured');
  }

  generate() {
    return `lead_${randomBytes(24).toString('base64url')}`;
  }

  hash(token) {
    this.ensureReady();
    const digest = createHmac('sha256', this.secret).update(String(token)).digest('base64url');
    return `${this.version}:${digest}`;
  }

  verify(token, hash) {
    const candidate = Buffer.from(this.hash(token));
    const stored = Buffer.from(String(hash || ''));
    return candidate.length === stored.length && timingSafeEqual(candidate, stored);
  }
}
