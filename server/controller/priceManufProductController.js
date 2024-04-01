var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const database = require('../infra/database');
const msdbCon = require('../infra/azureDb');
const { QueryTypes } = require('sequelize');

module.exports = class PriceManufProductController {

    async getPrice() {
        var listPriceManuf = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT m.movment_id AS id,
            m.produto_id AS id_produto,
            m.preco_unit AS preco,
            m.data_hora AS data
            FROM movment m WHERE m.movment_id > ${lastId};`
        const list = await database.query(query, { type: QueryTypes.SELECT });
        for (const item of list) {
            listPriceManuf.push(
                {
                    id: item.id,
                    id_produto: item.id_produto,
                    preco: item.preco,
                    data: item.data
                }
            )
        }
        return listPriceManuf;
    }

    async create(price, callback) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[precos_fabrica_produto]';

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
                    bulkLoad.addColumn('id_produto', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('preco', TYPES.Money, { nullable: false });
                    bulkLoad.addColumn('data', TYPES.Date, { nullable: false });

                    // execute
                    msdb.execBulkLoad(bulkLoad, price);
                }
            });

            msdb.connect();
        } catch (error) {
            console.error(error);
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
                    const sql = 'SELECT MAX(id) as id from dbo.precos_fabrica_produto';

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