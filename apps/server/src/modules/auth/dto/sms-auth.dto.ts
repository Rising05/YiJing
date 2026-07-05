import { IsString, Length } from 'class-validator'

export class SendSmsCodeDto {
  @IsString()
  @Length(11, 11)
  phone!: string
}

export class SmsLoginDto extends SendSmsCodeDto {
  @IsString()
  @Length(4, 8)
  code!: string
}
