import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../events/entities/event.entity';

@Entity()
@Unique(['user', 'event'])
export class Rsvp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.rsvps)
  user: User;

  @ManyToOne(() => Event, event => event.rsvps)
  event: Event;

  @CreateDateColumn()
  createdAt: Date;
}
