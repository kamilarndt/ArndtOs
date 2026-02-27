import { Editor, createShapeId, uniqueId } from '@tldraw/tldraw'

export interface CanvasCreateAction {
  type: 'create'
  shape: { id?: string; type: string; x: number; y: number; props?: Record<string, unknown> }
}

export interface CanvasUpdateAction {
  type: 'update'
  id: string
  changes: Record<string, unknown>
}

export interface CanvasDeleteAction {
  type: 'delete'
  id: string
}

export type CanvasAction = CanvasCreateAction | CanvasUpdateAction | CanvasDeleteAction

export function applyCanvasAction(editor: Editor, action: CanvasAction): void {
  switch (action.type) {
    case 'create': {
      const shapeId = createShapeId(action.shape.id || uniqueId())
      editor.createShapes([{ id: shapeId, type: 'geo', x: action.shape.x, y: action.shape.y, props: { w: 100, h: 60, geo: 'rectangle' } } as any])
      break
    }
    case 'update': {
      const shapeId = createShapeId(action.id)
      editor.updateShape({ id: shapeId, type: 'geo', ...action.changes } as any)
      break
    }
    case 'delete': {
      const shapeId = createShapeId(action.id)
      editor.deleteShapes([shapeId])
      break
    }
  }
}

export function exportCanvasState(editor: Editor): unknown[] {
  return editor.getCurrentPageShapes().map(shape => ({ id: shape.id, type: shape.type, x: shape.x, y: shape.y, props: shape.props }))
}

export function exportCanvasToJSON(editor: Editor): string {
  return JSON.stringify({ version: '1.0', timestamp: new Date().toISOString(), shapes: exportCanvasState(editor) }, null, 2)
}

export function exportCanvasToFile(editor: Editor, filename?: string): void {
  const json = exportCanvasToJSON(editor)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `canvas-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function setupCanvasActionListener(editor: Editor, onMessage: (action: CanvasAction) => void): () => void {
  const handler = (event: MessageEvent) => {
    try {
      const data = event.data
      if (data && typeof data === 'object' && data.type === 'canvas_action') {
        const action = data.payload as CanvasAction
        applyCanvasAction(editor, action)
        onMessage(action)
      }
    } catch (error) {
      console.error('Failed to process canvas action:', error)
    }
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}
