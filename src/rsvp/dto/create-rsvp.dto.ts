import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateRsvpDto {
  @IsUUID()
  @IsNotEmpty()
  eventId: string;
}
