import { Exclude, Expose } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

@Exclude()
export class EventResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  dateTime: Date;

  @Expose()
  location: string;

  @Expose()
  maxCapacity: number;

  @Expose()
  createdBy: Pick<User, 'id' | 'name' | 'email'>;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<EventResponseDto>) {
    Object.assign(this, partial);
  }
}
