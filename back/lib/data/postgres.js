const { timeStamp } = require('console');
const { isThisQuarter } = require('date-fns');
const { Pool } = require('pg');

class Postgres {

    constructor(parameters) {
        this.parameters = parameters;
        this.app = parameters.app;

        this.pool = new Pool(parameters);

    }

    query(sql, service) {
        this.log(sql, service);
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

    log(sql, service) {
        this.app.log(sql, service != undefined ? service.req : undefined)
    }

}

module.exports.Postgres = Postgres;