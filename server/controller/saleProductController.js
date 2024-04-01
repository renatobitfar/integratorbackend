var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const database = require('../infra/database');
const msdbCon = require('../infra/azureDb');
const { QueryTypes } = require('sequelize');

module.exports = class SaleProductController {

    async getSalePorduct() {
        var listSaleProd = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT mv.movment_id AS id,
            mv.numlanc AS id_venda,
            mv.produto_id AS id_produto,
            mv.quanti_uni AS quantidade,
            mv.valor_tot AS vlr_venda_bruta,
            mv.valor_tot AS vlr_venda_liquida,
            mv.pmc AS vlr_custo
            FROM movment mv
            WHERE mv.oper IN (2,3,16,17,18) AND mv.movment_id > ${lastId};`
        const list = await database.query(query, { type: QueryTypes.SELECT });
        for (const item of list) {
            listSaleProd.push(
                {

                    id: item.id,
                    id_venda: item.id_venda,
                    id_produto: item.id_produto,
                    quantidade: item.quantidade,
                    vlr_venda_bruta: item.vlr_venda_bruta,
                    vlr_venda_liquida: item.vlr_venda_liquida,
                    vlr_custo: item.vlr_custo
                }
            )
        }
        return listSaleProd;
    }

    async create(saleProduct, callback) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[venda_produto]';

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
                    bulkLoad.addColumn('id_venda', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('id_produto', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('quantidade', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('vlr_venda_bruta', TYPES.Money, { nullable: false });
                    bulkLoad.addColumn('vlr_venda_liquida', TYPES.Money, { nullable: false });
                    bulkLoad.addColumn('vlr_custo', TYPES.Money, { nullable: false });

                    // execute
                    msdb.execBulkLoad(bulkLoad, saleProduct);
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
                    const sql = 'SELECT MAX(id) as id from dbo.venda_produto';

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