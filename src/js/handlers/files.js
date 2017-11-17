var FilesHandler = function () {

    this.Notifications = undefined;

    this.retainedKey = 'retEntStorage';
    this.openedDirs  = [];
    this.openedFiles = [];

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Private File
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                        if (!chrome.runtime.lastError) {
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

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Public File
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.init = function (notifications) {

        this.Notifications = notifications;
        this._restoreEntries();
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

    this.fileOpen = function (fileEntry) {

        var that     = this;
        var deferred = $.Deferred();

        var onError = function (err) {
            that.Notifications.notify('danger', 'File Error', err);
            deferred.reject();
        };

        var readFile = function (fileEntry, deferred) {
            fileEntry.file(function (file) {

                var reader = new FileReader();

                reader.readAsText(file);
                reader.onerror = onError;
                reader.onload  = function (e) {
                    that._retainEntry(fileEntry);
                    deferred.resolve(e, fileEntry);
                };
            }, onError);
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
            that.Notifications.notify('danger', 'File Error', err);
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

                writer.seek(0);
                writer.write(new Blob([fileContent], {type: 'text/plain'}));

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
            that.Notifications.notify('danger', 'File Error', err);
            deferred.reject();
        };

        chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: fileName, acceptsMultiple: false}, function (writableEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            // noinspection JSUnresolvedFunction
            writableEntry.createWriter(function (writer) {

                writer.seek(0);
                writer.write(new Blob([fileContent], {type: 'text/plain'}));

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
            that.Notifications.notify('danger', 'File Error', err);
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