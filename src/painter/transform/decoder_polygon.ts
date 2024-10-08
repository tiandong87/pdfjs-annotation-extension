import { PolygonAnnotation, Vertices } from 'pdfjs'
import { Decoder } from './decoder'
import Konva from 'konva'
import { SHAPE_GROUP_NAME } from '../const'
import { convertToRGB } from '../../utils/utils'
import { AnnotationType, IAnnotationStore, PdfjsAnnotationEditorType } from '../../const/definitions'

export class PolygonDecoder extends Decoder {
    constructor(options) {
        super(options)
    }

    public decodePdfAnnotation(annotation: PolygonAnnotation) {
        const color = convertToRGB(annotation.color)
        const width = annotation.borderStyle.width === 1 ? annotation.borderStyle.width + 1 : annotation.borderStyle.width
        const ghostGroup = new Konva.Group({
            draggable: false,
            name: SHAPE_GROUP_NAME,
            id: annotation.id
        })
        const createLine = (vertices: Vertices[]) => {
            const points: number[] = []
            vertices?.forEach(point => {
                const { x, y } = this.convertPoint(point, annotation.pageViewer.viewport.scale, annotation.pageViewer.viewport.height)
                points.push(x)
                points.push(y)
                
            })
            return new Konva.Line({
                strokeScaleEnabled: false,
                stroke: color,
                strokeWidth: width,
                lineCap: 'round',
                lineJoin: 'round',
                hitStrokeWidth: 20,
                closed: true,
                globalCompositeOperation: 'source-over',
                points
            })
        }
        const line = createLine(annotation.vertices)
        ghostGroup.add(line)
        const annotationStore: IAnnotationStore = {
            id: annotation.id,
            pageNumber: annotation.pageNumber,
            pageRanges: null,
            konvaString: ghostGroup.toJSON(),
            title: annotation.titleObj.str,
            type: AnnotationType.FREEHAND,
            color,
            pdfjsType: annotation.annotationType,
            pdfjsAnnotation: annotation,
            pdfjsEditorType: PdfjsAnnotationEditorType.INK,
            date: annotation.modificationDate,
            contentsObj: null,
            comments: [],
            readonly: false
        }

        ghostGroup.destroy()
        return annotationStore
    }
}
