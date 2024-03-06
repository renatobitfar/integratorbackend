var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class GoalController {

    async getGoal() {
        return [
            {
                id: 1,
                data:'2024-01-01',
                id_produto:1,
                id_filial:1,
                id_pessoa:1,
                comissionado:1,
                vlr_fat_bruto:1152.20,
                vlr_fat_liquido: 1000.00,
                quantidade: 100
            },
            {
                id: 2,
                data:'2024-02-01',
                id_produto:2,
                id_filial:2,
                id_pessoa:2,
                comissionado:1,
                vlr_fat_bruto:1152.20,
                vlr_fat_liquido: 1000.00,
                quantidade: 100
            }
        ]
    }

    async create(goal, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[metas]';
        
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
                    bulkLoad.addColumn('data', TYPES.Date, { nullable: true });
                    bulkLoad.addColumn('id_produto', TYPES.Int, { nullable: true });
                    bulkLoad.addColumn('id_filial', TYPES.Int, { nullable: true });
                    bulkLoad.addColumn('id_pessoa', TYPES.Int, { nullable: true });
                    bulkLoad.addColumn('comissionado', TYPES.TinyInt, { nullable: true });
                    bulkLoad.addColumn('vlr_fat_bruto', TYPES.Money, { nullable: true });
                    bulkLoad.addColumn('vlr_fat_liquido', TYPES.Money, {nullable:true});
                    bulkLoad.addColumn('quantidade', TYPES.Int, {nullable:true});
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, goal);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}