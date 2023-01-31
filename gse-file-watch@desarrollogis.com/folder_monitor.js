'use strict';

const {
    Gio,
    GLib,
    GObject,
} = imports.gi;

var FolderMonitor = GObject.registerClass({
    Signals: {
        'changed': { param_types: [GObject.TYPE_JSOBJECT] },
    },
}, class FolderMonitor extends GObject.Object {
    constructor(path) {
        super();
        this._directoryChangedId = null;
        this._debounceTimeout = null;
        this._path = path;

        const directoryPath = GLib.build_filenamev(path);

        this._directory = Gio.File.new_for_path(directoryPath);
        if (!this._directory.query_exists(null)) {
            this._directory.make_directory_with_parents(null);
        }

        const monitorFlags = Gio.FileMonitorFlags.hasOwnProperty('WATCH_MOVES') ? Gio.FileMonitorFlags.WATCH_MOVES : Gio.FileMonitorFlags.SEND_MOVED;

        this._directoryMonitor = this._directory.monitor_directory(monitorFlags, null);
    }

    enable() {
        this._directoryChangedId = this._directoryMonitor.connect('changed', this._onChanged.bind(this));
    }

    disable() {
        this._directoryMonitor.disconnect(this._directoryChangedId);
        if (this._debounceTimeout !== null) {
            Mainloop.source_remove(this._debounceTimeout);
        }
    }

    _onChanged(monitor, file, otherFile, eventType) {
        if (this._debounceTimeout === null) {
            this._debounceTimeout = imports.mainloop.timeout_add(100, this._onChanged.bind(this));
        } else {
            this._debounceTimeout = null;

            const result = [];
            const iter = this._directory.enumerate_children('standard::*', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, null);
            let info;

            while ((info = iter.next_file(null)) != null) {
                const filename = info.get_name();

                if (!filename.startsWith('.')) {
                    result.push(info.get_name());
                }
            }
            result.sort();
            this.emit('changed', result);
        }
        return false;
    }

    getContent(filename) {
        const path = this._path.map((x) => x);

        path.push(filename);

        const filePath = GLib.build_filenamev(path);
        const file = Gio.File.new_for_path(filePath);
        const [, contents, etag] = file.load_contents(null);
        const decoder = new TextDecoder('utf-8');
        const result = decoder.decode(contents);

        return result;
    }
});

// vim: set tabstop=4 shiftwidth=4 expandtab:
