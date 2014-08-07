/*
 * grunt-couch-data
 * https://github.com/camman3d/grunt-couch-data
 *
 * Copyright (c) 2014 Josh
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    var q = require('q');
    var fs = require('fs');
    var async = require('async');
    var ws = require('../lib/ws.js');
    var checkedDBs = {};
    var options;

    function logVerbose(msg) {
        if (options.verbose) {
            grunt.log.writeln(msg);
        }
    }

    function checkDB(db) {
        logVerbose('Checking DB: ' + db);
        if (checkedDBs[db] === undefined) {
            return ws.get(options.dbHost + db).then(function (result) {
                checkedDBs[db] = result.error !== 'not_found';
                logVerbose('... DB exists: ' + checkedDBs[db]);
                return checkedDBs[db];
            });
        } else {
            logVerbose('... DB status cached: ' + checkedDBs[db]);
            return q(checkedDBs[db]);
        }
    }

    function createDB(db) {
        return checkDB(db).then(function (exists) {
            if (exists) {
                return true;
            } else {
                logVerbose('Creating DB: ' + db);
                return ws.put(options.dbHost + db).then(function (result) {
                    checkedDBs[db] = result.error !== 'file_exists';
                    logVerbose('... Successful: ' + checkedDBs[db]);
                    if (result.error) {
                        logVerbose(JSON.stringify(result));
                    }
                    return checkedDBs[db];
                });
            }
        });
    }

    function Fixture(file) {
        logVerbose('Loading fixture: ' + file);
        var filename = file.split('/').slice(-1)[0];

        var parts = filename.split('.');
        this.db = parts[0];
        this.id = parts[1];
        this.fixtureId = parts.length === 4 ? Number(parts[2]) : 0;
        // this.data = require(fixturePath + '/' + file);
        this.data = JSON.parse(grunt.file.read(file));
        this.name = parts[0] + '.' + parts[1] + ' [' + this.fixtureId + ']';

    }

    Fixture.prototype.toString = function () {
        return this.name;
    };

    function loadFixtures(files) {
        return files.filter(function(file) {
            // Remove nonexistent files
            return grunt.file.exists(file);
        }).map(function (file) {
            return new Fixture(file);
        }).sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    }

    function checkFixture(fixture) {
        logVerbose('Checking for fixture: ' + fixture);
        return ws.get(options.dbHost + fixture.db + '/' + fixture.id).then(function (result) {
            if (result.error === 'not_found') {
                logVerbose('... Fixture not found');
                return false;
            } else if (fixture.fixtureId) {
                if (result.fixtureId !== undefined && result.fixtureId >= fixture.fixtureId) {
                    logVerbose('... Fixture found');
                    return true;
                } else {
                    logVerbose('... Fixture found, but is not up to date');
                    fixture.data._rev = result._rev;
                    fixture.data.fixtureId = fixture.fixtureId;
                    return false;
                }
            } else {
                logVerbose('... Fixture found');
                return true;
            }
        });
    }

    function createFixture(fixture) {
        return checkFixture(fixture).then(function (exists) {
            if (exists) {
                return true;
            } else {
                logVerbose('Creating fixture: ' + fixture);
                return ws.put(options.dbHost + fixture.db + '/' + fixture.id, fixture.data).then(function (result) {
                    logVerbose('... Success: ' + !result.error);
                    if (result.error) {
                        logVerbose(JSON.stringify(result));
                    }
                    return !result.error;
                });
            }
        });
    }

    grunt.registerMultiTask('couch_data', 'Synchronizes JSON fixtures with CouchDB', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        options = this.options({
            verbose: false
        });

        if (!options.dbHost) {
            throw grunt.util.error('No DB host (dbHost) is specified in the options.');
        }

        var done = this.async();
        var fixtures = loadFixtures(this.filesSrc);

        async.eachSeries(fixtures, function (fixture, cb) {
            grunt.log.writeln('Synchronizing: ' + fixture.name);
            createDB(fixture.db).then(function () {
                return createFixture(fixture);
            }).then(function () {
                cb(null);
            });
        }, function (err, results) {
            grunt.log.writeln('Done!');
            done();
        });

    });

};
