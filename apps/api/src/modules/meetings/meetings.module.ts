import { Module } from "@nestjs/common";
import { MeetingsController } from "./meetings.controller.js";
import { MeetingsRepository } from "./meetings.repository.js";
import { MeetingsService } from "./meetings.service.js";

@Module({
  imports: [],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsRepository],
  exports: [MeetingsService, MeetingsRepository],
})
export class MeetingsModule {}
