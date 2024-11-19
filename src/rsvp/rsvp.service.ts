import { 
    Injectable, 
    NotFoundException, 
    ConflictException,
    BadRequestException
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource } from 'typeorm';
  import { Rsvp } from './entities/rsvp.entity';
  import { Event } from '../events/entities/event.entity';
  import { User } from '../users/entities/user.entity';
  import { CreateRsvpDto } from './dto/create-rsvp.dto';
  import { RsvpResponseDto } from './dto/rsvp-response.dto';
  
  @Injectable()
  export class RsvpService {
    constructor(
      @InjectRepository(Rsvp)
      private rsvpRepository: Repository<Rsvp>,
      @InjectRepository(Event)
      private eventRepository: Repository<Event>,
      private dataSource: DataSource,
    ) {}
  
    async create(createRsvpDto: CreateRsvpDto, user: User): Promise<RsvpResponseDto> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        // Lock the event record for concurrent access
        const event = await queryRunner.manager.findOne(Event, {
          where: { id: createRsvpDto.eventId },
          relations: ['rsvps', 'createdBy'],
          lock: { mode: 'pessimistic_write' },
        });
  
        if (!event) {
          throw new NotFoundException('Event not found');
        }
  
        // Check if event date has passed
        if (new Date(event.dateTime) < new Date()) {
          throw new BadRequestException('Cannot RSVP to past events');
        }
  
        // Check if user already RSVP'd
        const existingRsvp = await queryRunner.manager.findOne(Rsvp, {
          where: {
            event: { id: event.id },
            user: { id: user.id },
          },
        });
  
        if (existingRsvp) {
          throw new ConflictException('You have already RSVP\'d to this event');
        }
  
        // Check capacity if maxCapacity is set
        if (event.maxCapacity) {
          const currentRsvps = await queryRunner.manager.count(Rsvp, {
            where: { event: { id: event.id } },
          });
  
          if (currentRsvps >= event.maxCapacity) {
            throw new ConflictException('Event has reached maximum capacity');
          }
        }
  
        // Create RSVP
        const rsvp = this.rsvpRepository.create({
          event,
          user,
        });
  
        await queryRunner.manager.save(rsvp);
        await queryRunner.commitTransaction();
  
        return new RsvpResponseDto({
          id: rsvp.id,
          event: {
            id: event.id,
            title: event.title,
            description: event.description,
            dateTime: event.dateTime,
            location: event.location,
            maxCapacity: event.maxCapacity,
            createdAt: event.createdAt, // Add this
            updatedAt: event.updatedAt, // Add this        
            createdBy: {
              id: event.createdBy.id,
              name: event.createdBy.name,
              email: event.createdBy.email,
            },
          },
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          createdAt: rsvp.createdAt,
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    async findAllByUser(user: User): Promise<RsvpResponseDto[]> {
      const rsvps = await this.rsvpRepository.find({
        where: { user: { id: user.id } },
        relations: ['event', 'event.createdBy'],
        order: { createdAt: 'DESC' },
      });
  
      return rsvps.map(
        rsvp =>
          new RsvpResponseDto({
            id: rsvp.id,
            event: {
              id: rsvp.event.id,
              title: rsvp.event.title,
              description: rsvp.event.description,
              dateTime: rsvp.event.dateTime,
              location: rsvp.event.location,
              maxCapacity: rsvp.event.maxCapacity,
              createdAt: rsvp.event.createdAt, 
              updatedAt: rsvp.event.updatedAt,           
              createdBy: {
                id: rsvp.event.createdBy.id,
                name: rsvp.event.createdBy.name,
                email: rsvp.event.createdBy.email,
              },
            },
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
            },
            createdAt: rsvp.createdAt,
          }),
      );
    }
  
    async findAllByEvent(eventId: string): Promise<RsvpResponseDto[]> {
      const rsvps = await this.rsvpRepository.find({
        where: { event: { id: eventId } },
        relations: ['user', 'event', 'event.createdBy'],
        order: { createdAt: 'DESC' },
      });
  
      return rsvps.map(
        rsvp =>
          new RsvpResponseDto({
            id: rsvp.id,
            event: {
              id: rsvp.event.id,
              title: rsvp.event.title,
              description: rsvp.event.description,
              dateTime: rsvp.event.dateTime,
              location: rsvp.event.location,
              maxCapacity: rsvp.event.maxCapacity,
              createdAt: rsvp.event.createdAt,
              updatedAt: rsvp.event.updatedAt,
          
              createdBy: {
                id: rsvp.event.createdBy.id,
                name: rsvp.event.createdBy.name,
                email: rsvp.event.createdBy.email,
              },
            },
            user: {
              id: rsvp.user.id,
              name: rsvp.user.name,
              email: rsvp.user.email,
            },
            createdAt: rsvp.createdAt,
          }),
      );
    }
  
    async cancel(eventId: string, user: User): Promise<void> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        const rsvp = await queryRunner.manager.findOne(Rsvp, {
          where: {
            event: { id: eventId },
            user: { id: user.id },
          },
          relations: ['event'],
          lock: { mode: 'pessimistic_write' },
        });
  
        if (!rsvp) {
          throw new NotFoundException('RSVP not found');
        }
  
        // Check if event date has passed
        if (new Date(rsvp.event.dateTime) < new Date()) {
          throw new BadRequestException('Cannot cancel RSVP for past events');
        }
  
        await queryRunner.manager.remove(rsvp);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  }