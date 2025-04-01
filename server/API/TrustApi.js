const exp=require('express')
const trustApp=exp.Router();
const eah=require('express-async-handler')
const Trust = require('../models/TrustSchema')
trustApp.use(exp.json())
trustApp.get('/trust',eah(async(req,res)=>{
     const trustList = await Trust.find();
     res.send({message:"trust",payload:trustList})
}))

trustApp.post('/trust', eah(async (req, res) => {
    console.log("Incoming Request Body:", req.body); // 🔍 Log request
    const trust = req.body;

    const dbres = await Trust.findOne({ email: trust.email });

    if (dbres) {
        return res.status(409).send({ message: "Trust already existed" });
    }

    const trustDoc = new Trust(trust);
    await trustDoc.save();

    res.status(201).send({ message: "Trust added", payload: trustDoc });
}));



trustApp.put('/trust',eah(async(req,res)=>{
    const trust=req.body;
    let updatedtrust=await Trust.findOneAndUpdate({email:trust.email},{$set:{...trust}},{new:true})
    res.send({message:"updated",payload:updatedtrust})
}))

module.exports=trustApp