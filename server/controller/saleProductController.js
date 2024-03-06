var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class SaleProductController {

    async getSalePorduct() {
        return [
            {
                id: 1,
                id_venda:1,
                id_produto:1,
                quantidade: 1,
                vlr_venda_bruta: 25.00,
                vlr_venda_liquida:24.50,
                vlr_custo:22.50,
            },
            {
                id: 2,
                id_venda:2,
                id_produto:2,
                quantidade: 2,
                vlr_venda_bruta: 27.00,
                vlr_venda_liquida:25.50,
                vlr_custo:20.50,
            }
        ]
    }

    async create(saleProduct, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[venda_produto]';
        
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
                    bulkLoad.addColumn('id_venda', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('id_produto', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('quantidade', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('vlr_venda_bruta', TYPES.Money, { nullable: false });
                    bulkLoad.addColumn('vlr_venda_liquida', TYPES.Money, {nullable:false});
                    bulkLoad.addColumn('vlr_custo', TYPES.Money, {nullable:false});
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, saleProduct);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}