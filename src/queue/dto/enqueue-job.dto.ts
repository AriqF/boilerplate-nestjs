import { IsNotEmpty, IsString } from 'class-validator';

export class EnqueueJobDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}
