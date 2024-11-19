import { Exclude, Expose, Type } from 'class-transformer';
import { EventResponseDto } from '../../events/dto/event-response.dto';

@Exclude()
export class RsvpResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => EventResponseDto)
  event: EventResponseDto;

  @Expose()
  user: {
    id: string;
    name: string;
    email: string;
  };

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<RsvpResponseDto>) {
    Object.assign(this, partial);
  }
}
