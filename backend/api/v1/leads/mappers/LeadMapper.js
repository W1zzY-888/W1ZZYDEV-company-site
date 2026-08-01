import { LeadDTO } from '../dto/LeadDTO.js';

export class LeadMapper {
  toDTO(lead) {
    if (!lead) return null;
    const { id, clientRequestId, ...publicFields } = lead;
    return new LeadDTO(publicFields);
  }
}
