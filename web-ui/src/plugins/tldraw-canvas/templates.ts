import { createShapeId } from '@tldraw/tldraw'
import { Editor } from '@tldraw/tldraw'

export type CanvasTemplate = {
  id: string
  name: string
  description: string
  icon: string
  apply: (editor: Editor) => void
}

function deleteAllShapes(editor: Editor): void {
  const shapes = Array.from(editor.getCurrentPageShapeIds())
  editor.deleteShapes(shapes)
}

const templates: CanvasTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with an empty canvas',
    icon: '📄',
    apply: (editor: Editor) => deleteAllShapes(editor)
  },
  {
    id: 'workflow',
    name: 'Workflow Diagram',
    description: 'Process flow with nodes',
    icon: '🔄',
    apply: (editor: Editor) => {
      deleteAllShapes(editor)
      
      const startId = createShapeId('start')
      editor.createShapes([{
        id: startId,
        type: 'geo',
        x: 200,
        y: 100,
        props: { w: 120, h: 60, geo: 'rectangle', fill: '#22c55e', text: 'START' }
      } as any])

      const process1Id = createShapeId('process1')
      editor.createShapes([{
        id: process1Id,
        type: 'geo',
        x: 200,
        y: 200,
        props: { w: 120, h: 60, geo: 'rectangle', fill: '#3b82f6', text: 'Process' }
      } as any])
    }
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    description: 'Central idea with branches',
    icon: '🧠',
    apply: (editor: Editor) => {
      deleteAllShapes(editor)
      
      const centerId = createShapeId('center')
      editor.createShapes([{
        id: centerId,
        type: 'geo',
        x: 280,
        y: 220,
        props: { w: 140, h: 80, geo: 'ellipse', fill: '#8b5cf6', text: 'Main Idea' }
      } as any])
    }
  },
  {
    id: 'architecture',
    name: 'System Architecture',
    description: 'Layers diagram',
    icon: '🏗️',
    apply: (editor: Editor) => {
      deleteAllShapes(editor)
      
      const feId = createShapeId('frontend')
      editor.createShapes([{
        id: feId,
        type: 'geo',
        x: 250,
        y: 50,
        props: { w: 150, h: 50, geo: 'rectangle', fill: '#f97316', text: 'Frontend' }
      } as any])

      const apiId = createShapeId('api')
      editor.createShapes([{
        id: apiId,
        type: 'geo',
        x: 250,
        y: 130,
        props: { w: 150, h: 50, geo: 'rectangle', fill: '#eab308', text: 'API' }
      } as any])

      const dbId = createShapeId('database')
      editor.createShapes([{
        id: dbId,
        type: 'geo',
        x: 280,
        y: 210,
        props: { w: 100, h: 40, geo: 'rectangle', fill: '#6366f1', text: 'DB' }
      } as any])
    }
  }
]

export const canvasTemplates = templates

export function getTemplateById(id: string): CanvasTemplate | undefined {
  return templates.find(t => t.id === id)
}

export function applyTemplate(editor: Editor, templateId: string): boolean {
  const template = getTemplateById(templateId)
  if (template) {
    template.apply(editor)
    return true
  }
  return false
}
