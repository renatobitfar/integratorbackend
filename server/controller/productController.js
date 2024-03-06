var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class ProductController {

    async getProduct() {
        return [
            {
                id: 1,
                nome: "Produto 1",
                codean: "1234567890123",
                id_categoria:1,
                id_fabricante:1,
                principio_ativo: "Principio 1",
                ncm: "ncm 1",
                classe_terapeutica: "Classe 1",
                id_classificacao: 1,
                PMC: "PMC 1",
                lista_pis: 0,
                apresentacao: "Apresentação 1"
            },
            {
                id: 2,
                nome: "Produto 2",
                codean: "1234567890321",
                id_categoria:2,
                id_fabricante:2,
                principio_ativo: "Principio 2",
                ncm: "ncm 2",
                classe_terapeutica: "Classe 2",
                id_classificacao: 2,
                PMC: "PMC 2",
                lista_pis: 1,
                apresentacao: "Apresentação 2"
            }
        ]
    }

    async create(product, callback) {
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
                    bulkLoad.addColumn('id_categoria', TYPES.Int, {nullable: false });
                    bulkLoad.addColumn('id_fabricante', TYPES.Int, {nullable: false });
                    bulkLoad.addColumn('principio_ativo', TYPES.NVarChar, { length: 100, nullable: false });
                    bulkLoad.addColumn('ncm', TYPES.NVarChar, { length: 50, nullable: false });
                    bulkLoad.addColumn('classe_terapeutica', TYPES.NVarChar, { length: 50, nullable: false });
                    bulkLoad.addColumn('id_classificacao', TYPES.Int, {nullable: false });
                    bulkLoad.addColumn('PMC', TYPES.NVarChar, { length: 50, nullable: false });
                    bulkLoad.addColumn('lista_pis', TYPES.TinyInt, {nullable: false });
                    bulkLoad.addColumn('apresentacao', TYPES.NText, {nullable: true });
        
                    // execute
                    msdb.execBulkLoad(bulkLoad, product);
                }
            });
        
            msdb.connect();
        } catch (error) {
            console.error(error);
        }
    }
}