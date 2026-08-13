import { modelKey, type ModelUsage } from '../../lib/usage'
import { FALLBACK_MODEL_COLOR, MODEL_COLORS } from './usage.constants'

/**
 * Colours are assigned from the period-wide model ranking, not per day, so a
 * model keeps the same colour in every bar even on days it was not used.
 */
export function buildModelColors(models: ModelUsage[]): Map<string, string> {
  return new Map(
    models.map((model, index) => [
      modelKey(model),
      MODEL_COLORS[index % MODEL_COLORS.length] ?? FALLBACK_MODEL_COLOR,
    ]),
  )
}

export function colorFor(colors: Map<string, string>, model: ModelUsage): string {
  return colors.get(modelKey(model)) ?? FALLBACK_MODEL_COLOR
}
