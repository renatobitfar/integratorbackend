var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const database = require('../infra/database');
const msdbCon = require('../infra/azureDb');
const { QueryTypes } = require('sequelize');

module.exports = class StoreController {

    async getStore() {
        // Busca ultimo id 
        var listStore = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT f.filial_id AS id,
            f.nome AS nome,
            f.ender AS endereco,
            f.cidade AS cidade,
            f.UF AS uf,
            f.cgc AS cnpj,
            f.nome_rede AS bandeira,
            '?' AS associacao
            FROM filial f WHERE filial_id > ${lastId};`
        const list = await database.query(query, { type: QueryTypes.SELECT });
        for (const item of list) {
            listStore.push(
                {
                    id: item.id,
                    nome:item.nome || '-',
                    endereco:item.endereco || '-',
                    cidade: item.cidade || '-',
                    uf: item.uf || '-',
                    cnpj: item.cnpj || '-',
                    bandeira: item.bandeira || '-',
                    associacao: item.associacao || '-'
                }
            )
        }
        return listStore;
    }

    async create(store, callback) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[lojas]';
        
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
                    bulkLoad.addColumn('nome', TYPES.NVarChar, {length: 100, nullable: false });
                    bulkLoad.addColumn('endereco', TYPES.NVarChar, {length: 150, nullable: false });
                    bulkLoad.addColumn('cidade', TYPES.NVarChar, {length: 50, nullable: false });
                    bulkLoad.addColumn('uf', TYPES.NVarChar, {length: 50, nullable: false });
                    bulkLoad.addColumn('cnpj', TYPES.NVarChar, {length: 20, nullable: false });
                    bulkLoad.addColumn('bandeira', TYPES.NVarChar, {length: 100, nullable: false });
                    bulkLoad.addColumn('associacao', TYPES.NVarChar, {length: 100, nullable: false });
                    
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, store);
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
                    const sql = 'SELECT MAX(id) as id from dbo.lojas';

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