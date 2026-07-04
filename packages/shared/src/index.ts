// ============================================================================
// @memory-palace/shared — canonical types, templates, and error codes
// ============================================================================

export type {
  ContentType,
  MemoryMethod,
  Anchor,
  MemoryTemplate,
  TextMemoryRequest,
  MemoryPoint,
  GenerationCredits,
  MemoryPalaceResult,
  WordCardRequest,
  WordPoint,
  WordCardResult,
  GenerationResult,
  TextMemoryPlan,
  WordCardPlan,
} from './types.js'

export {
  ErrorCode,
  ErrorLabels,
} from './errors.js'

export type {
  ErrorCodeType,
  ApiErrorResponse,
} from './errors.js'

export {
  MEMORY_TEMPLATES,
  TEMPLATE_MAP,
  studyRoom9,
  classroom9,
  ancientCottage9,
  palaceHall12,
  streetPath8,
  museumGallery12,
  airport15,
  restaurant12,
  campus12,
  blankWordCard30,
} from './templates.js'
