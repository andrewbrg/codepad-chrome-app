var FilesHandler = function () {

    this.Notifications = undefined;

    this.allowedMimeTypes = [];
    this.openedDirs       = [];
    this.openedFiles      = [];
    this.retainedKey      = 'retained_entries_key';

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private File
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this._waitForIO = function (writer, callback) {

        var that      = this;
        var start     = Date.now();
        var reEntrant = function () {

            // noinspection JSUnresolvedVariable
            var writerState = writer.WRITING;

            if (writer.readyState === writerState && Date.now() - start < 4000) {
                setTimeout(reEntrant, 100);
                return;
            }
            if (writer.readyState === writerState) {
                that.Notifications.notify('danger', 'File system', 'Write operation taking too long, aborting! (Writer readyState is ' + writer.readyState + ')');
                writer.abort();
            }
            else {
                callback();
            }
        };
        setTimeout(reEntrant, 100);
    };


    this._getRetainedEntries = function () {

        var that     = this;
        var deferred = $.Deferred();

        chrome.storage.local.get(this.retainedKey, function (data) {
            if (chrome.runtime.lastError) {
                that.Notifications.notify('warning', '', chrome.runtime.lastError.message);
                deferred.reject();
            }
            else {
                var retainedEntries = data[that.retainedKey] || [];
                deferred.resolve(retainedEntries);
            }
        });

        return deferred.promise();
    };

    this._restoreEntries = function () {

        var that = this;

        this._getRetainedEntries().then(function (data) {
            data.forEach(function (retainedEntry) {
                chrome.fileSystem.isRestorable(retainedEntry, function () {
                    chrome.fileSystem.restoreEntry(retainedEntry, function (restoredEntry) {

                        if (chrome.runtime.lastError) {
                            console.info(chrome.runtime.lastError.message);
                        }
                        else {
                            // noinspection JSUnresolvedVariable
                            if (restoredEntry.isDirectory) {
                                that.openedDirs.push(restoredEntry);
                            }
                            else {
                                that.openedFiles.push(restoredEntry);
                            }
                        }
                    });
                });
            });
        });
    };

    this._retainEntry = function (entry) {

        var that = this;

        this._getRetainedEntries().then(function (data) {

            var obj                 = {};
            var _openedDirs         = [];
            var _openedFiles        = [];
            var retainEntryHash     = chrome.fileSystem.retainEntry(entry);
            var retainEntryHashName = retainEntryHash.split(':').pop();

            if (entry.isDirectory) {
                _openedDirs = [entry];
            }
            else {
                _openedFiles = [entry];
            }

            that.openedDirs.forEach(function (openedDir) {
                // noinspection JSUnresolvedVariable
                if (openedDir.fullPath !== entry.fullPath) {
                    _openedDirs.push(openedDir);
                }
            });

            that.openedFiles.forEach(function (openedFile) {
                // noinspection JSUnresolvedVariable
                if (openedFile.fullPath !== entry.fullPath) {
                    _openedFiles.push(openedFile);
                }
            });


            obj[that.retainedKey] = [retainEntryHash];
            data.forEach(function (retainedEntry) {
                if (retainEntryHashName !== retainedEntry.split(':').pop()) {
                    obj[that.retainedKey].push(retainedEntry);
                }
            });

            that.openedDirs  = _openedDirs;
            that.openedFiles = _openedFiles;
            chrome.storage.local.set(obj);
        });
    };

    this._getParentDirForFile = function (dirPath) {

        var deferred = $.Deferred();

        var found = false;
        this.openedDirs.forEach(function (openedDir) {
            // noinspection JSUnresolvedVariable
            if (openedDir.fullPath === dirPath) {
                deferred.resolve(openedDir);
                found = true;
            }
        });

        if (!found) {
            this.directoryOpen(dirPath).then(function (dirEntry) {
                deferred.resolve(dirEntry);
            }).fail(function () {
                deferred.reject();
            });
        }

        return deferred.promise();
    };

    this._isValidFileMime = function (file) {

        var valid = false;

        if (typeof file.type === typeof undefined ||
            file.type === 'undefined' ||
            file.type === '') {
            return true;
        }

        this.allowedMimeTypes.forEach(function (mime) {
            if (file.type.match(mime)) {
                valid = true;
            }
        });

        return valid;
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public File
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function (notifications) {

        this.Notifications = notifications;
        this._restoreEntries();
        this.allowedMimeTypes = chrome.runtime.getManifest().file_handlers.text.types;
    };

    this.directoryOpen = function (dirPath) {

        var that     = this;
        var deferred = $.Deferred();

        var onError = function (err) {
            that.Notifications.notify('danger', 'Directory Error', err);
            deferred.reject();
        };

        chrome.fileSystem.chooseEntry({type: 'openDirectory', suggestedName: dirPath}, function (dirEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            that._retainEntry(dirEntry);
            deferred.resolve(dirEntry);
        });

        return deferred.promise();
    };

    this.fileDrop = function (event) {

        var that     = this;
        var promises = [];
        var deferred = $.Deferred();

        // noinspection JSUnresolvedVariable
        var files = event.originalEvent.dataTransfer.items;
        for (var i = 0; i < files.length; i++) {

            var file = files[i];

            // noinspection JSUnresolvedFunction
            var fileEntry = file.webkitGetAsEntry();
            if (file.kind === 'file' && fileEntry) {

                if (that._isValidFileMime(file)) {
                    promises.push(that.fileOpen(fileEntry));
                }
                else {
                    that.Notifications.notify('danger', 'Filesystem error', fileEntry.name + ' has an unsupported file type (' + fileEntry.type + ') and will not be opened');
                }
            }
        }

        if (promises.length > 0) {
            $.when.apply($, promises).done(function () {

                var data = [];
                var args = !$.isArray(arguments[0]) ? [arguments] : arguments;

                for (var i = 0; i < args.length; i++) {
                    data.push(args[i]);
                }
                deferred.resolve(data);
            });
        } else {
            deferred.resolve([]);
        }

        return deferred.promise();
    };

    this.fileOpen = function (fileEntry) {

        var that     = this;
        var deferred = $.Deferred();

        var onError = function (err) {
            that.Notifications.notify('danger', 'Filesystem error', err);
            deferred.reject();
        };

        var readFile = function (fileEntry, deferred) {

            if (typeof fileEntry.file !== 'function') {
                onError('Entry is not a file');
                deferred.reject();
            }
            else {
                fileEntry.file(function (file) {

                    var reader = new FileReader();

                    if (!that._isValidFileMime(file)) {
                        onError(file.name + ' has an unsupported file type (' + file.type + ') and will not be opened');
                    } else {
                        reader.readAsText(file);
                        reader.onerror = onError;
                        reader.onload  = function (e) {
                            that._retainEntry(fileEntry);
                            deferred.resolve(e, fileEntry);
                        };
                    }
                }, onError);
            }
        };

        if (typeof fileEntry === typeof undefined) {
            chrome.fileSystem.chooseEntry({type: 'openWritableFile'}, function (fileEntry) {

                if (chrome.runtime.lastError) {
                    onError(chrome.runtime.lastError.message);
                    return deferred.promise();
                }

                readFile(fileEntry, deferred);
            });
        }
        else {
            readFile(fileEntry, deferred);
        }

        return deferred.promise();
    };

    this.fileSave = function (fileEntry, fileContent) {

        var that     = this;
        var deferred = $.Deferred();

        var onError = function (err) {
            that.Notifications.notify('danger', 'Filesystem error', err);
            deferred.reject();
        };

        if (typeof fileEntry === typeof undefined) {
            onError('Undefined file entry');
            return deferred.promise();
        }

        chrome.fileSystem.getWritableEntry(fileEntry, function (writableEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            // noinspection JSUnresolvedFunction
            writableEntry.createWriter(function (writer) {

                var blob = new Blob([fileContent]);

                // noinspection JSUnresolvedFunction
                writer.truncate(blob.size);
                that._waitForIO(writer, function () {
                    writer.seek(0);
                    writer.write(blob, {type: 'text/plain'})
                });

                writer.onabort    = onError;
                writer.onerror    = onError;
                writer.onwriteend = function (e) {
                    that._retainEntry(writableEntry);
                    deferred.resolve(e, writableEntry);
                };
            });
        });

        return deferred.promise();
    };

    this.fileSaveAs = function (fileName, fileContent) {

        var that     = this;
        var deferred = $.Deferred();

        var onError = function (err) {
            that.Notifications.notify('danger', 'Filesystem error', err);
            deferred.reject();
        };

        chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: fileName, acceptsMultiple: false}, function (writableEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            // noinspection JSUnresolvedFunction
            writableEntry.createWriter(function (writer) {

                var blob = new Blob([fileContent]);

                // noinspection JSUnresolvedFunction
                writer.truncate(blob.size);
                that._waitForIO(writer, function () {
                    writer.seek(0);
                    writer.write(blob, {type: 'text/plain'})
                });

                writer.onabort    = onError;
                writer.onerror    = onError;
                writer.onwriteend = function (e) {
                    that._retainEntry(writableEntry);
                    deferred.resolve(e, writableEntry);
                };
            });
        });

        return deferred.promise();
    };

    this.fileRename = function (fileEntry, oldFileName, newFileName) {

        var that     = this;
        var deferred = $.Deferred();

        if (typeof fileEntry === typeof undefined || typeof newFileName === typeof undefined) {
            deferred.resolve(undefined);
            return deferred.promise();
        }

        var onError = function (err) {
            that.Notifications.notify('danger', 'Filesystem error', err);
            deferred.reject();
        };

        chrome.fileSystem.getWritableEntry(fileEntry, function (writableFileEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            // noinspection JSUnresolvedVariable
            var dirPath = fileEntry.fullPath.replace(writableFileEntry.fullPath, '');

            that._getParentDirForFile(dirPath).then(function (dirEntry) {
                // noinspection JSUnresolvedFunction
                writableFileEntry.moveTo(dirEntry, newFileName, function (updatedEntry) {
                    that._retainEntry(updatedEntry);
                    deferred.resolve(updatedEntry);
                }, onError);
            });
        });

        return deferred.promise();
    };

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
};