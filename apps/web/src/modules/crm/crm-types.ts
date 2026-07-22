import type {
  ChangeLeadStageInput,
  ConvertLeadInput,
  CreateLeadFollowupInput,
  CreateLeadInput,
  CustomizeLeadStagesInput,
  LeadCardResponse,
  LeadConversionResponse,
  LeadFollowupMutationResponse,
  LeadImportResponse,
  LeadMutationResponse,
  LeadPipelineResponse,
  LeadStageMutationResponse,
  LeadStageResponse,
  ListLeadsQuery,
  ResponsibleResponse,
} from "@lyvox/validation";

export type Lead = LeadCardResponse;
export type LeadStage = LeadStageResponse;
export type Pipeline = LeadPipelineResponse;
export type PipelineFilters = ListLeadsQuery;
export type CreateLeadDraft = CreateLeadInput;
export type ChangeStageDraft = ChangeLeadStageInput;
export type FollowupDraft = CreateLeadFollowupInput;
export type ConvertDraft = ConvertLeadInput;
export type CustomizeStagesDraft = CustomizeLeadStagesInput;
export type Responsible = ResponsibleResponse;
export type { LeadConversionResponse, LeadFollowupMutationResponse, LeadImportResponse, LeadMutationResponse, LeadStageMutationResponse };
