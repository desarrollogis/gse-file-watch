#!/usr/bin/env gjs

'use strict';

const {
    GLib,
} = imports.gi;

imports.searchPath.unshift('.');

const folder_monitor = imports.folder_monitor;

class test {
    constructor() {
        log('test constructor');
        this._loop = new GLib.MainLoop(null, false);
        this._configDir = './output';
        this._appDir = 'tests/folder_monitor_test';
        this._folderMonitor = new folder_monitor.FolderMonitor([this._configDir, this._appDir]);
        this._folderMonitor.connect('changed', this._onChanged.bind(this));
        this._folderMonitor.enable();
        GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 2, this._touch.bind(this));
        this._loop.run();
    }

    _onChanged(obj, result) {
        log('test _onChanged');
        for (let i = 0; i < result.length; ++i) {
            const filename = result[i];
            const content = obj.getContent(filename);

            log('filename: ' + filename);
            log('content: ' + content);
        }
        this._loop.quit();
    }

    _touch() {
        log('test _touch');

        const command_line = `touch ${this._configDir}/${this._appDir}/test`;

        log(command_line);

        const result = GLib.spawn_command_line_sync(command_line);

        console.log(result);
    }
}

new test();

// vim: set tabstop=4 shiftwidth=4 expandtab:
