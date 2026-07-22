import { Module } from "@nestjs/common";
import { ProjectsController, TasksController } from "./projects.controller.js";
import { ProjectsRepository } from "./projects.repository.js";
import { ProjectsService } from "./projects.service.js";

@Module({
  controllers: [ProjectsController, TasksController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsService],
})
export class ProjectsModule {}
