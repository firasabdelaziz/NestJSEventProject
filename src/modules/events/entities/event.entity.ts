import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Rsvp } from '../../rsvp/entities/rsvp.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('timestamp')
  dateTime: Date;

  @Column()
  location: string;

  @Column({ nullable: true })
  maxCapacity: number;

  @ManyToOne(() => User, user => user.events)
  createdBy: User;

  @OneToMany(() => Rsvp, rsvp => rsvp.event)
  rsvps: Rsvp[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

