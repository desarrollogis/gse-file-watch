'use strict';

/*
 * https://gjs.guide/extensions/development/preferences.html
 */

const {
    Adw,
    Gtk,
} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const utils = Me.imports.utils;

function init() {
}

function getRowSpin(valueLabel, title) {
    const value = utils.get_integer(valueLabel);
    const button = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0, upper: 5000, step_increment: 1, page_increment: 1, page_size: 0,
        }),
        climb_rate: 1,
        digits: 0,
        numeric: true,
        valign: Gtk.Align.CENTER,
    });

    button.set_value(value);
    utils.Settings.connect('changed::' + valueLabel, () => {
        const value = utils.get_integer(valueLabel);

        button.set_value(value);
    });
    button.connect('value-changed', (widget) => {
        utils.set_integer(valueLabel, widget.get_value());
    });

    const row = new Adw.ActionRow({ title: title, activatable_widget: button });

    row.add_suffix(button);
    return row;
}

function fillPreferencesWindow(window) {
    const group = new Adw.PreferencesGroup();
    const page = new Adw.PreferencesPage();

    group.add(getRowSpin('x', 'Coordinate X'));
    group.add(getRowSpin('y', 'Coordinate Y'));
    page.add(group);
    window.add(page);
}

// vim: set tabstop=4 shiftwidth=4 expandtab:
