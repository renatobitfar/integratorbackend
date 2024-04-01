var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const database = require('../infra/database');
const msdbCon = require('../infra/azureDb');
const { QueryTypes } = require('sequelize');

module.exports = class SaleController {

    async getSale() {
        var listSale = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT m.numlanc AS id,
            m.data_hora AS data,
            m.usuario_id AS id_pessoa,
            m.numnota AS num_nf,
            m.filial_id AS id_loja
            FROM movment m 
            WHERE m.oper IN (2,3,16,17,18) AND m.numlanc > ${lastId} 
            GROUP BY m.numlanc;`
        const list = await database.query(query, { type: QueryTypes.SELECT });
        for (const item of list) {
            var tmpNumNF = item.num_nf || 0
            listSale.push(
                {
                    id: item.id,
                    data: item.data || '1900-01-01',
                    id_pessoa: item.id_pessoa,
                    num_nf: tmpNumNF.toString(),
                    id_loja: item.id_loja
                }
            )
        }
        return listSale;
    }

    async create(sale, callback) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[vendas]';

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
                    bulkLoad.addColumn('data', TYPES.Date, { nullable: false });
                    bulkLoad.addColumn('id_pessoa', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('num_nf', TYPES.NVarChar, { nullable: true });
                    bulkLoad.addColumn('id_loja', TYPES.Int, { nullable: false });

                    // execute
                    msdb.execBulkLoad(bulkLoad, sale);
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
                    const sql = 'SELECT MAX(id) as id from dbo.vendas';

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