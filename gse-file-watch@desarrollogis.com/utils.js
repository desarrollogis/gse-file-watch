'use strict';

const {
    GLib,
} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
var Settings = ExtensionUtils.getSettings(Me.imports.params.SettingsIdentifier);

function set_integer(label, value) {
    const variant = new GLib.Variant('n', value);

    Settings.set_value(label, variant);
}

function get_integer(label) {
    const variant = Settings.get_value(label);
    const value = variant.deep_unpack();

    return value;
}

// vim: set tabstop=4 shiftwidth=4 expandtab:
