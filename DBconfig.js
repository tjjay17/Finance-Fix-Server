const pg = require('pg');
const constants = require('./Constants');

let pool = new pg.Pool({connectionString:constants.SQL_URL});
pool.on('error',(err,client) =>{
    console.log('Enexpected Error',err);
});
exports.pool = pool;
