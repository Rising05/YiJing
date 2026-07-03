import { IsString, Length } from 'class-validator'

export class TestLoginDto {
  @IsString()
  @Length(11, 11)
  phone!: string

  @IsString()
  @Length(4, 8)
  code!: string
}
