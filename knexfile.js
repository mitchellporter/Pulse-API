
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
                  console.log('conn.query');
                if (err) {
                    console.log('conn.query error');
                  cb(err, conn);      
                } else {
                  // set trigram search match similarity limit
                  console.log('else');
                  conn.query('SELECT set_limit(0.01);', function (err) {
                      console.log('select set_limit');
                    cb(err, conn);
                  });
                }
              });
            }
          }
    }
};

        // knex: {
        //   client: 'postgres',
        //   debug: false,
        //   connection: {
        //     host: process.env.POSTGRES_HOST || 'localhost',
        //     port: process.env.POSTGRES_PORT || 5432,
        //     user: process.env.POSTGRES_USER || 'postgres',
        //     password: process.env.POSTGRES_USER_PW || undefined
        //   },
        //   pool: {
        //     min: 0,
        //     max: 10,
        //     afterCreate: function (conn, cb) {
        //       conn.query('SET timezone="UTC";', function (err) {
        //         if (err) {
        //           cb(err, conn);      
        //         } else {
        //           // set trigram search match similarity limit
        //           conn.query('SELECT set_limit(0.01);', function (err) {
        //             cb(err, conn);
        //           });
        //         }
        //       });
        //     }
        //   },
        //   migrations: {
        //     tableName: 'migrations'
        //   }
        // }