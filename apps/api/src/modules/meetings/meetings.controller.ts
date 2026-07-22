import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { AUTHORIZATION_CONTEXT, type AuthorizationContext } from "../../core/authorization/authorization-context.js";
import { RequirePermission } from "../../core/authorization/access-policy.js";
import { AuthService } from "../auth/auth.service.js";
import { MeetingsService } from "./meetings.service.js";
import { createMeetingNotesSchema, createMeetingSchema, uploadMeetingTranscriptSchema } from "@lyvox/validation";

type AuthorizedRequest = FastifyRequest & { [AUTHORIZATION_CONTEXT]?: AuthorizationContext };

@Controller("reunioes")
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @RequirePermission("meetings.read")
  async list() {
    return this.meetingsService.listMeetings();
  }

  @Get(":id")
  @RequirePermission("meetings.read")
  async getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.meetingsService.getMeetingById(id);
  }

  @Post()
  @RequirePermission("meetings.create")
  async create(@Req() req: AuthorizedRequest, @Body() body: unknown) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = createMeetingSchema.parse(body);
    return this.meetingsService.createMeeting(payload, actor?.user.id);
  }

  @Post(":id/notas")
  @RequirePermission("meetings.update")
  async addNotes(
    @Req() req: AuthorizedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = createMeetingNotesSchema.parse(body);
    return this.meetingsService.addMeetingNotes(id, payload, actor?.user.id);
  }

  @Post(":id/transcricao")
  @RequirePermission("meetings.update")
  async addTranscript(
    @Req() req: AuthorizedRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const actor = req[AUTHORIZATION_CONTEXT];
    const csrfHeader = req.headers["x-csrf-token"] as string;
    if (actor?.session) {
      await this.authService.verifyCsrf(actor.session, csrfHeader);
    }

    const payload = uploadMeetingTranscriptSchema.parse(body);
    return this.meetingsService.addTranscript(id, payload, actor?.user.id);
  }
}
