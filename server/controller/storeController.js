var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class StoreController {

    async getStore() {
        return [
            {
                id: 1,
                nome:'Farmacia 1',
                endereco:'Rua 1',
                cidade: 'Cidade 1',
                uf: 'MG',
                cnpj: '123.123.0001/01',
                bandeira: 'Bandeira 1',
                associacao: 'Associação 1'
            },
            {
                id: 2,
                nome:'Farmacia 2',
                endereco:'Rua 2',
                cidade: 'Cidade 2',
                uf: 'MG',
                cnpj: '123.123.0001/02',
                bandeira: 'Bandeira 2',
                associacao: 'Associação 2'
            }
        ]
    }

    async create(store, callback) {
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
}