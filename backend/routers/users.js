const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})
router.get('/:id', async (req, res) =>{
    const id = req.params.id

    const user = await User.findById(id).select('-passwordHash');

    if(!user) {
        res.status(500).json({ message: 'The user with the given ID was not found! ' })
    } 
    res.status(200).json(user);
})
router.post('/', async (req, res) =>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,

    })
    user = await user.save()

    if (!user) {
        return res.status(400).send('the user cannot be created!')
    } res.send(user)
})

router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email})

    if (!user) {
        return res.status(400).send('The user not found')
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const secret = process.env.secret
        const token = jwt.sign({
            userid: user.id,
            isAdmin: user.isAdmin

        }, secret, {expiresIn: '1d'})
        res.status(200).send({user: user.email, token: token})
        
    }else {
         res.status(400).send('password is wrong')
        
    }
})

router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments(count => count)
    if (!userCount) {
        res.status(500).json({success: false})
    }
    res.send({userCount: userCount})
})

router.delete('/:id', async (req, res) =>{
    const id = req.params.id
   await User.findByIdAndDelete(id)
   res.json({ message: 'user deleted successfully' })
})

module.exports =router;