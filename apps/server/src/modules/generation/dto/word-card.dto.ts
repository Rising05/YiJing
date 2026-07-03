import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsString, MaxLength } from 'class-validator'

export class WordCardDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(48, { each: true })
  words!: string[]

  @IsIn(['auto'])
  theme!: 'auto'

  @IsIn(['scene', 'association', 'simple'])
  cardMode!: 'scene' | 'association' | 'simple'
}
