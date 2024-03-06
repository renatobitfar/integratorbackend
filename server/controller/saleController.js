var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class SaleController {

    async getSale() {
        return [
            {
                id: 1,
                data:'2024-01-01',
                id_pessoa:1,
                num_nf: '123456',
                id_loja: 1
            },
            {
                id: 2,
                data:'2024-01-01',
                id_pessoa:2,
                num_nf: '123453',
                id_loja: 2
            }
        ]
    }

    async create(sale, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[vendas]';
        
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
                    bulkLoad.addColumn('data', TYPES.Date, { nullable: false });
                    bulkLoad.addColumn('id_pessoa', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('num_nf', TYPES.NVarChar, {nullable:true});
                    bulkLoad.addColumn('id_loja', TYPES.Int, { nullable: false });
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, sale);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}