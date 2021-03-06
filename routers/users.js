const express = require('express');
const { User } = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// create user
router.post(`/`, async (req, res) => {


    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        isAdmin: req.body.isAdmin, 
    })

    user = await user.save();

    if(!user)
    return res.status(400).send('Cannot create user');

    res.send(user);

})

// register
router.post('/register', async (req, res) => {


    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        isAdmin: req.body.isAdmin, 
    })

    user = await user.save();

    if(!user)
    return res.status(400).send('Cannot create user');

    res.send(user);

})


// get all users not include pass
router.get(`/`, async (req, res) => {

    const userList = await User.find().select('-passwordHash'); 

    if(!userList) {
        res.status(500).json({
            success: false
        });
    }
    res.send(userList);
})


// get User by Id
router.get('/:id', async (req, res) => {
    const user =  await User.findById(req.params.id).select('-passwordHash');
    if(user) {
        return res.status(200).send(user)
    } else {
        return res.status(404).json({ success: false, message: 'User is not find'})
    }
    
})

//login
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;


    // Check email exists
    if(!user)
    return res.status(400).send('User not found');

    // Check password
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user._id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )


        res.send({ user: user.email, token: token });
    } else {
        return res.status(400).send('Wrong pass');
    }

    
})

// get total user
router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments((count) => count)

    if(!userCount)
    return res.status(400).send('Cannot find');

    res.send({
        count: userCount
    });
})


//delete user
router.delete('/:id',(req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid id user');
    }

    User.findByIdAndRemove(req.params.id).then(user => {
        if(user) {
            return res.status(200).json({ success: true, message: 'User delete' })
        } else {
            return res.status(404).json({ success: false, message: 'User is not find'})
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

module.exports = router;