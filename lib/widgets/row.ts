import { Widget } from "."
import { TextDirection } from "../dart-ui/textdirection"
import { TextBaseline } from "../painting/text-baseline"
import { VerticalDirection } from "../painting/vertical-direction"
import { CrossAxisAlignment } from "../rendering/cross-axis-alignment"
import { MainAxisAlignment } from "../rendering/main-axis-alignment"
import { MainAxisSize } from "../rendering/main-axis-size"

/**
 * https://api.flutter.dev/flutter/widgets/Row/Row.html
 */
export class Row extends Widget {
    mainAxisAlignment: MainAxisAlignment = MainAxisAlignment.start
    mainAxisSize: MainAxisSize = MainAxisSize.max
    crossAxisAlignment: CrossAxisAlignment = CrossAxisAlignment.center
    textDirection: TextDirection
    verticalDirection: VerticalDirection = VerticalDirection.down
    textBaseline: TextBaseline
    children: Array<Widget> = Array<Widget>()
    constructor() {
        super()
    }
}