var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class BuyProductController {

    async getBuyProduct() {
        return [
            {
                id: 1,
                id_produto:1,
                id_compra:1,
                valor_bruto: 1100.00,
                valor_liquido: 1000.00,
                preço_custo: 100.00,
                quantidade: 10
            },
            {
                id: 2,
                id_produto:2,
                id_compra:2,
                valor_bruto: 2100.00,
                valor_liquido: 2000.00,
                preço_custo: 100.00,
                quantidade: 20
            }
        ]
    }

    async create(buyProduct, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[compras_produtos]';
        
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
                    bulkLoad.addColumn('id_produto', TYPES.Int, { nullable: true });
                    bulkLoad.addColumn('id_compra', TYPES.Int, { nullable: true });
                    bulkLoad.addColumn('valor_bruto', TYPES.Money, { nullable: true });
                    bulkLoad.addColumn('valor_liquido', TYPES.Money, {nullable:true});
                    bulkLoad.addColumn('preço_custo', TYPES.Money, {nullable:true});
                    bulkLoad.addColumn('quantidade', TYPES.Int, {nullable:true});
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, buyProduct);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}