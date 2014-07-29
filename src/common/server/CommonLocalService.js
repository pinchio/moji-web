var LocalServiceError = require('./LocalServiceError')
  , file_hashes = require('public/_/file_hashes.json')
  , StaticMixin = require('../StaticMixin')
  , _ = require('underscore')

var CommonLocalService = function CommonLocalService() {}

CommonLocalService.prototype.get_file_hash = function(file_name) {
    var file_hash = file_hashes.find(function(file_hash) {
        if (file_hash.file === file_name) {
            return true
        }
    })

    // TODO: if no hash but file exists that means precommit task did not run.
    try {
        return file_hash.hash
    } catch(e) {
        console.log(file_name)
        throw e
    }
}
_.extend(CommonLocalService, StaticMixin)

module.exports = CommonLocalService
