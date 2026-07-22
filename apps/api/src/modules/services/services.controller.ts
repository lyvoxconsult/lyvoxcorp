import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { AUTHORIZATION_CONTEXT, type AuthorizationContext } from "../../core/authorization/authorization-context.js";
import { RequirePermission } from "../../core/authorization/access-policy.js";
import { AuthService } from "../auth/auth.service.js";
import { ServicesService } from "./services.service.js";
import { createServiceSchema, updateServicePriceSchema, updateServiceSchema } from "@lyvox/validation";

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: AuthorizationContext };

@Controller("servicos")
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @RequirePermission("services.read")
  async list(@Query("category") category?: string) {
    return this.servicesService.listServices(category);
  }

  @Get(":id")
  @RequirePermission("services.read")
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.servicesService.getServiceById(id);
  }

  @Post()
  @RequirePermission("services.create")
  async create(@Req() req: AuthorizedRequest, @Body() body: unknown) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = createServiceSchema.parse(body);
    return this.servicesService.createService(payload, actor?.user.id);
  }

  @Put(":id")
  @RequirePermission("services.update")
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

    const payload = updateServiceSchema.parse(body);
    return this.servicesService.updateService(id, payload, actor?.user.id);
  }

  @Put(":id/precos")
  @RequirePermission("services.update")
  async updatePrice(
    @Req() req: AuthorizedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown
  ) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = updateServicePriceSchema.parse(body);
    return this.servicesService.updateServicePrice(id, payload, actor?.user.id);
  }

  @Delete(":id")
  @RequirePermission("services.delete")
  async delete(@Req() req: AuthorizedRequest, @Param("id", ParseUUIDPipe) id: string) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    return this.servicesService.deleteService(id, actor?.user.id);
  }
}
