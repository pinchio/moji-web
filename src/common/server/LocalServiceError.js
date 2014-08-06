var LocalServiceError = function LocalServiceError(namespace, type, description, status_code, detail) {
    this.namespace = namespace
    this.type = type
    this.description = description
    this.status_code = status_code
    this.detail = detail
}

LocalServiceError.prototype.to_client = function() {
    return {
        type: this.type
      , description: this.description
    }
}

module.exports = LocalServiceError
