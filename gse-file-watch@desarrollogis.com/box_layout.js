'use strict';

const {
    Clutter,
    GObject,
    St,
} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const utils = Me.imports.utils;
const draggable = Me.imports.draggable;

var BoxLayout = GObject.registerClass(class BoxLayout extends St.BoxLayout {
    _init() {
        log(`${Me.metadata.uuid} BoxLayout._init`);
        super._init({
            style_class: 'box-layout',
            reactive: true,
            track_hover: true,
            can_focus: true,
            vertical: true,
        });
        this._x_callback = null;
        this._y_callback = null;

        const label = new St.Label({ y_align: Clutter.ActorAlign.CENTER });

        label.set_text(Me.metadata.uuid);
        this.add_child(label);
        this.queue_relayout();
        this._draggable = new draggable.Draggable(this);
    }

    enable() {
        log(`${Me.metadata.uuid} BoxLayout.enable`);
        if (this._x_callback == null) {
            this._x_callback = utils.Settings.connect('changed::x', this.updatePosition.bind(this));
        }
        if (this._y_callback == null) {
            this._y_callback = utils.Settings.connect('changed::y', this.updatePosition.bind(this));
        }
        this.updatePosition();
    }

    disable() {
        log(`${Me.metadata.uuid} BoxLayout.disable`);
        if (this._x_callback != null) {
            utils.Settings.disconnect(this._x_callback);
            this._x_callback = null;
        }
        if (this._y_callback != null) {
            utils.Settings.disconnect(this._y_callback);
            this._y_callback = null;
        }
    }

    updatePosition() {
        log(`${Me.metadata.uuid} BoxLayout.updatePosition`);

        const x = utils.get_integer('x');
        const y = utils.get_integer('y');

        this.set_position(x, y);
    }
});

// vim: set tabstop=4 shiftwidth=4 expandtab:
