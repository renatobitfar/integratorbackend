var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const database = require('../infra/database');
const msdbCon = require('../infra/azureDb');
const { QueryTypes } = require('sequelize');

module.exports = class PersonController {

    async getPerson() {
        var listPerson = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT u.usuario_id AS id,
            u.nome AS nome,
            gu.descricao AS cargo,
            u.dt_admissao AS data_adminissao,
            u.dt_demissao AS data_demissao,
            u.apagado AS status,
            u.filial_id AS id_loja
            FROM usuario u
            LEFT JOIN grupo_usuario gu
            ON u.grupo_usuario_id = gu.grupo_usuario_id 
            WHERE u.usuario_id > ${lastId};`
        const list = await database.query(query, { type: QueryTypes.SELECT });
        for (const item of list) {
            var tmpstatus = item.status == 'S' ? 0 : 1;
            listPerson.push(
                {
                    id: item.id,
                    nome: item.nome,
                    cargo: item.cargo,
                    data_adminissao: item.data_adminissao,
                    data_demissao: item.data_demissao,
                    status: tmpstatus,
                    id_loja: item.id_loja || 2
                }
            )
        }
        return listPerson;
    }

    async create(person, callback) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[pessoas]';

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
                    bulkLoad.addColumn('nome', TYPES.NVarChar, { length: 150, nullable: false });
                    bulkLoad.addColumn('cargo', TYPES.NVarChar, { length: 50, nullable: false });
                    bulkLoad.addColumn('data_adminissao', TYPES.Date, { nullable: true });
                    bulkLoad.addColumn('data_demissao', TYPES.Date, { nullable: true });
                    bulkLoad.addColumn('status', TYPES.Bit, { nullable: false });
                    bulkLoad.addColumn('id_loja', TYPES.Int, { nullable: false });

                    // execute
                    msdb.execBulkLoad(bulkLoad, person);
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
                    const sql = 'SELECT MAX(id) as id from dbo.pessoas';

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