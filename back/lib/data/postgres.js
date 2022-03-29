const { Pool } = require('pg');
const { Exceptions } = require('../utils/exceptions');

class Postgres {

    constructor(parameters) {
        this.parameters = parameters;
        this.app = parameters.app;

        this.pool = new Pool(parameters);

    }

    query(sql) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql)
                .then(result =>
                    resolve(result.rows))
                .catch(err =>
                    reject(err)
                )
        })
    }

    select(sql) {
        return this.query(sql);
    }

    selectOne(sql) {
        return this.query(sql)
            .then(rows =>
                0 < rows.length ? rows[0] : undefined)
    }

    count(sql) {
        return this.selectOne(sql)
            .then(row =>
                row != undefined ? row.count : 0
            );
    }

    exists(sql) {
        return this.query(sql)
            .then(rows =>
                0 < rows.length
            );
    }

    execute(sql) {
        return this.query(sql);
    }

}

module.exports.Postgres = Postgres;