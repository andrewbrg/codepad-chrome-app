var FilesHandler = function () {

    this.Notifications = undefined;

    this.init = function (notifications) {
        this.Notifications = notifications;
    };

    this.directoryOpen = function () {

        var that     = this;
        var deferred = $.Deferred();

        var onError = function (err) {
            that.Notifications.notify('danger', 'File Error', err);
            deferred.resolve(undefined);
        };

        chrome.fileSystem.chooseEntry({type: 'openDirectory'}, function (dirEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            deferred.resolve(dirEntry);
        });

        return deferred.promise();
    };


    this.fileOpen = function () {

        var that     = this;
        var deferred = $.Deferred();


        var onError = function (err) {
            that.Notifications.notify('danger', 'File Error', err);
            deferred.resolve(undefined);
        };

        chrome.fileSystem.chooseEntry({type: 'openWritableFile'}, function (fileEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            fileEntry.file(function (file) {

                var reader = new FileReader();

                reader.readAsText(file);
                reader.onerror = onError;
                reader.onload  = function (e) {
                    deferred.resolve(e, fileEntry);
                };
            }, onError);
        });


        return deferred.promise();
    };


    this.fileSave = function (fileEntry, fileContent) {

        var that     = this;
        var deferred = $.Deferred();

        var onError = function (err) {
            that.Notifications.notify('danger', 'File Error', err);
            deferred.resolve(undefined);
        };

        if (typeof fileEntry === typeof undefined) {
            deferred.resolve(undefined);
            return deferred.promise();
        }

        chrome.fileSystem.getWritableEntry(fileEntry, function (writableEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            writableEntry.createWriter(function (writer) {

                writer.seek(0);
                writer.write(new Blob([fileContent], {type: 'text/plain'}));

                writer.onerror    = onError;
                writer.onwriteend = function (e) {
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
            deferred.resolve(undefined);
        };

        chrome.fileSystem.chooseEntry({type: 'saveFile', suggestedName: fileName, acceptsMultiple: false}, function (writableEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            writableEntry.createWriter(function (writer) {

                writer.seek(0);
                writer.write(new Blob([fileContent], {type: 'text/plain'}));

                writer.onerror    = onError;
                writer.onwriteend = function (e) {
                    deferred.resolve(e, writableEntry);
                };
            });
        });

        return deferred.promise();
    };

    this.fileRename = function (fileEntry, newFileName) {

        var that     = this;
        var deferred = $.Deferred();

        if (typeof fileEntry === typeof undefined || typeof newFileName === typeof undefined) {
            deferred.resolve(fileEntry);
            return deferred.promise();
        }

        var onError = function (err) {
            that.Notifications.notify('danger', 'File Error', err);
            deferred.resolve(undefined);
        };

        chrome.fileSystem.getWritableEntry(fileEntry, function (writableFileEntry) {

            if (chrome.runtime.lastError) {
                onError(chrome.runtime.lastError.message);
                return deferred.promise();
            }

            writableFileEntry.getParent(function (fileParent) {
                writableFileEntry.moveTo(fileParent, newFileName, function (updatedEntry) {
                    deferred.resolve(updatedEntry);
                }, onError);
            }, onError);
        });

        return deferred.promise();
    };
};