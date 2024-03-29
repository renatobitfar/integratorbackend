var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');
const database = require('../infra/database');

module.exports = class CategoryController {

    async getClassifications() {
        // Busca ultimo id 
        const lastId = await database.query("SELECT * FROM grupo");
        console.log(lastId);
        return [
            {
                id: 1,
                nome: "Classificação 1",
                descricao: "Descrição Classificação 1"
            },
            {
                id: 2,
                nome: "Classificação 2",
                descricao: "Descrição Classificação 2"
            }
        ]
    }

    async create(classification, callback) {
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[classificacoes]';

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
                    bulkLoad.addColumn('nome', TYPES.NVarChar, { length: 100, nullable: false });
                    bulkLoad.addColumn('descricao', TYPES.NText, { nullable: true });

                    // execute
                    msdb.execBulkLoad(bulkLoad, classification);
                }
            });

            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}