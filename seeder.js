// ESM
import faker from 'faker';
import mongoose from "mongoose";

const Schema = mongoose.Schema

const itemSchema = new mongoose.Schema({
        name: { type: String },
        type: { type: String },
        brand: { type: String },
        color: { type: String },
        size: { type: String },
        material: { type: String },
        price: { type: String },
        description: { type: String }
});

export default mongoose.model('Item', itemSchema)

