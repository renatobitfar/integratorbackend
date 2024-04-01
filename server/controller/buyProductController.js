var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const database = require('../infra/database');
const msdbCon = require('../infra/azureDb');
const { QueryTypes } = require('sequelize');

module.exports = class BuyProductController {

    async getBuyProduct() {
        // Busca ultimo id 
        var listBuyProd = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT mv.movment_id AS id,
        mv.produto_id AS id_produto,
        mv.numlanc AS id_compra,
        mv.valor_tot AS valor_bruto,
        mv.quanti_uni AS quantidade
        FROM movment mv
        WHERE mv.oper = 1 AND mv.movment_id > ${lastId};`
        const list = await database.query(query, { type: QueryTypes.SELECT });
        for (const item of list) {
            listBuyProd.push(
                {
                    id: item.id,
                    id_produto: item.id_produto,
                    id_compra: item.id_compra,
                    valor_bruto: item.valor_bruto,
                    valor_liquido: item.valor_bruto,
                    preço_custo: item.valor_bruto,
                    quantidade: item.quantidade
                }
            )
        }
        return listBuyProd;
    }

    async create(buyProduct, callback) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[compras_produtos]';

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
                    bulkLoad.addColumn('id_produto', TYPES.Int, { nullable: true });
                    bulkLoad.addColumn('id_compra', TYPES.Int, { nullable: true });
                    bulkLoad.addColumn('valor_bruto', TYPES.Money, { nullable: true });
                    bulkLoad.addColumn('valor_liquido', TYPES.Money, { nullable: true });
                    bulkLoad.addColumn('preço_custo', TYPES.Money, { nullable: true });
                    bulkLoad.addColumn('quantidade', TYPES.Int, { nullable: true });

                    // execute
                    msdb.execBulkLoad(bulkLoad, buyProduct);
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
                    const sql = 'SELECT MAX(id) as id from dbo.compras_produtos';

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