import mongoose, { Schema, trusted } from "mongoose";
import Product from "./ProductList.js";
import { ObjectId } from "mongoose";
const OrderSchema = new mongoose.Schema({

    product_key:{
        type:Number,
        ref:'Product',
        required:true
    },
    status:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    }
})
const Order = mongoose.model("Order",OrderSchema)
export default Order