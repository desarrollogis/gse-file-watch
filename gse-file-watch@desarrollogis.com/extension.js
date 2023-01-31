/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

'use strict';

const GETTEXT_DOMAIN = 'my-indicator-extension';
const {
    Clutter,
    GLib,
    St,
} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const indicator = Me.imports.indicator;
const box_layout = Me.imports.box_layout;
const folder_monitor = Me.imports.folder_monitor;

class Extension {
    constructor(uuid) {
        log(`${Me.metadata.uuid} Extension.constructor`);
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
        this._uuid = uuid;
        this._labels = [];
        this._box_layout = new box_layout.BoxLayout();
        this._configDir = GLib.get_user_config_dir();
        this._appDir = uuid;
        this._folderMonitor = new folder_monitor.FolderMonitor([this._configDir, uuid, 'content']);
        this._folderMonitor.connect('changed', this._onChanged.bind(this));
    }

    enable() {
        log(`${Me.metadata.uuid} Extension.enable`);
        this._indicator = new indicator.Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
        Main.layoutManager._backgroundGroup.add_child(this._box_layout);
        this._box_layout.enable();
        this._folderMonitor.enable();
    }

    disable() {
        log(`${Me.metadata.uuid} Extension.disable`);
        this._folderMonitor.disable();
        this._box_layout.disable();
        this._indicator.destroy();
        Main.layoutManager._backgroundGroup.remove_child(this._box_layout);
    }

    _onChanged(obj, result) {
        log(`${Me.metadata.uuid} Extension._onChanged`);

        const total = result.length * 2;

        while (this._labels.length > total) {
            const label = this._labels.pop();

            this._box_layout.remove_child(label);
            label.destroy();
        }
        while (total > this._labels.length) {
            const label = new St.Label({});

            this._labels.push(label);
            this._box_layout.add_child(label);
        }
        for (let i = 0; i < result.length; ++i) {
            const filenameLabel = this._labels[i * 2 + 0];
            const contentLabel = this._labels[i * 2 + 1]
            const filename = result[i];
            const content = this._folderMonitor.getContent(filename).trim();

            filenameLabel.set_text('');
            filenameLabel.set_style_class_name('label-filename');
            filenameLabel.set_text(filename);
            contentLabel.set_text('');
            contentLabel.set_style_class_name('label-content');
            contentLabel.set_text(content);
            filenameLabel.visible = content != '';
            contentLabel.visible = content != '';
        }
        this._box_layout.queue_relayout();
        this._box_layout.updatePosition();
    }
}

function init(meta) {
    log(`${Me.metadata.uuid} init`);
    return new Extension(meta.uuid);
}

// vim: set tabstop=4 shiftwidth=4 expandtab:
