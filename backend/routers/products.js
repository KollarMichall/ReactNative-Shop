const express = require('express')
const { Category } = require('../models/category')
const { Product } = require('../models/product')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});


const uploadOptions = multer({ storage: storage })

router.get('/', async (req, res) => {
    let filter = {}
    if (req.query.categories) {
        filter = {category: req.query.categories.split(',')}
    }
    const productsList = await Product.find(filter).populate('category')
    if(!productsList){
        res.status(50).json({success: false})
    }
    res.send(productsList)
})
router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category')
    if(!product){
        res.status(50).json({success: false})
    }
    res.send(product)
})

router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')
    
    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    const product = new Product({
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
        isFeatured: req.body.isFeatured,

    })
   await product.save()

   if (!product) {
    return res.status(500).send('the product cannot be created!')
} res.send(product)
})

router.put('/:id', uploadOptions.single('image'), async (req, res) =>{
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

   const updateProduct = await Product.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: imagepath,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,

}, {new: true})
   if (!updateProduct) {
    return res.status(500).send('the product cannot be updated!')
} res.send(updateProduct)
})

router.delete('/:id', async (req, res) =>{
    const id = req.params.id
   await Product.findByIdAndDelete(id)
   res.json({ message: 'product deleted successfully' })
})

router.get('/get/count', async (req, res) => {
    const productCount = await Product.countDocuments(count => count)
    if (!productCount) {
        res.status(500).json({success: false})
    }
    res.send({productCount: productCount})
})
router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0
    const product = await Product.find({isFeatured: true}).limit(+count)
    if (!product) {
        res.status(500).json({success: false})
    }
    res.send(product)
})

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!product)
            return res.status(500).send('the product cannot be updated!');

        res.send(product);
    }
);

module.exports = router