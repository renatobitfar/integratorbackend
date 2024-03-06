var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
const msdb = require('../infra/azureDb');

module.exports = class PersonController {

    async getPerson() {
        return [
            {
                id: 1,
                nome: 'Pessoa 1',
                cargo:'Cargo 1',
                data_adminissao: '2024-01-01',
                data_demissao: '2024-02-01',
                status: 0,
                id_loja: 1
            },
            {
                id: 2,
                nome: 'Pessoa 2',
                cargo:'Cargo 2',
                data_adminissao: '2024-01-01',
                data_demissao: null,
                status: 1,
                id_loja: 2
            }
        ]
    }

    async create(person, callback) {
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
                    bulkLoad.addColumn('nome', TYPES.NVarChar, {length:150, nullable: false });
                    bulkLoad.addColumn('cargo', TYPES.NVarChar, {length:50, nullable: false });
                    bulkLoad.addColumn('data_adminissao', TYPES.Date, {nullable: true });
                    bulkLoad.addColumn('data_demissao', TYPES.Date, {nullable: true });
                    bulkLoad.addColumn('status', TYPES.Bit, {nullable: false });
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
}