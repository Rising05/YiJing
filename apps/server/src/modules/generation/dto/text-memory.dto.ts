import { IsIn, IsString, MaxLength, MinLength } from 'class-validator'

export class TextMemoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  inputText!: string

  @IsIn(['auto', 'ancient_text', 'modern_text'])
  contentType!: 'auto' | 'ancient_text' | 'modern_text'

  @IsIn(['auto', 'study_room', 'classroom', 'ancient_cottage', 'palace_hall', 'street_path', 'museum_gallery'])
  scenePreference!: 'auto' | 'study_room' | 'classroom' | 'ancient_cottage' | 'palace_hall' | 'street_path' | 'museum_gallery'
}
