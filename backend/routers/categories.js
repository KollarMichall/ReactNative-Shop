const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.json(categoryList);
})

router.get('/:id', async (req, res) =>{
    const id = req.params.id

    const category = await Category.findById(id);

    if(!category) {
        res.status(500).json({ message: 'The category with the given ID was not found! ' })
    } 
    res.status(200).json(category);
})

router.post('/', async (req, res) =>{
    const body = req.body
    let category = new Category(body)
    category = await category.save()

    if (!category) {
        return res.status(400).send('the category cannot be created!')
    } res.send(category)
})

router.put('/:id', async (req, res) =>{
    const id = req.params.id
    const category = req.body
   const updateCategory = await Category.findByIdAndUpdate(id, category, {new: true})
   if (!updateCategory) {
    return res.status(400).send('the category cannot be updated!')
} res.send(updateCategory)
})

router.delete('/:id', async (req, res) =>{
    const id = req.params.id
   await Category.findByIdAndDelete(id)
   res.json({ message: 'category deleted successfully' })
})

module.exports =router;