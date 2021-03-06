const { Order } = require('../models/order');
const express = require('express');
const { OrderItems } = require('../models/orderItem');
const router = express.Router();

// get all Order
router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrder': -1});

    if(!orderList) {
        res.status(500).json({
            success: false
        });
    }
    res.status(200).send(orderList);
})

// get Order by id
router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}
    }); // Hiển thị product nầm trong mảng orderItem

    if(!order) {
        res.status(500).json({
            success: false
        });
    }
    res.status(200).send(order);
})

// create Order
router.post(`/`, async (req, res) => {

    const orderItemsId = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItems({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))

    // Cần phải chờ promise bên trên hoàn thành việc lưu orderItems
    const orderItemIdResolved = await orderItemsId;

    // total Price
    const totalPrices = await Promise.all(orderItemIdResolved.map(async orderItemId => {
        const orderItem = await OrderItems.findById(orderItemId).populate('product', 'price');
        const total = orderItem.product.price * orderItem.quantity;
        return total;
    }))

    const totalPrice = totalPrices.reduce((a,b) => a+b, 0);

    let order = new Order({
        orderItems: orderItemIdResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })

    order = await order.save();

    if(!order)
    return res.status(404).send('Cannot create');

    res.send(order);
})

//update order
router.put('/:id', async (req, res) => {

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
    )

    if(!order) 
    return res.status(400).send('Update failed');

    res.send(order);
})


//delete order
router.delete('/:id',(req, res) => {

    Order.findByIdAndRemove(req.params.id).then(async order => {
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItems.findByIdAndRemove(orderItem);
            })

            return res.status(200).json({ success: true, message: 'Order delete' })
        } else {
            return res.status(404).json({ success: false, message: 'Order is not find'})
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

//sale order
router.get('/get/totalsales', async(req, res) => {
    const totalSale = await Order.aggregate([
        { $group: {_id: null, totalsales: { $sum: '$totalPrice' }}}
    ])

    if(!totalSale) {
        return res.status(400).send('total sale is not generated');
    }

    res.send({
        totalSale: totalSale.pop().totalsales
    })
})

// get total order
router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments((count) => count)

    if(!orderCount)
    return res.status(400).send('Cannot find');

    res.send({
        count: orderCount
    });
})

// get all Order
router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({user: req.params.userid})
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'}
    }).sort({'dateOrder': -1});

    if(!userOrderList) {
        res.status(500).json({
            success: false
        });
    }
    res.status(200).send(userOrderList);
})

module.exports = router;