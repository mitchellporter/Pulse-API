
module.exports = {
  development: {
        client: 'pg',
        connection: 'postgres://localhost/pulse',
        pool: {
            min: 0,
            max: 10,
            afterCreate: function (conn, cb) {
                console.log('after create');
              conn.query('SET timezone="UTC";', function (err) {
                if (err) {
                  cb(err, conn);      
                } else {
                  conn.query('select 1+1 as result;', function (err) {
                    cb(err, conn);
                  });
                }
              });
            }
          }
    }
};
