const mongoose = require('mongoose')

const VillageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // Sarpanch Email
  password: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  approved: { type: Boolean, default: false }, // Admin approval required
  sarpanch: { type: Boolean, default: true }, // Only Sarpanch can register village

  problems: [
    {
      description: { type: String }, // Prevents duplicate problems
      reported_by: { type: String }, // Name of the villager who reported
      status: { type: String, enum: ["pending", "in-progress", "solved"], default: "pending" },
      assigned_trust: { type: mongoose.Schema.Types.ObjectId, ref: "Trust", default: null }, // Only one Trust per problem
      money_trust : {type : Number},
      posted_time :{type : Date},
      money_sanction_time : {type : Date},
      solved_time : {type : Date}
    },
  ],

  feedback: [
    {
      trust_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trust" },
      message: String,
      rating: Number,
    },
  ],

  resources_shared: [
    {
      trust_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trust" },
      resources: [String], // Resources shared by the village
    },
  ],

  money_lent: [
    {
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Trust" },
      amount: Number,
      date: { type: Date, default: Date.now },
    },
  ],

  rating: { type: Number, default: 0 }, // Village rating based on engagement
  trusts:[
    {
      trust_name :{type : String},
      total_money : {type : Number},
    }
  ],
  user:[
    {
      user_name :{type : String},
      total_money : {type : Number},
    }
  ]

});

const Village=mongoose.model("village", VillageSchema);

module.exports = Village