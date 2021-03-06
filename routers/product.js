const {Product} = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

// File ảnh có thể upload lên
const FILE_TYPE_MAP = {
    'image/png': 'png', // Định dạng MIME type
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}


// upload images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];

        let uploadError = new Error('Invalid extension image'); // Định nghĩa lỗi

        if(isValid) { // Nếu đúng định dạng lỗi = null
            uploadError = null; 
        }

        cb(uploadError, 'public/uploads') // File image
    },
    filename: function (req, file, cb) {
        
        const extension = FILE_TYPE_MAP[file.mimetype];
        const fileName = file.originalname.replace(' ', '-').split(`.${extension}`); // thay ' ' thanh -
        cb(null, `${fileName[0]}-${Date.now()}.${extension}`);
    }
})
   
const uploadOption = multer({ storage: storage })


// get all products
router.get(`/`, async (req, res) => {
    let filter = {};

    if(req.query.categories) {
        filter = {category: req.query.categories.split(',')};
    }

    const productList = await Product.find(filter).populate('category'); 

    if(!productList) {
        res.status(500).json({
            success: false
        });
    }
    res.send(productList);
})

// create product
router.post(`/`, uploadOption.single('image'), async (req, res) => {
    // Kiểm tra id category có tồn tại không
    const category = await Category.findById(req.body.category);
    if(!category)
    return res.status(400).send('Invalid category');

    const file = req.file;
    if(!file)
    return res.status(400).send('No image');

    const fileName = req.file.filename;

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`; // đường dẫn thư mục chứa hình ảnh

    let product = new Product({
        name: req.body.name,
        description: req.body.description,  
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

    product = await product.save();

    if(!product)
    return res.status(400).send('Cannot create product');

    res.send(product);

})

//get product by id
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category'); //Hiển thị chi tiết category thông qua id

    if(!product)
    return res.status(400).send('Cannot find');

    res.send(product);
})

//delete product
router.delete('/:id',(req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid id product');
    }

    Product.findByIdAndRemove(req.params.id).then(product => {
        if(product) {
            return res.status(200).json({ success: true, message: 'Category delete' })
        } else {
            return res.status(404).json({ success: false, message: 'Category is not find'})
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})


//update product
router.put('/:id', async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid id product');
    }

    // Kiểm tra id category có tồn tại không
    const category = await Category.findById(req.body.category);

    if(!category)
    return res.status(400).send('Invalid id');

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    )

    if(!product) 
    return res.status(400).send('Update failed');

    res.send(product);
})


// get total product
router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments((count) => count)

    if(!productCount)
    return res.status(400).send('Cannot find');

    res.send({
        count: productCount
    });
})

// get feature
router.get('/get/feature/:count', async (req, res) => {
    // Tìm các sản phẩm có dặc tính với số lượng cho phép
    const count = req.params.count ? req.params.count : 0;
    const productFeature = await Product.find({ isFeatured: true }).limit(+count);

    if(!productFeature)
    return res.status(400).send('Cannot find');

    res.send(productFeature);
})


// Upload multiple image
router.put(
    '/gallery/:id',
    uploadOption.array('images', 10), 
    async (req, res) => {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid id product');
        }
        
        const files = req.files;
        let imagePaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`; // đường dẫn thư mục chứa hình ảnh

        if(files){
            files.map(file => {
                imagePaths.push(`${basePath}${file.fileName}`); // Đưa từng file vào mảng
            })
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagePaths
            },
            { new: true }
        )

        if(!product) 
        return res.status(400).send('Update failed');

        res.send(product);
    }
)

module.exports = router;