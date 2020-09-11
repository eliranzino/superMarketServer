
// `mongo mongodb://localhost:27017/supermarket src/mongo.js` in terminal/cmd to import initial data

//use supermarket;

db.users.insertMany([{name: 'eliran', lastName: 'zino', userName: 'eliran@eliran.com', id: '3030166', password: '$2b$10$WlArn4sxnabEdOS6pPSU4O9iMivgnaXXH50HatnKGN7Tt7SlBmTQq', role: 'admin'}]);

db.products.insertMany([
    { productName: "Cheese", productPrice: 25.90, picture: "https://m.pricez.co.il/ProductPictures/7290004122348.jpg", categoryName: "Milk&Eggs" },
    { productName: "Banana", productPrice: 14.90, picture: "https://m.pricez.co.il/ProductPictures/Pricez65907.jpg", categoryName: "Vegetables&Fruits" },
    { productName: "Fish", productPrice: 59.90, picture: "https://www.paskovich.co.il/Warehouse/catalog/items/db01a531-e15b-4800-9e78-d928388e0d9f.jpg", categoryName: "Meat&Fish" },
    { productName: "Wine", productPrice: 29.90, picture: "https://www.goodwines.co.il/images/itempics/180_large.jpg", categoryName: "Wine&Drinks" },
    { productName: "Milk", productPrice: 5.90, picture: "https://m.pricez.co.il/ProductPictures/7290000042442.jpg", categoryName: "Milk&Eggs" },
    { productName: "Apple", productPrice: 10.90, picture: "https://img.mako.co.il/2018/08/29/Working_Hard_Or_Hardly_Working_18_8_i.jpg", categoryName: "Vegetables&Fruits" },
    { productName: "Meat", productPrice: 49.90, picture: "https://konimboimages.s3.amazonaws.com/system/photos/4895969/original/0b165a1ae9dc365791b8aeb4100d8fcd.jpg", categoryName: "Meat&Fish" },
    { productName: "Cola", productPrice: 39.90, picture: "https://storage.googleapis.com/sp-public/product-images/global/10757/903230/large.jpg", categoryName: "Wine&Drinks" },
]);








//find all inventory items that have at least tag 'blank'
// db.inventory.find({tags: 'blank'}); לא משנה הסדר של בלנק במערך

//find all inventory items that have 14 and 21 dimensions no matter the order
//db.inventory.find({dim_cm: {$all: [14,21]}});

//find items that the width is 10
// db.inventory.find({ 'dim_cm.0' : 10});  


//find items that have one dimension between 13 and 15
//db.inventory.find({ dim_cm: {$elemMatch: {$gt:13, $lt:15 }}}); 