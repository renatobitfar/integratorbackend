var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class CategoryController {

    async getCategory() {
        return [
            {
                id: 1,
                Nome: "Categoria 1",
                descricao: "Descrição categoria 1"
            },
            {
                id: 2,
                Nome: "Categoria 2",
                descricao: "Descrição categoria 2"
            }
        ]
    }

    async create(category, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[categorias]';
        
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
                    bulkLoad.addColumn('Nome', TYPES.NVarChar, { length: 100, nullable: false });
                    bulkLoad.addColumn('descricao', TYPES.NText, { nullable: true });
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, category);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}