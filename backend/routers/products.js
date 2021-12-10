const express = require('express')
const { Category } = require('../models/category')
const { Product } = require('../models/product')
const router = express.Router()


router.get('/', async (req, res) => {
    const products = await Product.find()
    if(!products){
        res.status(50).json({success: false})
    }
    res.send(products)
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
module.exports = router