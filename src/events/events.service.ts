import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Event } from './entities/event.entity';
import { User } from '../users/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private dataSource: DataSource,
  ) {}

  async create(createEventDto: CreateEventDto, user: User): Promise<EventResponseDto> {
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = this.eventRepository.create({
        ...createEventDto,
        createdBy: user,
      });

      await queryRunner.manager.save(event);
      await queryRunner.commitTransaction();

      return new EventResponseDto({
        ...event,
        createdBy: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ events: EventResponseDto[], total: number }> {
    const [events, total] = await this.eventRepository.findAndCount({
      relations: ['createdBy'],
      skip: (page - 1) * limit,
      take: limit,
      order: {
        dateTime: 'DESC',
      },
    });

    return {
      events: events.map(event => new EventResponseDto({
        ...event,
        createdBy: {
          id: event.createdBy.id,
          name: event.createdBy.name,
          email: event.createdBy.email,
        },
      })),
      total,
    };
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return new EventResponseDto({
      ...event,
      createdBy: {
        id: event.createdBy.id,
        name: event.createdBy.name,
        email: event.createdBy.email,
      },
    });
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    user: User,
  ): Promise<EventResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await queryRunner.manager.findOne(Event, {
        where: { id },
        relations: ['createdBy'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.createdBy.id !== user.id && user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only update your own events');
      }

      const updatedEvent = await queryRunner.manager.save(Event, {
        ...event,
        ...updateEventDto,
      });

      await queryRunner.commitTransaction();

      return new EventResponseDto({
        ...updatedEvent,
        createdBy: {
          id: event.createdBy.id,
          name: event.createdBy.name,
          email: event.createdBy.email,
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, user: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await queryRunner.manager.findOne(Event, {
        where: { id },
        relations: ['createdBy'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      if (event.createdBy.id !== user.id && user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('You can only delete your own events');
      }

      await queryRunner.manager.remove(event);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
