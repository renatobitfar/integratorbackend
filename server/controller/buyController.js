var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class BuyController {

    async getBuy() {
        return [
            {
                id: 1,
                data_compra:'2024-01-01',
                valor_bruto_nota:1152.20,
                valor_liquido_nota: 1000.00,
                num_nf: '123456'
            },
            {
                id: 2,
                data_compra:'2024-01-02',
                valor_bruto_nota:152.20,
                valor_liquido_nota: 100.00,
                num_nf: '0001'
            }
        ]
    }

    async create(buy, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[compras]';
        
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
                    bulkLoad.addColumn('data_compra', TYPES.Date, { nullable: false });
                    bulkLoad.addColumn('valor_bruto_nota', TYPES.Money, { nullable: false });
                    bulkLoad.addColumn('valor_liquido_nota', TYPES.Money, {nullable:false});
                    bulkLoad.addColumn('num_nf', TYPES.NVarChar, {nullable:false});
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, buy);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}