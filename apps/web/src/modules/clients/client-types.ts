import type {
  ClientDetailResponse as SharedClientDetailResponse,
  ClientListItemResponse,
  ClientListResponse as SharedClientListResponse,
  CreateClientInput,
  CursorMetaResponse,
  ListClientsQuery,
  ResponsibleResponse,
} from "@lyvox/validation";

export type ClientDraft = CreateClientInput;
export type ClientType = CreateClientInput["type"];
export type ClientStatus = CreateClientInput["status"];
export type ClientAddress = NonNullable<CreateClientInput["address"]>;
export type ClientContact = CreateClientInput["contacts"][number] & { id?: string };
export type ClientListFilters = ListClientsQuery;
export type Responsible = ResponsibleResponse;
export type Client = ClientListItemResponse;
export type CursorMeta = CursorMetaResponse;
export type ClientListResponse = SharedClientListResponse;
export type ClientDetailResponse = SharedClientDetailResponse;
export type ClientDetail = ClientDetailResponse["client"];
