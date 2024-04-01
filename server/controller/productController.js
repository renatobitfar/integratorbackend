var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const database = require('../infra/database');
const msdbCon = require('../infra/azureDb');
const { QueryTypes } = require('sequelize');

module.exports = class ProductController {

    async getProduct() {
        var listProd = [];
        const lastId = await this.getLastId().then(response => {
            return response;
        });
        const query = `SELECT p.Produto_id AS id, 
                            p.descricao AS nome , 
                            p.barras AS codean, 
                            p.grupo_id AS id_categoria,
                            p.fabricantes_id AS id_fabricante,
                            pa.descricao AS principio_ativo,
                            p.ncm,
                            COALESCE(ct.descricao,p.classe_t,'-') AS classe_terapeutica,
                            p.espec_id AS id_classificacao,
                            p.pmc AS PMC,
                            p.cstpis AS lista_pis,
                            COALESCE(pap.apresentacao, ap.descricao, '-') AS apresentacao
                        FROM produto p
                        LEFT JOIN principio_ativo pa 
                        ON p.principio_ativo_id = pa.principio_ativo_id
                        LEFT JOIN classe_terapeutica ct 
                        ON p.classe_terapeutica_id = ct.classe_terapeutica_id
                        LEFT JOIN (
                            SELECT pap.produto_apresentacao_id, CONCAT('Substancia: ', pap.substancia ,
                            'Concentração: ', pap.concentracao, 
                            'Qtd. forma farmaceutica: ', pap.qtd_forma_farmaceutica) AS apresentacao
                            FROM produto_apresentacao pap
                        ) pap 
                        ON pap.produto_apresentacao_id = p.produto_apresentacao_id
                        LEFT JOIN apresentacoes ap 
                        ON p.apresentacao_id = ap.apresentacao_id
                        WHERE p.Produto_id > ${lastId};`
        const list = await database.query(query, { type: QueryTypes.SELECT });
        for (const item of list) {
            var tmpNcm = item.ncm || 0;
            var tmpPMC = item.PMC || 0;
            var tmpListaPis = 0;
            if(parseInt(item.lista_pis) > 0) tmpListaPis =1; 
            listProd.push(
                {
                    id: item.id,
                    nome: item.nome || '',
                    codean: item.codean || '',
                    id_categoria: item.id_categoria || 0,
                    id_fabricante: item.id_fabricante || 0,
                    principio_ativo: item.principio_ativo || '-',
                    ncm: tmpNcm.toString(),
                    classe_terapeutica: item.classe_terapeutica || '',
                    id_classificacao: item.id_classificacao || 0,
                    PMC: tmpPMC.toString(),
                    lista_pis: tmpListaPis,
                    apresentacao: item.apresentacao
                }
            )
        }
        return listProd;
    }

    async create(product, callback) {
        var connection = new msdbCon();
        var msdb = connection.getConnection();
        try {
            msdb.on("connect", function (errCon) {
                if (errCon) {
                    console.error(errCon);
                } else {
                    // optional BulkLoad options
                    const options = { keepNulls: true };
                    const table = '[dbo].[produtos]';

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
                    bulkLoad.addColumn('codean', TYPES.NVarChar, { length: 13, nullable: false });
                    bulkLoad.addColumn('id_categoria', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('id_fabricante', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('principio_ativo', TYPES.NVarChar, { length: 100, nullable: false });
                    bulkLoad.addColumn('ncm', TYPES.NVarChar, { length: 50, nullable: false });
                    bulkLoad.addColumn('classe_terapeutica', TYPES.NVarChar, { length: 50, nullable: false });
                    bulkLoad.addColumn('id_classificacao', TYPES.Int, { nullable: false });
                    bulkLoad.addColumn('PMC', TYPES.NVarChar, { length: 50, nullable: false });
                    bulkLoad.addColumn('lista_pis', TYPES.TinyInt, {nullable: false });
                    bulkLoad.addColumn('apresentacao', TYPES.NText, { nullable: true });

                    // execute
                    msdb.execBulkLoad(bulkLoad, product);
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
                    const sql = 'SELECT MAX(id) as id from dbo.produtos';

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