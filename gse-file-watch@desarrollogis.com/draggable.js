'use strict';

const {
    Clutter,
    Meta,
} = imports.gi;
const DND = imports.ui.dnd;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const utils = Me.imports.utils;

var Draggable = class _draggable {
    constructor(listener) {
        const self = this;

        this._listener = listener;
        this._draggable = DND.makeDraggable(this._listener);
        this._draggable._dragActorDropped = (event) => {
            self._draggable._animationInProgress = true;
            self._draggable._dragCancellable = false;
            self._draggable._dragState = DND.DragState.INIT;
            self._draggable._onAnimationComplete(self._draggable._dragActor, Clutter.get_current_event().get_time  ());
            return true;
        };
        this._dragBeginId = this._draggable.connect('drag-begin', this._onDragBegin.bind(this));
        this._dragEndId = this._draggable.connect('drag-end', this._onDragEnd.bind(this));
    }

    _onDragBegin() {
        this._isDragging = true;
        this._dragMonitor = {
            dragMotion: this._onDragMotion.bind(this)
        };
        DND.addDragMonitor(this._dragMonitor);

        let p = this._listener.get_transformed_position();

        this._dragX = p[0];
        this._dragY = p[1];
    }

    _onDragMotion(dragEvent) {
        this._deltaX = dragEvent.x - (dragEvent.x - this._dragX);
        this._deltaY = dragEvent.y - (dragEvent.y - this._dragY);

        let p = this._listener.get_transformed_position();

        this._dragX = p[0];
        this._dragY = p[1];
        return DND.DragMotionResult.CONTINUE;
    }

    _onDragEnd() {
        this._isDragging = false;
        if (this._dragMonitor) {
            DND.removeDragMonitor(this._dragMonitor);
            this._dragMonitor = null;
        }

        let [x, y] = [Math.round(this._deltaX), Math.round(this._deltaY)];

        this._listener.set_position(x, y);
        if (!this._isOnScreen(x, y)) {
            [x, y] = this._keepOnScreen(x, y);
            this._listener.ease({ x, y, duration: 150, mode: Clutter.AnimationMode.EASE_OUT_QUAD });
        }
        utils.set_integer('x', x);
        utils.set_integer('y', y);
    }

    _isOnScreen(x, y) {
        let rect = this._getMetaRectForCoords(x, y);
        let monitorWorkArea = this._getWorkAreaForRect(rect);

        if (!monitorWorkArea) {
            return true;
        }
        return monitorWorkArea.contains_rect(rect);
    }

    _keepOnScreen(x, y) {
        let rect = this._getMetaRectForCoords(x, y);
        let monitorWorkArea = this._getWorkAreaForRect(rect);

        if (!monitorWorkArea) {
            return [x, y];
        }

        let monitorRight = monitorWorkArea.x + monitorWorkArea.width;
        let monitorBottom = monitorWorkArea.y + monitorWorkArea.height;

        x = Math.min(Math.max(monitorWorkArea.x, x), monitorRight - rect.width);
        y = Math.min(Math.max(monitorWorkArea.y, y), monitorBottom - rect.height);
        return [x, y];
    }

    _getMetaRectForCoords(x, y){
        this._listener.get_allocation_box();

        let rect = new Meta.Rectangle();

        [rect.x, rect.y] = [x, y];
        [rect.width, rect.height] = this._listener.get_transformed_size();
        return rect;
    }

    _getWorkAreaForRect(rect) {
        const monitorIndex = global.display.get_monitor_index_for_rect(rect);

        if (monitorIndex >= global.display.get_n_monitors()) {
            return false;
        }

        const workArea = Main.layoutManager.getWorkAreaForMonitor(monitorIndex);
        const padding = 50;

        workArea.x -= padding;
        workArea.y -= padding;
        workArea.width += (2 * padding);
        workArea.height += (2 * padding);
        return workArea;
    }
};

// vim: set tabstop=4 shiftwidth=4 expandtab:
