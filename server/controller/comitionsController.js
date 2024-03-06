var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class ComitionController {

    async getComition() {
        return [
            {
                id: 1,
                id_classificacao:1,
                id_categoria:1,
                perc_comissao: 5.0,
                val_unidade: 14.50
            },
            {
                id: 2,
                id_classificacao:2,
                id_categoria:2,
                perc_comissao: 5.5,
                val_unidade: 10.50
            }
        ]
    }

    async create(comition, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[comissoes]';
        
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
                    bulkLoad.addColumn('id_classificacao', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('id_categoria', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('perc_comissao', TYPES.Decimal, {nullable:false, precision:3});
                    bulkLoad.addColumn('val_unidade', TYPES.Money, {nullable:false});
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, comition);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}