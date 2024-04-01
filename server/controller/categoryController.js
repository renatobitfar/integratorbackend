var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const { QueryTypes } = require('sequelize');
const msdbCon = require('../infra/azureDb');
const database = require('../infra/database');

module.exports = class CategoryController {

    async getCategory() {
        var listCategory = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT * FROM grupo WHERE grupo_id > ${lastId};`
        const cats = await database.query(query, { type: QueryTypes.SELECT });
        for (const cat of cats) {
            listCategory.push(
                {
                    id:cat.grupo_id,
                    Nome:cat.descricao || '',
                    descricao:cat.lojas_leram2 || ''
                }
            )
        }
        return listCategory;
    }

    async create(category) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
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
            console.error(error.message);
        }
    }

    async getLastId() {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        return new Promise((resolve, reject) => {
            var id = 0;
            msdb.on("connect", async function (errCon) {
                if (errCon) {
                    console.error(errCon);
                    reject(errCon);
                } else {
                    const sql = 'SELECT MAX(id) as id from dbo.categorias';

                    const request = new Request(sql, (err) => {
                        if (err) {
                            console.error(err);
                        }
                        console.log('DONE! Closing Connection');
                        msdb.close();
                    });

                    request.on('row', (columns) => {
                        columns.forEach((column) => {
                            if (column.value === null) {
                                console.log('NULL');
                            } else {
                                console.log(column.value);
                                id = column.value;
                            }
                        });
                    });
                    request.on('doneInProc', (rowCount) => {
                        console.log(rowCount + ' rows returned');
                        resolve(id);
                    });

                    msdb.execSql(request);
                }
            });
            msdb.connect();
        })
    }
}