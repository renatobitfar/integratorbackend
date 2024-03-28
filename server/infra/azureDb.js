// const config = require('config');

// Driver={ODBC Driver 18 for SQL Server};Server=tcp:pw-bi-bd-server.database.windows.net,1433;Database=pwBIDB;Uid=renatopwbi;Pwd={your_password_here};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;
var Connection = require('tedious').Connection;
var configDB = {
    server: 'pw-bi-bd-server.database.windows.net',  //update me
    authentication: {
        type: 'default',
        options: {
            userName: 'renatopwbi', //update me
            password: 'pwbi#2023ren@to'  //update me
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        encrypt: true,
        database: 'pwBIDB'  //update me
    }
};
var connection = new Connection(configDB);

module.exports = connection;



// connection.on('connect', function (err) {
//     // If no error, then good to proceed.
//     console.log("Connected");
// });

// connection.connect();