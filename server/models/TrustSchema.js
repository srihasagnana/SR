const mongoose = require('mongoose')

const TrustSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  approved: { type: Boolean, default: false }, // Admin approval required

  projects: {
    past: [
      {
        title: String,
        description: String,
        completionDate: Date,
      },
    ],
    ongoing: [
      {
        title: String,
        description: String,
        startDate: Date,
        progressUpdates: [
          {
            date: { type: Date, default: Date.now },
            update: String,
          },
        ],
      },
    ],
    future: [
      {
        title: String,
        description: String,
        plannedStartDate: Date,
      },
    ],
  },

  funding: {
    total_received: { type: Number, default: 0 },
    total_disbursed: { type: Number, default: 0 },
  },

  resources: [String], // Resources Trust has
  money_support_available: { type: Boolean, default: false },

  feedback: [
    {
      village_id: { type: mongoose.Schema.Types.ObjectId, ref: "Village" },
      message: String,
      rating: Number,
    },
  ],

  initiatives: [
    {
      title: String,
      description: String,
      villager_requests: [
        {
          village_id: { type: mongoose.Schema.Types.ObjectId, ref: "Village" },
          request_date: { type: Date, default: Date.now },
          status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        },
      ],
    },
  ],

  assigned_problems: [
    {
      problem_id: { type: mongoose.Schema.Types.ObjectId, ref: "Village.problems" },
      village_id: { type: mongoose.Schema.Types.ObjectId, ref: "Village" },
      status: { type: String, enum: ["in-progress", "solved"], default: "in-progress" },
    },
  ],

  rating: { type: Number, default: 0 }, // Trust rating based on contributions
});

const Trusts = mongoose.model("trust", TrustSchema);
module.exports = Trusts