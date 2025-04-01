const exp=require('express')
const villageApp=exp.Router();
const eah=require('express-async-handler')
const Village = require('../models/VillageSchema')
villageApp.use(exp.json())
villageApp.get('/village',eah(async(req,res)=>{
     const villageList = await Village.find();
     res.status(200).send({message:"Villages",payload:villageList})
}))

villageApp.get('/village/:vi',eah(async(req,res)=>{
    const village=req.params.vi
    const villageList = await Village.find({name:village});
    res.status(200).send({message:"Villages",payload:villageList})
}))

villageApp.post('/village',eah(async(req,res)=>{
    const village = req.body
    const dbres = await Village.findOne({email:village.email})
    if(dbres)
        res.status(409).send({message:"village already existed",payload:village})
    else{
        const villageDoc = Village(village)
        let r=await villageDoc.save()
        res.status(201).send({message:"Village added" ,payload:villageDoc})
    }
}))

villageApp.put('/village',eah(async(req,res)=>{
    const village=req.body;
    let updatedvillage=await Village.findOneAndUpdate({email:village.email},{$set:{...village}},{new:true})
    res.send({message:"updated",payload:updatedvillage})
}))

module.exports=villageApp