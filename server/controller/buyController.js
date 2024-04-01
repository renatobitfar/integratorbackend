var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const database = require('../infra/database');
const msdbCon = require('../infra/azureDb');
const { QueryTypes } = require('sequelize');

module.exports = class BuyController {

    async getBuy() {
        // Busca ultimo id 
        var listBuy = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT mv.numlanc AS id,
        mv.datanota AS data_compra,
        SUM(mv.valor_tot) AS valor_bruto_nota
        , mv.numnota AS num_nf
        FROM movment mv
        WHERE mv.oper = 1 AND mv.numlanc > ${lastId} 
        GROUP BY mv.numlanc;`
        const list = await database.query(query, { type: QueryTypes.SELECT });
        for (const item of list) {
            var tmpNumNf = item.num_nf || 0
            listBuy.push(
                {
                    id: item.id,
                    data_compra: item.data_compra,
                    valor_bruto_nota: item.valor_bruto_nota,
                    valor_liquido_nota: item.valor_bruto_nota,
                    num_nf: tmpNumNf.toString()
                }
            )
        }
        return listBuy;
    }

    async create(buy, callback) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[compras]';

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
                    bulkLoad.addColumn('data_compra', TYPES.Date, { nullable: false });
                    bulkLoad.addColumn('valor_bruto_nota', TYPES.Money, { nullable: false });
                    bulkLoad.addColumn('valor_liquido_nota', TYPES.Money, { nullable: false });
                    bulkLoad.addColumn('num_nf', TYPES.NVarChar, { nullable: false });

                    // execute
                    msdb.execBulkLoad(bulkLoad, buy);
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
                    const sql = 'SELECT MAX(id) as id from dbo.compras';

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