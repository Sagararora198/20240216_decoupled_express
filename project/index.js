/** THe task is to create a backend for a e-commerse website having multiple 
 * API's to update,delete,read and write in database which we have create
 * before using file system
 * @author {Sagar Arora}
 * 
 */


// import the database which we created
// import Database from "./jsonDatabase.js"
import Database from "./interface.js"
import { ObjectId } from "mongoose";
const database = new Database()
/** To create a new Database object(instance)
 * 
 * @returns {Database} Database object
 */
function implementsDatabaseInterface(obj) {
    return (
        typeof obj.createTable === 'function' 
    );
}


// importing uuid for generating unique id's(keys)
import {v4 as uuidv4 } from 'uuid'

// import the express library for http requests
import express from "express"
import Product from "./models/ProductList.js";
import Order from "./models/Order.js";

// create a express app 
const app = express()

//declare the port 
const port = 3000

// middleware to convert body param to json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// for testing the working of server 
app.get('/', (req, res) => {
  res.send('Hello World!')
})




// search for the the product using product name
app.get('/search',async (req,res)=> {
  // get the query params from req
   const productName = req.query.searchText

    // call the database
    await database.useDatabase("e_commerse")
    // use the productList table
    let products = {}
    if(implementsDatabaseInterface(database)){
    await database.createTable("ProductList")
    // read all records from the database
    
    const data = await database.readAllRecords()
    // search for specific product using product name as search parameter
     products = data.find(product=>product.product_name==productName)
    }
    else{
        // find product with parameter
        products = await database.findBySearchValue(productName,Product)
    }
    //send as json if found
    if((Object.keys(products).length)!=0){
    res.json(products)
    }
    else{
      res.send("Product not found")
    }
    
})

app.get('/product/:id',async(req,res)=>{
  // get the parameter
  const id = req.params.id
  // create object

  // use database
  await database.useDatabase("e_commerse")
  // use table orders
  if(implementsDatabaseInterface(database)){
    await database.createTable("ProductList")
  }
  // get the product
  const data = await database.readRecords(id,Product)
  // send the data as json if found
  if(data){

    res.json(data)
  }
  else{
    res.send("Product with key not found")
  }
})

// to buy product from the store
app.put('/checkout',async(req,res)=>{

  // console.log(req.body);
  //get the body params from the request
  const productKey = req.body.id
  const productQuantity = req.body.itemNumber

 
  // use database
  await database.useDatabase("e_commerse")
  // use the product list table
  if(implementsDatabaseInterface(database)){
    await database.createTable("ProductList")
  }
  // get specific record with product key
  const data = await database.readRecords(productKey,Product)
  // if product not found
  if(!data){
    res.send("cannot find the product")
    return
  }
  // if not in stock throw error
  if((data.product_stocks-productQuantity)<0){
    res.send(`only ${data.product_stocks} are available`)
    return
  }
  // update record
  console.log(data);
  const newStock = data.product_stocks-productQuantity
  
  await database.updateRecord(productKey,{"product_stocks":newStock},Product)
  // get the updated record
  const newData = await database.readRecords(productKey,Product)

  // use the order table to update your order
  if(implementsDatabaseInterface(database)){
 
  await database.createTable("Orders")}
  // create a record of your order in the order table
  await database.createRecord({
    product_key:productKey,
    status:"Placed",
    quantity:productQuantity
  },uuidv4(),Order)


  // give the updated record as json
  res.json(newData)

})

// this is for merchant to list their product
app.post('/merchant/product' ,async(req,res)=>{
  // console.log(req.body);
  // get all body params from the req
  const productKey = req.body.productKey
  const productName = req.body.productName
  const productDesc = req.body.productDesc
  const productPrice = req.body.productPrice
  const productImg = req.body.productImg
  const productStocks = req.body.productStocks


  
  // use database
  await database.useDatabase("e_commerse")
  if(implementsDatabaseInterface(database)){
  // use product list talbe

    await database.createTable("ProductList")
  }
  // if record with id already present in database the do not do anything
  const checkData = await database.readRecords(productKey,Product)


  // create record for the merchant on the table
  await database.createRecord({
    product_name:productName,
    product_desc:productDesc,
    product_price:productPrice,
    product_stocks:productStocks,
    product_img:productImg
  },productKey,Product)
  // get the record from the table
  const data = await database.readRecords(productKey,Product)
  // display the record
  res.json(data)
})



// this is for merchant to update their product 
app.put('/merchant/product',async(req,res)=>{
  // get all body params
  const bodyParams = req.body
  const {productKey,...restOfParams} = bodyParams
 
  // use database
  await database.useDatabase("e_commerse")
  // use product list table
  if(implementsDatabaseInterface(database)){
  await database.createTable("ProductList")}
  // update the record
  await database.updateRecord(productKey,restOfParams,Product)
  // get the updated record
  const data = await database.readRecords(productKey,Product)
  //send the updated record as json
  res.json(data)
})

//this is for merchant to delete their product 
app.delete('/merchant/product',async(req,res)=>{
  // get all body params
  const productKey = req.body.productKey
  // create a object of database
 
  // use database
  await database.useDatabase("e_commerse")
  //use table Product list
  if(implementsDatabaseInterface(database)){
  await database.createTable("ProductList")}
  // delete the record
  await database.deleteRecord(productKey,Product)
  // update the merchant with success message
  res.send("deleted successfully")

})


// to cancel a order after checkout
app.put('/order/cancel',async(req,res)=>{
  // console.log(req.body);
  // get all body params
  const orderKey = req.body.orderKey
  //use database
  await database.useDatabase("e_commerse")
  // use table orders
  if(implementsDatabaseInterface(database)){
  await database.createTable("Orders")}
  // read the record with orderkey
  const orderData = await database.readRecords(orderKey,Order)
  // get the product key from the order data

  const product_key = orderData.product_key
  // get the quantity purchased from order table
  const product_quantity = orderData.quantity
  // delete record from order table
  await database.deleteRecord(orderKey,Order)


  await database.useDatabase("e_commerse")
  if(implementsDatabaseInterface(database)){
  await database.createTable("ProductList")}
  const productData = await database.readRecords(product_key,Product)
  console.log(productData);
  const newStocks = productData.product_stocks+product_quantity
  
  await database.updateRecord(product_key,{product_stocks:newStocks},Product)
  res.send("successful")

})

// to get orders list by order id
app.get('/orders',async(req,res)=>{
  // get the query param
  const orderId = req.query.id
  // create object

  // use database
  await database.useDatabase("e_commerse")
  // use table orders
  await database.createTable("Orders")
  // read the record with id
  const data = await database.readRecords(orderId)
  // send the record as json
  res.json(data)
})


// to check status of purchased product
app.get('/status',async(req,res)=>{
  // get query params
  const order_id = req.query.id
  // create object
  
  // use database
  await database.useDatabase("e_commerse")
  // use table orders
  await database.createTable("Orders")
  // read the database
  const data = await database.readRecords(order_id)
  res.send(data.status)
})


// to listen our request on PORT
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})