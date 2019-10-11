'use strict';

/**
 * File copied from git-describe.
 * (C) Tim van der Staaij. Released under MIT license.
 */

var _ = require('lodash');
var execFileSync = require('child_process').execFileSync;
var path = require('path');
var fs = require('fs');
var os = require('os');
var rimraf = require('rimraf');
require('chai').should();

function TestRepo(dir) {
    this._dir = path.normalize(dir);
    this._dataCount = 0;
    this._commitCount = 0;
    this._dataFile = path.join(this._dir, 'count');
}

TestRepo.prototype._execGit = function() {
    return execFileSync('git', [].slice.call(arguments), {
        cwd: this._dir
    });
};

TestRepo.prototype.clean = function() {
    // Safety check to avoid nuking directory trees out of the tmp directory path
    this._dir.should.satisfy(_.partial(_.startsWith, _, os.tmpdir()));

    rimraf.sync(path.join(this._dir, '.git'));
    rimraf.sync(path.join(this._dir, '*'));
};

TestRepo.prototype.init = function() {
    this.clean();
    this._execGit('init');
    this._execGit('config', 'core.autocrlf', 'false');
    this._execGit('config', 'user.name', 'Mocha');
    this._execGit('config', 'user.email', 'test@example.org');
    this.changeData();
    this.commit();
};

TestRepo.prototype.changeData = function() {
    fs.writeFileSync(this._dataFile, String(++this._dataCount));
};

TestRepo.prototype.commit = function() {
    var message = '--message="Commit #' + String(++this._commitCount) + '"';
    this._execGit('add', this._dataFile);
    this._execGit('commit', message);
};

TestRepo.prototype.tagLightweight = function(name) {
    this._execGit('tag', name);
};

TestRepo.prototype.tagAnnotated = function(name) {
    this._execGit('tag', '-a', name, '-m', name);
};

module.exports = TestRepo;
