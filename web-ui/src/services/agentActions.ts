/**
 * Agent Actions Service
 * 
 * Defines action classes and zod schemas for agent operations on tldraw canvas.
 * Based on tldraw/agent-template patterns.
 */

import { z } from 'zod'

// ============================================================================
// Base Types
// ============================================================================

/**
 * Simple shape ID format (without tldraw prefix)
 */
export const SimpleShapeIdSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Invalid shape ID format')
export type SimpleShapeId = z.infer<typeof SimpleShapeIdSchema>

/**
 * Position coordinates
 */
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})
export type Position = z.infer<typeof PositionSchema>

/**
 * Dimensions
 */
export const DimensionsSchema = z.object({
  w: z.number().positive(),
  h: z.number().positive(),
})
export type Dimensions = z.infer<typeof DimensionsSchema>

/**
 * Base shape properties
 */
export const BaseShapePropsSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  dash: z.string().optional(),
  fill: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  text: z.string().optional(),
})
export type BaseShapeProps = z.infer<typeof BaseShapePropsSchema>

/**
 * Geometry type for shapes
 */
export const GeometryTypeSchema = z.enum([
  'rectangle',
  'ellipse',
  'triangle',
  'diamond',
  'hexagon',
  'star',
  'arrow',
  'line',
])
export type GeometryType = z.infer<typeof GeometryTypeSchema>

/**
 * Focused shape structure
 */
export const FocusedShapeSchema = z.object({
  _type: GeometryTypeSchema,
  shapeId: SimpleShapeIdSchema.optional(),
  x: z.number(),
  y: z.number(),
  w: z.number().positive().optional(),
  h: z.number().positive().optional(),
  rotation: z.number().optional(),
  label: z.string().optional(),
  props: BaseShapePropsSchema.optional(),
})
export type FocusedShape = z.infer<typeof FocusedShapeSchema>

// ============================================================================
// Action Schemas
// ============================================================================

/**
 * Create Shape Action Schema
 * Creates a new shape on the canvas
 */
export const CreateShapeActionSchema = z.object({
  _type: z.literal('create'),
  intent: z.string().optional(),
  shape: FocusedShapeSchema,
}).meta({
  title: 'Create',
  description: 'The AI creates a new shape.',
  category: 'create' as const,
})

export type CreateShapeAction = z.infer<typeof CreateShapeActionSchema>

/**
 * Update Shape Action Schema
 * Updates an existing shape on the canvas
 */
export const UpdateShapeActionSchema = z.object({
  _type: z.literal('update'),
  intent: z.string().optional(),
  shapeId: SimpleShapeIdSchema,
  changes: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    w: z.number().positive().optional(),
    h: z.number().positive().optional(),
    rotation: z.number().optional(),
    label: z.string().optional(),
    props: BaseShapePropsSchema.optional(),
  }),
}).meta({
  title: 'Update',
  description: 'The AI updates an existing shape.',
  category: 'edit' as const,
})

export type UpdateShapeAction = z.infer<typeof UpdateShapeActionSchema>

/**
 * Delete Shape Action Schema
 * Deletes a shape from the canvas
 */
export const DeleteShapeActionSchema = z.object({
  _type: z.literal('delete'),
  intent: z.string().optional(),
  shapeId: SimpleShapeIdSchema,
}).meta({
  title: 'Delete',
  description: 'The AI deletes a shape.',
  category: 'edit' as const,
})

export type DeleteShapeAction = z.infer<typeof DeleteShapeActionSchema>

/**
 * Union type of all shape actions
 */
export const ShapeActionSchema = z.discriminatedUnion('_type', [
  CreateShapeActionSchema,
  UpdateShapeActionSchema,
  DeleteShapeActionSchema,
])

export type ShapeAction = z.infer<typeof ShapeActionSchema>

// ============================================================================
// Action Utilities Classes
// ============================================================================

/**
 * Base Agent Action Utility
 * Abstract class for all action utilities
 */
export abstract class AgentActionUtil<T extends ShapeAction = ShapeAction> {
  static readonly type: string

  /**
   * Parse and validate action from unknown data
   */
  parseAction(data: unknown): T | null {
    const result = this.getSchema().safeParse(data)
    return result.success ? result.data : null
  }

  /**
   * Validate action and return zod result
   */
  validateAction(data: unknown): z.SafeParseReturnType<unknown, T> {
    return this.getSchema().safeParse(data)
  }

  /**
   * Get the zod schema for this action type
   */
  abstract getSchema(): z.ZodType<T>

  /**
   * Get UI information for displaying the action
   */
  getInfo(action: T): {
    icon: string
    description: string
    canGroup?: (other: ShapeAction) => boolean
  } | null {
    return {
      icon: 'default',
      description: action.intent ?? `${this.type} action`,
    }
  }

  /**
   * Sanitize and validate action data before application
   * Returns null if action is invalid
   */
  sanitizeAction(action: T, helpers: ActionHelpers): T | null {
    return action
  }

  /**
   * Whether this action should be saved to history
   */
  savesToHistory(): boolean {
    return true
  }

  /**
   * Get the action type discriminator
   */
  get type(): string {
    return (this.constructor as any).type
  }
}

/**
 * Create Shape Action Utility
 */
export class CreateShapeActionUtil extends AgentActionUtil<CreateShapeAction> {
  static readonly type = 'create' as const

  getSchema(): z.ZodType<CreateShapeAction> {
    return CreateShapeActionSchema
  }

  override getInfo(action: CreateShapeAction) {
    return {
      icon: 'plus' as const,
      description: action.intent ?? `Create ${action.shape._type} shape`,
    }
  }

  override sanitizeAction(action: CreateShapeAction, helpers: ActionHelpers): CreateShapeAction | null {
    const { shape } = action

    // Ensure shape has valid dimensions if not provided
    if (!shape.w || !shape.h) {
      const defaultSize = helpers.getDefaultShapeSize(shape._type)
      shape.w = defaultSize.w
      shape.h = defaultSize.h
    }

    // Ensure shape ID is unique if provided
    if (shape.shapeId) {
      const uniqueId = helpers.ensureShapeIdIsUnique(shape.shapeId)
      if (!uniqueId) {
        return null // Shape ID already exists
      }
      shape.shapeId = uniqueId
    }

    // Validate position
    shape.x = helpers.roundAndSaveNumber(shape.x, 'x')
    shape.y = helpers.roundAndSaveNumber(shape.y, 'y')

    return action
  }
}

/**
 * Update Shape Action Utility
 */
export class UpdateShapeActionUtil extends AgentActionUtil<UpdateShapeAction> {
  static readonly type = 'update' as const

  getSchema(): z.ZodType<UpdateShapeAction> {
    return UpdateShapeActionSchema
  }

  override getInfo(action: UpdateShapeAction) {
    return {
      icon: 'edit' as const,
      description: action.intent ?? `Update shape ${action.shapeId}`,
    }
  }

  override sanitizeAction(action: UpdateShapeAction, helpers: ActionHelpers): UpdateShapeAction | null {
    // Validate that shape exists
    const shapeId = helpers.ensureShapeIdExists(action.shapeId)
    if (!shapeId) {
      return null // Shape doesn't exist
    }
    action.shapeId = shapeId

    // Validate and round position changes
    const { changes } = action
    if (changes.x !== undefined) {
      changes.x = helpers.roundAndSaveNumber(changes.x, 'x')
    }
    if (changes.y !== undefined) {
      changes.y = helpers.roundAndSaveNumber(changes.y, 'y')
    }

    return action
  }

  /**
   * Check if update is empty (no actual changes)
   */
  isEmptyUpdate(action: UpdateShapeAction): boolean {
    const { changes } = action
    return Object.keys(changes).length === 0
  }
}

/**
 * Delete Shape Action Utility
 */
export class DeleteShapeActionUtil extends AgentActionUtil<DeleteShapeAction> {
  static readonly type = 'delete' as const

  getSchema(): z.ZodType<DeleteShapeAction> {
    return DeleteShapeActionSchema
  }

  override getInfo(action: DeleteShapeAction) {
    return {
      icon: 'trash' as const,
      description: action.intent ?? `Delete shape ${action.shapeId}`,
      canGroup: (other: ShapeAction) => other._type === 'delete',
    }
  }

  override sanitizeAction(action: DeleteShapeAction, helpers: ActionHelpers): DeleteShapeAction | null {
    // Validate that shape exists
    const shapeId = helpers.ensureShapeIdExists(action.shapeId)
    if (!shapeId) {
      return null // Shape doesn't exist
    }
    action.shapeId = shapeId
    return action
  }
}

// ============================================================================
// Action Registry
// ============================================================================

/**
 * Registry of all action utilities
 */
export const actionUtilRegistry = new Map<string, AgentActionUtil>()

/**
 * Register an action utility
 */
export function registerActionUtil(util: AgentActionUtil): void {
  actionUtilRegistry.set(util.type, util)
}

// Register default action utilities
registerActionUtil(new CreateShapeActionUtil())
registerActionUtil(new UpdateShapeActionUtil())
registerActionUtil(new DeleteShapeActionUtil())

/**
 * Get action utility by type
 */
export function getActionUtil(type: string): AgentActionUtil | undefined {
  return actionUtilRegistry.get(type)
}

/**
 * Parse action data and return appropriate utility
 */
export function parseActionWithUtil(data: unknown): { action: ShapeAction; util: AgentActionUtil } | null {
  // First determine the action type from the discriminator
  const typedData = data as { _type?: string }
  if (!typedData._type) {
    return null
  }

  // Get the appropriate utility
  const util = getActionUtil(typedData._type)
  if (!util) {
    return null
  }

  // Parse and validate the action
  const action = util.parseAction(data)
  if (!action) {
    return null
  }

  return { action, util }
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Action helper utilities
 */
export interface ActionHelpers {
  /**
   * Check if a shape ID exists in the canvas
   */
  ensureShapeIdExists(shapeId: string): string | null

  /**
   * Ensure a shape ID is unique (doesn't exist yet)
   */
  ensureShapeIdIsUnique(shapeId: string): string | null

  /**
   * Get default dimensions for a shape type
   */
  getDefaultShapeSize(shapeType: GeometryType): Dimensions

  /**
   * Round a number and save it for potential restoration
   */
  roundAndSaveNumber(num: number, key: string): number

  /**
   * Restore a rounded number to its original value
   */
  unroundAndRestoreNumber(num: number, key: string): number

  /**
   * Generate a unique shape ID
   */
  generateShapeId(): string
}

/**
 * Default action helpers implementation
 */
export class DefaultActionHelpers implements ActionHelpers {
  private existingShapeIds = new Set<string>()
  private roundedNumbers = new Map<string, number>()

  constructor(existingShapeIds: string[] = []) {
    existingShapeIds.forEach(id => this.existingShapeIds.add(id))
  }

  ensureShapeIdExists(shapeId: string): string | null {
    return this.existingShapeIds.has(shapeId) ? shapeId : null
  }

  ensureShapeIdIsUnique(shapeId: string): string | null {
    if (this.existingShapeIds.has(shapeId)) {
      return null
    }
    return shapeId
  }

  getDefaultShapeSize(shapeType: GeometryType): Dimensions {
    const defaultSizes: Record<GeometryType, Dimensions> = {
      rectangle: { w: 100, h: 60 },
      ellipse: { w: 100, h: 60 },
      triangle: { w: 100, h: 87 },
      diamond: { w: 100, h: 100 },
      hexagon: { w: 100, h: 86 },
      star: { w: 100, h: 95 },
      arrow: { w: 100, h: 20 },
      line: { w: 100, h: 20 },
    }
    return defaultSizes[shapeType]
  }

  roundAndSaveNumber(num: number, key: string): number {
    const rounded = Math.round(num * 100) / 100
    this.roundedNumbers.set(key, num)
    return rounded
  }

  unroundAndRestoreNumber(num: number, key: string): number {
    return this.roundedNumbers.get(key) ?? num
  }

  generateShapeId(): string {
    return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// ============================================================================
// Action Validation Utilities
// ============================================================================

/**
 * Validate a batch of actions
 */
export function validateActionBatch(actions: unknown[]): {
  valid: ShapeAction[]
  invalid: Array<{ data: unknown; error: z.ZodError }>
} {
  const valid: ShapeAction[] = []
  const invalid: Array<{ data: unknown; error: z.ZodError }> = []

  for (const data of actions) {
    const result = parseActionWithUtil(data)
    if (result) {
      valid.push(result.action)
    } else {
      // Try to get validation error
      const zodResult = ShapeActionSchema.safeParse(data)
      if (!zodResult.success) {
        invalid.push({ data, error: zodResult.error })
      } else {
        invalid.push({ data, error: new z.ZodError([]) })
      }
    }
  }

  return { valid, invalid }
}

/**
 * Group actions by type for optimized processing
 */
export function groupActionsByType(actions: ShapeAction[]): Map<string, ShapeAction[]> {
  const groups = new Map<string, ShapeAction[]>()

  for (const action of actions) {
    const type = action._type
    if (!groups.has(type)) {
      groups.set(type, [])
    }
    groups.get(type)!.push(action)
  }

  return groups
}

/**
 * Deduplicate delete actions (same shape ID)
 */
export function deduplicateDeleteActions(actions: DeleteShapeAction[]): DeleteShapeAction[] {
  const seen = new Set<string>()
  const result: DeleteShapeAction[] = []

  for (const action of actions) {
    if (!seen.has(action.shapeId)) {
      seen.add(action.shapeId)
      result.push(action)
    }
  }

  return result
}
