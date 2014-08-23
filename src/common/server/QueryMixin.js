var LocalServiceError = require('./LocalServiceError')
  , thunkify = require('thunkify')
  , pg = require('pg.js')
  , config = require('../../../config')
  , _ = require('underscore')

var QueryMixin = function QueryMixin() {}

QueryMixin.prototype.pg = pg
QueryMixin.prototype.conn_string = config.get('conn_string')
QueryMixin.prototype.duplicate_key_regex = /\(([^\)]+)\)/

QueryMixin.prototype.query = thunkify(function(req, cb) {
    var self = this

    self.pg.connect(self.conn_string, function(e, client, done) {
        if (e) {
            console.log(e)
            return cb(new LocalServiceError(self.ns, 'db_connection_error', 'Error connecting to db.', 500))
        } else {
            console.log(req.query)
            console.log(req.values)
            client.query(req.query, req.values, function(e, d) {
                done()

                if (e) {
                    console.log(e)
                    if (e.code === '23505') {
                        // Duplicate key
                        var found = e.detail.match(self.duplicate_key_regex)
                          , detail = {}

                        if (found[1]) {
                            detail.key = found[1]
                        }

                        return cb(new LocalServiceError(self.ns, 'db_duplicate_key_error', 'Duplicate key error.', 500, detail))
                    } else {
                        return cb(new LocalServiceError(self.ns, 'db_query_error', 'Error running query.', 500))
                    }
                } else {
                    console.log(d.rows)
                    return cb(null, self.clazz.from_db(d.rows))
                }
            })
        }
    })
})

QueryMixin.prototype.columns_string = function() {
    return this.columns.join(', ')
}

QueryMixin.prototype._select_by_id = function * (req) {
    var query = 'select * from ' + this.table + ' '
              + 'where id = $1 '
      , values = [req.id]

    return yield this.query({query: query, values: values})
}
QueryMixin.prototype.select_by_id = QueryMixin.prototype._select_by_id

QueryMixin.prototype._select_all_limit = function * (req) {
    var query = 'select * from ' + this.table + ' limit 1000'
      , values = []

    return yield this.query({query: query, values: values})
}
QueryMixin.prototype.select_all_limit = QueryMixin.prototype._select_all_limit

QueryMixin.prototype._get_prepared_indices = function(len) {
    var result = []

    for (var i = 0, ii = len; i < ii; ++i) {
        result.push('$' + (i + 1))
    }

    return result
}

QueryMixin.prototype._insert = function * (req) {
    console.log('11', this.columns.length)
    console.log('12', this._get_prepared_indices(this.columns.length))

    var query = 'insert into ' + this.table + ' '
              + '(' + this.columns_string() + ') values '
              + '(' + this._get_prepared_indices(this.columns.length).join(', ') + ') '
              + 'returning ' + this.columns_string()
      , req = req.to_db()
      , values = this.columns.map(function(column) {
            if (_.isArray(req[column])) {
                return '{' + req[column].join(',') + '}'
            } else {
                return req[column]
            }
        })

    return yield this.query({query: query, values: values})
}
QueryMixin.prototype.insert = QueryMixin.prototype._insert

QueryMixin.prototype._get_non_id_columns = function() {
    return this.columns.filter(function(column) {
        return column !== 'id'
    })
}

QueryMixin.prototype._update_by_id = function * (req) {
    // Update only those fields that are defined.
    // Use null to store nulls in db.
    // This is to prevent issues with partial updates.
    var query_columns = []
      , values = []

    for (var i = 0, ii = this.columns.length; i < ii; ++i) {
        var column = this.columns[i]

        if (column !== 'id' && req[column] !== void 0) {
            query_columns.push(column)

            if (_.isArray(req[column])) {
                values.push('{' + req[column].join(',') + '}')
            } else {
                values.push(req[column])
            }
        }
    }

    values.push(req.id)

    var query = 'update ' + this.table + ' '
        + 'set (' + query_columns.join(', ') + ') '
        + '= (' + this._get_prepared_indices(query_columns.length).join(', ') + ') '
        + 'where id=$' + (query_columns.length + 1) + ' '
        + 'returning ' + this.columns_string()
      , req = req.to_db()

    return yield this.query({query: query, values: values})
}
QueryMixin.prototype.update_by_id = QueryMixin.prototype._update_by_id

module.exports = QueryMixin