const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const jwt = require('jsonwebtoken');

const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());


function verifyJwt(req, res, next) {
    const token = req.headers['x-access-token'];
    jwt.verify(token, config.get('app.SECRET.keyAcs'), (err, decoded) => {
        if (err) next(401);
        return next();
    })
}

//Rotas livres de permissão
app.get('/test', function (req, res) {
    res.status(200).send('Test Ok');
});

//Rotas com necessidade de permissão
// app.use('/', verifyJwt, require('./route/userRoute'));

(async () => {

    try {

        // const CategoryController = require('./controller/categoryController');
        // const category = new CategoryController();
        // const newCats = await category.getCategory();
        // if(newCats.length > 0){
        //     await category.create(newCats,function(res){
        //         console.log(res);
        //     });
        // }

        // const ClassificationController = require('./controller/classificationController');
        // const classification = new ClassificationController();
        // const newClass = await classification.getClassifications();
        // if(newClass.length > 0){
        //     await classification.create(newClass,function(res){
        //         console.log(res);
        //     });
        // }

        // const ComitionController = require('./controller/comitionsController');
        // const comition = new ComitionController();
        // const newComition = await comition.getComition();
        // if(newComition.length > 0){
        //     await comition.create(newComition,function(res){
        //         console.log(res);
        //     });
        // }

        // const BuyController = require('./controller/buyController');
        // const buy = new BuyController();
        // const newbuy = await buy.getBuy();
        // if(newbuy.length > 0 ){
        //     await buy.create(newbuy,function(res){
        //         console.log(res);
        //     });
        // }

        // const ManufacturerController = require('./controller/manufacturerController');
        // const manuf = new ManufacturerController();
        // const newManuf = await manuf.getManufacturer();
        // if (newManuf.length> 0){
        //     await manuf.create(newManuf,function(res){
        //         console.log(res);
        //     });
        // }

        // const ProductController = require('./controller/productController');
        // const product = new ProductController();
        // const newProduct = await product.getProduct();
        // if (newProduct.length > 0) {
        //     await product.create(newProduct, function (res) {
        //         console.log(res);
        //     });
        // }

        // const BuyProductController = require('./controller/buyProductController');
        // const buyProduct = new BuyProductController();
        // const newBuyProduct = await buyProduct.getBuyProduct();
        // if(newBuyProduct.length > 0){
        //     await buyProduct.create(newBuyProduct,function(res){
        //         console.log(res);
        //     });
        // }

        // const StoreController = require('./controller/storeController');
        // const store = new StoreController();
        // const newStore = await store.getStore();
        // if(newStore.length > 0){
        //     await store.create(newStore,function(res){
        //         console.log(res);
        //     });
        // }

        // const StockController = require('./controller/stockController');
        // const stock = new StockController();
        // const newStock = await stock.getStock();
        // if(newStock.length > 0){
        //     await stock.create(newStock,function(res){
        //         console.log(res);
        //     });
        // }

        // const BranchController = require('./controller/branchController');
        // const branch = new BranchController();
        // const newBranch = await branch.getBranch();
        // if(newBranch.length > 0 ){
        //     await branch.create(newBranch,function(res){
        //         console.log(res);
        //     });
        // }

        // const PersonController = require('./controller/personController');
        // const person = new PersonController();
        // const newPerson = await person.getPerson();
        // if(newPerson.length > 0 ){
        //     await person.create(newPerson,function(res){
        //         console.log(res);
        //     });
        // }

        // const GoalController = require('./controller/goalController');
        // const goal = new GoalController();
        // const newGoal = await goal.getGoal();
        // await goal.create(newGoal,function(res){
        //     console.log(res);
        // });

        // const PriceManufProductController = require('./controller/priceManufProductController');
        // const price = new PriceManufProductController();
        // const newPrice = await price.getPrice();
        // if(newPrice.length > 0){
        //     await price.create(newPrice,function(res){
        //         console.log(res);
        //     });
        // }

        // const SaleController = require('./controller/saleController');
        // const sale = new SaleController();
        // const newSale = await sale.getSale();
        // if(newSale.length > 0){
        //     await sale.create(newSale,function(res){
        //         console.log(res);
        //     });
        // }

        const SaleProductController = require('./controller/saleProductController');
        const saleProduct = new SaleProductController();
        const newSaleProduct = await saleProduct.getSalePorduct();
        if(newSaleProduct.length > 0){
            await saleProduct.create(newSaleProduct,function(res){
                console.log(res);
            });
        }

    }

    catch (error) {
        console.log(error);
    }
})();

app.listen(4200, () => console.log('Server listen 4200'));
