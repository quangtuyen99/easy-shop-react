const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

// get all Category
router.get(`/`, async (req, res) => {
    const categoryLIst = await Category.find();

    if(!categoryLIst) {
        res.status(500).json({
            success: false
        });
    }
    res.status(200).send(categoryLIst);
})

// get Category by Id
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if(category) {
        return res.status(200).send(category)
    } else {
        return res.status(404).json({ success: false, message: 'Category is not find'})
    }
    
})

// create Category
router.post(`/`, async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    category = await category.save();

    if(!category)
    return res.status(404).send('Cannot create');

    res.send(category);
})

//update Category
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        { new: true }
    )

    if(!category) 
    return res.status(400).send('Update failed');

    res.send(category);
})

// delete Category
router.delete('/:id', async (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category) {
            return res.status(200).json({ success: true, message: 'Category delete' })
        } else {
            return res.status(404).json({ success: false, message: 'Category is not find'})
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

module.exports = router;