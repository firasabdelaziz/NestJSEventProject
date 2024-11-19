import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RsvpService } from './rsvp.service';
import { RsvpController } from './rsvp.controller';
import { Rsvp } from './entities/rsvp.entity';
import { Event } from '../events/entities/event.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rsvp, Event]),
    AuthModule,
  ],
  controllers: [RsvpController],
  providers: [RsvpService],
})
export class RsvpModule {}