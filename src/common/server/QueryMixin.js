var LocalServiceError = require('./LocalServiceError')
  , thunkify = require('thunkify')
  , pg = require('pg.js')
  , config = require('../../../config')

var QueryMixin = function QueryMixin() {}

QueryMixin.prototype.pg = pg
QueryMixin.prototype.conn_string = config.get('conn_string')

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
                        return cb(new LocalServiceError(self.ns, 'db_duplicate_key_error', 'Duplicate key error.', 500))
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

QueryMixin.prototype._select_all_limit = function * (req) {
    var query = 'select * from ' + this.table + ' limit 1000'
      , values = []

    return yield this.query({query: query, values: values})
}
QueryMixin.prototype.select_all_limit = QueryMixin.prototype._select_all_limit

QueryMixin.prototype._get_prepared_indices = function(keys) {
    return keys.map(function(v, i) {
        return '$' + (i + 1)
    })
}

QueryMixin.prototype._insert = function * (req) {
    var query = 'insert into ' + this.table + ' '
              + '(' + this.columns_string() + ') values '
              + '(' + this._get_prepared_indices(this.columns).join(', ') + ') '
              + 'returning ' + this.columns_string()
      , req = req.to_db()
      , values = this.columns.map(function(column) {return req[column]})

    return yield this.query({query: query, values: values})
}
QueryMixin.prototype.insert = QueryMixin.prototype._insert

QueryMixin.prototype._get_non_id_columns = function() {
    return this.columns.filter(function(column) {
        return column !== 'id'
    })
}

QueryMixin.prototype._update_by_id = function * (req) {
    var query = 'update ' + this.table + ' '
        + 'set (' + this._get_non_id_columns().join(', ') + ') '
        + '= (' + this._get_prepared_indices(this._get_non_id_columns()).join(', ') + ') '
        + 'where id=$' + this.columns.length
      , values = this.columns.map(function(column) {return req[column]})

    return yield this.query({query: query, values: values}, cb)
}
QueryMixin.prototype.update_by_id = QueryMixin.prototype._update_by_id

module.exports = QueryMixin