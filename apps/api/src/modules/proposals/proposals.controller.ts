import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { AUTHORIZATION_CONTEXT, type AuthorizationContext } from "../../core/authorization/authorization-context.js";
import { RequirePermission } from "../../core/authorization/access-policy.js";
import { AuthService } from "../auth/auth.service.js";
import { ProposalsService } from "./proposals.service.js";
import { createProposalSchema, convertProposalToContractSchema, updateProposalSchema } from "@lyvox/validation";

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: AuthorizationContext };

@Controller("propostas")
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @RequirePermission("proposals.read")
  async list(@Query("clientId") clientId?: string) {
    return this.proposalsService.listProposals(clientId);
  }

  @Get(":id")
  @RequirePermission("proposals.read")
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.proposalsService.getProposalById(id);
  }

  @Post()
  @RequirePermission("proposals.create")
  async create(@Req() req: AuthorizedRequest, @Body() body: unknown) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = createProposalSchema.parse(body);
    return this.proposalsService.createProposal(payload, actor?.user.id);
  }

  @Put(":id")
  @RequirePermission("proposals.update")
  async update(
    @Req() req: AuthorizedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown
  ) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = updateProposalSchema.parse(body);
    return this.proposalsService.updateProposal(id, payload, actor?.user.id);
  }

  @Post(":id/aprovar")
  @RequirePermission("proposals.approve")
  async approve(@Req() req: AuthorizedRequest, @Param("id", ParseUUIDPipe) id: string) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    return this.proposalsService.approveProposal(id, actor?.user.id);
  }

  @Post(":id/converter-contrato")
  @RequirePermission("contracts.create")
  async convertToContract(
    @Req() req: AuthorizedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown
  ) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = convertProposalToContractSchema.parse(body);
    return this.proposalsService.convertToContract(id, payload, actor?.user.id);
  }
}

@Controller("contratos")
export class ContractsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Get()
  @RequirePermission("contracts.read")
  async listContracts(@Query("clientId") clientId?: string) {
    return this.proposalsService.listContracts(clientId);
  }

  @Get(":id")
  @RequirePermission("contracts.read")
  async getContractById(@Param("id", ParseUUIDPipe) id: string) {
    return this.proposalsService.getContractById(id);
  }
}
