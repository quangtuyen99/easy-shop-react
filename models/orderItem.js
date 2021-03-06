const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    product: { // Liên kết với id product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});


exports.OrderItems = mongoose.model('OrderItems', orderItemSchema);