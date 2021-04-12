import { IPoint } from './drawer-canvas.definitions';
import { CanvasElement } from '../canvas/canvas.element';
import { ICanvasOptions } from '../canvas/canvas.definitions';

/**
 * DrawerCanvas class is an implementation of CanvasElement
 * and draws lines over canvas element.
 * @public
 */
export class DrawerCanvas extends CanvasElement {
    // Canvas prop
    private _drawerOptions: ICanvasOptions;
    private _canvasX: number = 0;
    private _canvasY: number = 0;

    // Line attributes
    private _pointsLimit: number;
    private _points: IPoint[] = [];

    // Mouse properties
    private _isDrawCompleted: boolean;
    private _lastMouseX: number = 0;
    private _lastMouseY: number = 0;
    private _cursors = ['crosshair', 'pointer'];
    private _currentCursor: number = 0;

    // Const readyOnly
    private readonly DRAW_LINE = 'round';
    private readonly DEFAULT_LINE_COLOR = '#DB4646';

    public constructor(canvasOptions: ICanvasOptions) {
        // Create canvas object
        super(canvasOptions);
        this._drawerOptions = canvasOptions;
    }

    public get drawerOptions() {
        return this._drawerOptions;
    }

    public set drawerOptions(options: ICanvasOptions) {
        this._drawerOptions = options;
    }

    public resize(): void {
        this.setCanvasSize(this._drawerOptions.width, this._drawerOptions.height);
        this.setContextStyle();
        this.clearCanvas();
        this.draw();
    }

    public clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public draw(): void {
        if (this._points.length < 2) {
            return;
        }

        this.context.beginPath();

        const startPointX = this._points[0].x * this.drawerOptions.width * this.ratio;
        const startPointY = this._points[0].y * this.drawerOptions.height * this.ratio;
        this.context.moveTo(
            startPointX,
            startPointY
        );

        for (const point of this._points) {
            // Start to draw
            this.context.lineTo(point.x * this.drawerOptions.width * this.ratio, point.y * this.drawerOptions.height * this.ratio);
        }

        if (this._isDrawCompleted) {
            this.context.lineTo(startPointX, startPointY);
            this.context.closePath();
            this.context.fill();
        }

        this.context.stroke();
    }

    private drawPoints() {
        for (const point of this._points) {
            this.context.beginPath();
            const pointX = point.x * this.drawerOptions.width * this.ratio;
            const pointY = point.y * this.drawerOptions.height * this.ratio;
            this.context.arc(pointX, pointY, 3, 0, 2 * Math.PI, false);
            this.context.fill();
            this.context.stroke();
        }
    };

    public drawLastLine() {
        if (this._pointsLimit > 2) {
            return;
        }

        this.clearCanvas();
        this.context?.beginPath();

        const lastPointX = this._points && this._points[this._points.length - 1].x * this.drawerOptions.width * this.ratio;
        const lastPointY = this._points && this._points[this._points.length - 1].y * this.drawerOptions.height * this.ratio;

        // Start to draw
        this.context?.moveTo(this._lastMouseX * this.ratio, this._lastMouseY * this.ratio);
        this.context?.lineTo(lastPointX, lastPointY);
        this.context?.stroke();
    }

    public setContextStyle() {
        super.setContextStyle();
        this.context.strokeStyle = this._drawerOptions.lineColor || this.DEFAULT_LINE_COLOR;
        this.context.lineJoin = this.DRAW_LINE;
        this.context.lineCap = this.DRAW_LINE;
    }

    public setCanvas(cWidth: number, cHeight: number, pointsLimit: number = 2) {
        this._pointsLimit = pointsLimit;

        // Init canvas properties
        this.setCanvasSize(cWidth, cHeight);
        this.setCanvasStyle();
        this.setContextStyle();
    }

    public initBoundingCanvas() {
        // Init x,y after append to document.
        this._canvasY = this.canvas.getBoundingClientRect().top;
        this._canvasX = this.canvas.getBoundingClientRect().left;
    }

    public onDraw(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (this._isDrawCompleted) {
            return;
        }

        this.addPointToList(e);
        this.clearCanvas();
        this.draw();
        this.drawPoints();

        if (this._points?.length === this._pointsLimit) {
            this.onDrawComplete();
        }
    }

    private addPointToList(e: MouseEvent) {
        const lastMouseX = e.clientX - this._canvasX;
        const lastMouseY = e.clientY - this._canvasY;
    
        // Compare between the dots.
        // If the last click equal to the first one, close the polygon
        if (this._points.length > 1) {
            const clickX = this._points[0].x * this.drawerOptions.width;
            const clickY = this._points[0].y * this.drawerOptions.height;
            const diffX = Math.abs(lastMouseX - clickX);
            const diffY = Math.abs(lastMouseY - clickY);
            if (diffX < 10 && diffY < 10) {
                this._isDrawCompleted = true;
                // Calculate angles
                this.calculateAngles();
            }
        }

        // Push the last click only if polygon not closed
        if (!this._isDrawCompleted) {
            this._points?.push({
                x: lastMouseX / this.drawerOptions.width,
                y: lastMouseY / this.drawerOptions.height,
                cursor: (this._points.length === 0) ? 1 : 0
            });
        }
    }

    private calculateAngles() {
        const legalAnglesSum = 180 * (this._points.length - 2);
        let polygonAnglesSum = 0;
        for (const point of this._points) {
            polygonAnglesSum += Math.atan2(point.x * this.drawerOptions.width, point.y * this.drawerOptions.height) * 180 / Math.PI;
        }
        console.log(polygonAnglesSum);
        if (polygonAnglesSum === legalAnglesSum) {

        }
    }

    public onMouseMove(e: MouseEvent) {
        if (this._isDrawCompleted || !this._points?.length) {
            return;
        }

        this.drawLastLine();
        this.setCanvasCursor(e);
    }

    private setCanvasCursor(e: MouseEvent) {
        this._lastMouseX = e.clientX - this._canvasX;
        this._lastMouseY = e.clientY - this._canvasY;

        // Determine cursor by its position
        var newCursor;
        if (this._points?.length > 2) {
            const diffX = Math.abs(this._lastMouseX - (this._points[0].x * this.drawerOptions.width));
            const diffY = Math.abs(this._lastMouseY - (this._points[0].y * this.drawerOptions.height));

            var s = this._points[0];

            if (diffX < 10 && diffY < 10) {
                newCursor = s.cursor;
            }
            if (!newCursor) {
                if (this._currentCursor > 0) {
                    this._currentCursor = 0;
                    this.canvas.style.cursor = this._cursors[this._currentCursor];
                }
            } else if (newCursor !== this._currentCursor) {
                this._currentCursor = newCursor;
                this.canvas.style.cursor = this._cursors[this._currentCursor];
            }
        }
    }

    public onDrawComplete() {
        this._isDrawCompleted = true;
        const customEvent = new CustomEvent('drawerComplete', {
            bubbles: true
        });
        // Trigger event to parent component.
        this.canvas.dispatchEvent(customEvent);
    }

    public clearPoints() {
        this._points.length = 0;
        this._isDrawCompleted = false;
    }

    public get points(): IPoint[] {
        return this._points;
    }
}
