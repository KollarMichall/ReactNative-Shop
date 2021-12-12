const express = require('express')
const { Category } = require('../models/category')
const { Product } = require('../models/product')
const router = express.Router()
const mongoose = require('mongoose')


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

router.post('/', async (req, res) => {
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')

    const product = new Product({
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
        isFeatured: req.body.isFeatured,

    })
   await product.save()

   if (!product) {
    return res.status(500).send('the product cannot be created!')
} res.send(product)
})

router.put('/:id', async (req, res) =>{
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')

   const product = await Product.findByIdAndUpdate(req.params.id, {
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
    isFeatured: req.body.isFeatured,

}, {new: true})
   if (!product) {
    return res.status(500).send('the product cannot be updated!')
} res.send(product)
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
module.exports = router