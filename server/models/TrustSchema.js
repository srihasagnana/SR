const mongoose = require('mongoose');

const TrustSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  approved: { type: Boolean, default: false }, 

  projects: {
    past: [
      {
        title: String,
        description: String,
        completionDate: Date,
        money:Number
      },
    ],
    ongoing: [
      {
        title: String,
        description: String,
        startDate: Date,
        money:Number,
        progressUpdates: [
          {
            date: { type: Date, default: Date.now },
            update: String,
          },
        ],
      },
    ],
    upcoming: [
      {
        title: String,
        description: String,
        money:Number
      },
    ],
  },
  funding: {
    total_received: { type: Number, default: 0 },
    total_disbursed: { type: Number, default: 0 },
  },

  feedback: [
    {
      village_id: { type: mongoose.Schema.Types.ObjectId, ref: "Village" },
      message: String,
      rating: Number,
    },
  ],


  assigned_problems: [
    {
      problem_id: { type: mongoose.Schema.Types.ObjectId },
      village_id: { type: mongoose.Schema.Types.ObjectId, ref: "Village" },
  
      status: {
        type: String,
        enum: ["pending", "upcoming", "ongoing", "past"],
        default: "pending",
      },
  
      posted_time: { type: Date, default: Date.now },
      money_sanction_time: { type: Date },
      solved_time: { type: Date },
  
      money_trust: { type: Number, default: 0 },
    }
  ],

  rating: { type: Number, default: 0 }, 
});

const Trust = mongoose.model("Trust", TrustSchema);
module.exports = Trust;
