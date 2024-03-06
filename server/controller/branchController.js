var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class BranchController {

    async getBranch() {
        return [
            {
                id: 1,
                nome: 'Filial 1',
                cnpj:'123.456.0001-01'
            },
            {
                id: 2,
                nome: 'Filial 2',
                cnpj:'123.456.0001-02'
            }
        ]
    }

    async create(stock, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[filiais]';
        
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
                    bulkLoad.addColumn('nome', TYPES.NVarChar, {length:50, nullable: false });
                    bulkLoad.addColumn('cnpj', TYPES.NVarChar, {length:20, nullable: false });
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, stock);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}