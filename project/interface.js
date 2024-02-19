import mongoose, { Model, modelNames, mongo } from "mongoose"
import Product from "./models/ProductList.js"
import Order from "./models/Order.js";
import 'dotenv/config'
import express from "express"
import { ObjectId } from "mongoose";
/** database Interface will provide the structure of how class should implement 
 * 
 */
const databaseInterface = {
    useDatabase: function () { },
    createTable: function () { },
    createRecord: function () { },
    readRecords: function () { },
    readAllRecords: function () { },
    updateRecord: function () { },
    deleteRecord: function () { }
}
/** Mongodb class where all the function of interface is implemented
 * 
 */
class MongoDBdatabase {
    /** constructor to connect to the database
     */
    constructor() {
        mongoose.connect(process.env.MONGO_URI)
        mongoose.connection.on("connected", () => {
            console.log("connected to mongo");
        })
        mongoose.connection.on('error', (err) => {
            console.log("error connecting", err);
        })

    }

    /** Use database 
     * 
     * @param {String} databaseName name of the database
     */
    async useDatabase(databaseName) {

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

    }

    /** Create a document
     * 
     * @param {Object} data Product data to insert 
     * @param {Number} key key to identify
     * @param {Model} modelName name of model to use
     */
    async createRecord(data, key, modelName) {
        let newRecord
        if (modelName === Product) {
            newRecord = {
                _id: key,
                product_name: data.product_name,
                product_desc: data.product_desc,
                product_price: data.product_price,
                product_stocks: data.product_stocks,
                product_img: data.product_img
            }
        }
        else{
           
            
            newRecord={
                
                product_key:data.product_key,
                status:data.status,
                quantity:data.quantity
            }
        }

        const newProduct = new modelName(newRecord)
        await newProduct.save()
    }
    /**Read particular record from the mongodb
     * 
     * @param {Number} key key to identify the document
     * @param {Model} modelName name of the model
     * @returns {{}} matched record
     */
    async readRecords(key, modelName) {
        if(modelName===Product){
        const data = await modelName.find({ _id: key })
        return data[0]
        }
        else{
            const data = await modelName.findById(key)
            return data
    }
        

    }
    /** Read all documents from mongodb
     * 
     * @param {Model} modelName name of the model 
     * @returns {{}} all record in model
     */
    async readAllRecords(modelName) {
        return modelName.find({})
    }
    /** Read document with name of product
     * 
     * @param {String} searchParam name of the product
     * @param {Model} modelName name of the model
     * @returns matched product data
     */
    async findBySearchValue(searchParam, modelName) {
        return modelName.find({ product_name: searchParam })
    }
    /** Update record in a document
     * 
     * @param {Number} key key to identify the document
     * @param {{}} updateddata data to update 
     * @param {Model} modelName name of the model
     */
    async updateRecord(key, updateddata, modelName) {
        await modelName.findByIdAndUpdate(key, { $set: updateddata })
    }
    /**Delete document
     * 
     * @param {Number} key to identify a document
     * @param {Model} modelName name of the model
     */
    async deleteRecord(key, modelName) {
        await modelName.findByIdAndDelete(key)
    }
    async populateRecord(key, modelName) {

    }



}


export default MongoDBdatabase
// // create a express app
// const app = express()

// //declare the port

// app.get('/', async(req, res) => {
//    const data = await Product.find({})

//     res.json(data)
//   })

// app.listen(process.env.PORT, () => {
//     console.log(`Example app listening on port`)
//   })