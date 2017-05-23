module.exports = {
    development: {
        client: 'pg',
        connection: 'postgres://localhost/pulse',
        pool: {
            min: 0,
            max: 10,
            afterCreate: function(conn, cb) {
                conn.query('SET timezone="UTC";', function(err) {
                    if (err) {
                        cb(err, conn);
                    } else {
                        conn.query('select 1+1 as result;', function(err) {
                            cb(err, conn);
                        });
                    }
                });
            }
        }
    },
    production: {
        client: 'pg',
        connection: 'postgres://mhwhmuqcvewsyx:c2700c44fd6e8719415c9105d31f067ad9520f9e1447005b5ab8f917ea839383@ec2-54-163-234-20.compute-1.amazonaws.com:5432/d7gi7rov0sqckd' + '?ssl=true',
        pool: {
            min: 0,
            max: 10,
            afterCreate: function(conn, cb) {
                conn.query('SET timezone="UTC";', function(err) {
                    if (err) {
                        cb(err, conn);
                    } else {
                        conn.query('select 1+1 as result;', function(err) {
                            cb(err, conn);
                        });
                    }
                });
            }
        }
    }
};