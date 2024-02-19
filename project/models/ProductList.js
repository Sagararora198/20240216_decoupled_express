import mongoose from "mongoose";

const ProductListSchema = new mongoose.Schema({
    _id:{
        type:Number,
        required:true
    },
    product_name:{
        type:String,
        required:true
    },
    product_desc:{
        type:String,
        required:true
    },
    product_price:{
        type:Number,
        required:true
    },
    product_stocks:{
        type:Number,
        required:true,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value for product stock.'
        }
    },
    product_img:{
        type:String,
        required:true
    }
})
const Product = mongoose.model("Product",ProductListSchema)
export default Product