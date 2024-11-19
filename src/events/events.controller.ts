import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    ParseIntPipe,
    ValidationPipe,
  } from '@nestjs/common';
  import { EventsService } from './events.service';
  import { CreateEventDto } from './dto/create-event.dto';
  import { UpdateEventDto } from './dto/update-event.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { GetUser } from '../auth/decorators/get-user.decorator';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { User, UserRole } from '../users/entities/user.entity';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  
  @ApiTags('events')
  @ApiBearerAuth()
  @Controller('events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class EventsController {
    constructor(private readonly eventsService: EventsService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new event' })
    @ApiResponse({ status: 201, description: 'Event created successfully' })
    create(
      @Body(ValidationPipe) createEventDto: CreateEventDto,
      @GetUser() user: User,
    ) {
      return this.eventsService.create(createEventDto, user);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all events' })
    findAll(
      @Query('page', new ParseIntPipe({ optional: true })) page?: number,
      @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
      return this.eventsService.findAll(page, limit);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get event by id' })
    findOne(@Param('id') id: string) {
      return this.eventsService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update event' })
    update(
      @Param('id') id: string,
      @Body(ValidationPipe) updateEventDto: UpdateEventDto,
      @GetUser() user: User,
    ) {
      return this.eventsService.update(id, updateEventDto, user);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete event' })
    @ApiResponse({ status: 200, description: 'Event deleted successfully' })
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string, @GetUser() user: User) {
      return this.eventsService.remove(id, user);
    }
  }
  