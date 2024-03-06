var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class PriceManufProductController {

    async getPrice() {
        return [
            {
                id: 1,
                id_produto:1,
                preco:52.20,
                data: '2024-01-01'
            },
            {
                id: 2,
                id_produto:2,
                preco:22.20,
                data: '2024-02-01'
            }
        ]
    }

    async create(price, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[precos_fabrica_produto]';
        
                    // instantiate - provide the table where you'll be inserting to, options and a callback
                    const bulkLoad = msdb.newBulkLoad(table, options, function (err, rowCount) {
                        if (err) {
                            console.error(err);
                        }
                        console.log('rows inserted :', rowCount);
                        console.log('DONE!');
                        msdb.close()
                    });
        
                    // setup your columns - always indicate whether the column is nullable
                    bulkLoad.addColumn('id', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('id_produto', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('preco', TYPES.Money, { nullable: false });
                    bulkLoad.addColumn('data', TYPES.Date, { nullable: false });
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, price);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}