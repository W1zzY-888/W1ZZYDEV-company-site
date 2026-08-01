import { RoutingProvider } from '../../providers/RoutingProvider.js';
import { RoutingDecisionReason } from '../constants/routing-constants.js';
import { RoutingPolicy202607V1 } from '../policies/RoutingPolicy202607V1.js';

export class PolicyRoutingProvider extends RoutingProvider {
  constructor({ config, logger, policy = null }) {
    super();
    this.config = config;
    this.logger = logger;
    this.policy = policy || new RoutingPolicy202607V1({ policyVersion: config.get('routing.policyVersion') });
  }

  resolve(input = {}, context = {}) {
    const result = this.policy.decide(input);
    this.logDecision(result, context);
    return result;
  }

  resolveRoute(input = {}, context = {}) {
    return this.resolve(input, context);
  }

  logDecision(result, context = {}) {
    const event = result.reason === RoutingDecisionReason.CONFLICT_SAFE_RU
      ? 'routing.conflict'
      : result.reason === RoutingDecisionReason.INVALID_INPUT_SAFE_RU
        ? 'routing.invalid_input'
        : result.reason === RoutingDecisionReason.EXISTING_RESOURCE_LOCK
          ? 'routing.resource_lock'
          : 'routing.decision';
    const metadata = {
      requestId: context.requestId || '',
      resultingRegion: result.region,
      reason: result.reason,
      confidence: result.confidence,
      policyVersion: result.routingPolicyVersion,
      conflict: result.conflict === true,
      existingResourceLock: result.immutable === true
    };
    if (this.config.get('routing.debug') === true) metadata.evaluatedSignals = result.evaluatedSignals;
    this.logger?.info(event, metadata);
  }
}
