// src/rsvp/rsvp.controller.ts
import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    ValidationPipe,
  } from '@nestjs/common';
  import { RsvpService } from './rsvp.service';
  import { CreateRsvpDto } from './dto/create-rsvp.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { GetUser } from '../auth/decorators/get-user.decorator';
  import { User } from '../users/entities/user.entity';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  
  @ApiTags('rsvp')
  @ApiBearerAuth()
  @Controller('rsvp')
  @UseGuards(JwtAuthGuard)
  export class RsvpController {
    constructor(private readonly rsvpService: RsvpService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create RSVP for an event' })
    @ApiResponse({ status: 201, description: 'RSVP created successfully' })
    @ApiResponse({ status: 409, description: 'Already RSVP\'d or event is full' })
    create(
      @Body(ValidationPipe) createRsvpDto: CreateRsvpDto,
      @GetUser() user: User,
    ) {
      return this.rsvpService.create(createRsvpDto, user);
    }
  
    @Get('my-rsvps')
    @ApiOperation({ summary: 'Get all RSVPs for current user' })
    findAllByUser(@GetUser() user: User) {
      return this.rsvpService.findAllByUser(user);
    }
  
    @Get('event/:eventId')
    @ApiOperation({ summary: 'Get all RSVPs for an event' })
    findAllByEvent(@Param('eventId') eventId: string) {
      return this.rsvpService.findAllByEvent(eventId);
    }
  
    @Delete('event/:eventId')
    @ApiOperation({ summary: 'Cancel RSVP for an event' })
    @ApiResponse({ status: 200, description: 'RSVP cancelled successfully' })
    cancel(@Param('eventId') eventId: string, @GetUser() user: User) {
      return this.rsvpService.cancel(eventId, user);
    }
  }