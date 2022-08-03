const {User} = require('../models/user');
const express = require('express');
const router =  express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
    const userList = await User.find().select('name phone email');

    if(!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('name phone email');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found'});
    }
    res.status(200).send(user);
})

router.post('/', async (req,res)=>{
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

router.get(`/get/count`, (req, res) =>{
    User.countDocuments()
    .then((data, err)=>{
        if(!err){
            res.send({data: data})
        } else {
            res.status(500).json(err)
        }
    }).catch(function(err){console.log(err)})
})

router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
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

router.post('/login', async (req, res)=>{
    const user = await User.findOne({email: req.body.email})
    const password = req.body.password;

    if(!user) {
        return res.status(400).send('User not found');
    }

    if(user && bcrypt.compareSync(password, user.passwordHash)){
        const secret = process.env.SECRET;
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        )
        return res.status(200).send({user: user.email, token: token})
    } else {
        return res.status(400).send('Incorrect Password')
    }
})

module.exports = router;