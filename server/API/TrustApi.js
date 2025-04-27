const exp = require('express');
const trustApp = exp.Router();
const eah = require('express-async-handler');
const Trust = require('../models/TrustSchema');
const Village = require('../models/VillageSchema');

trustApp.use(exp.json());

// Get all trusts
trustApp.get('/trust', eah(async (req, res) => {
  const trustList = await Trust.find();
  res.send({ message: "trust", payload: trustList });
}));

// Get trust by name
trustApp.get('/trust/:tr', eah(async (req, res) => {
  const trust = req.params.tr;
  const trustList = await Trust.find({ name: trust });
  res.status(200).send({ message: "Trust", payload: trustList });
}));

// Register a new trust
trustApp.post('/trust', eah(async (req, res) => {
  const trust = req.body;
  const dbres = await Trust.findOne({ email: trust.email });
  if (dbres) return res.status(409).send({ message: "Trust already existed" });

  const trustDoc = new Trust(trust);
  await trustDoc.save();
  res.status(201).send({ message: "Trust added", payload: trustDoc });
}));

// Update trust info
trustApp.put('/trust', eah(async (req, res) => {
  const trust = req.body;
  const updatedTrust = await Trust.findOneAndUpdate(
    { email: trust.email },
    { $set: { ...trust } },
    { new: true }
  );
  res.send({ message: "updated", payload: updatedTrust });
}));

// ✅ Update a problem's status by trust as accepted
trustApp.put('/trust/accept', eah(async (req, res) => {
  const { villageId, problemId, trustId } = req.body;

  const village = await Village.findById(villageId);
  const trust = await Trust.findById(trustId);

  if (!village) return res.status(404).send({ message: "Village not found" });
  if (!trust) return res.status(404).send({ message: "Trust not found" });

  const problem = village.problems.id(problemId);
  if (!problem) return res.status(404).send({ message: "Problem not found" });

  // 1️⃣ Update done_by_trust
  problem.done_by_trust = "accepted";

  // 2️⃣ Check if both accepted
  if (problem.done_by_village === "accepted" && problem.done_by_trust === "accepted") {
    problem.status = "ongoing"; // 🚀 Work can start
  } else {
    problem.status = "upcoming"; // Waiting for both acceptance
  }

  // 3️⃣ Update trust's assigned problems
  trust.assigned_problems.push({
    problem_id: problem._id,
    village_id: village._id,
    status: "upcoming", // Trust always starts as upcoming
    posted_time: problem.posted_time,
    money_trust: problem.money_trust || 0,
  });

  await village.save();
  await trust.save();

  res.send({ 
    message: "Problem accepted successfully and backend updated! Waiting for village confirmation.",
    payload: problem 
  });
}));




// ✅ Update a problem's status by trust as started
trustApp.put('/trust/start', eah(async (req, res) => {
    const { villageId, problemId } = req.body;
  
    const village = await Village.findById(villageId);
    if (!village) return res.status(404).send({ message: "Village not found" });
  
    const problem = village.problems.id(problemId);
    if (!problem) return res.status(404).send({ message: "Problem not found" });
  
    problem.done_by_trust = "started";
  
    // Optional: auto-move to 'past' if village also completed
    if (problem.done_by_village==="started") {
      problem.status = 'ongoing';
    }
  
    await village.save();
    res.send({ message: "Trust status updated", payload: problem });
  }));
// ✅ Update a problem's status by trust as done
  trustApp.put('/trust/done', eah(async (req, res) => {
    const { villageId, problemId } = req.body;
  
    const village = await Village.findById(villageId);
    if (!village) return res.status(404).send({ message: "Village not found" });
  
    const problem = village.problems.id(problemId);
    if (!problem) return res.status(404).send({ message: "Problem not found" });
  
    problem.done_by_trust = "done";
  
    // Optional: auto-move to 'past' if village also completed
    if (problem.done_by_village==="done") {
      problem.status = 'past';
    }
  
    await village.save();
    res.send({ message: "Trust status updated", payload: problem });
  }));

// ✅ Get problems associated with a trust (via trust name or id)
trustApp.get('/trust/:trustName/problems', eah(async (req, res) => {
  const trustName = req.params.trustName;

  const villages = await Village.find({ 'trusts.name': trustName });

  let trustProblems = [];
  villages.forEach(village => {
    village.problems.forEach(problem => {
      if (problem.trust === trustName) {
        trustProblems.push({ village: village.name, ...problem.toObject() });
      }
    });
  });

  res.send({ message: "Problems for trust", payload: trustProblems });
}));

// ✅ Get trust's problem status summary
trustApp.get('/trust/:trustName/problem-status', eah(async (req, res) => {
  const trustName = req.params.trustName;

  const villages = await Village.find({ 'trusts.name': trustName });
  let allProblems = [];

  villages.forEach(village => {
    village.problems.forEach(problem => {
      if (problem.trust === trustName) {
        allProblems.push(problem);
      }
    });
  });

  const summary = {
    pending: [],
    ongoing: [],
    solved: [],
    past: [],
    future: [],
    all: allProblems.length,
  };

  allProblems.forEach(problem => {
    if (problem.done_by_village && problem.done_by_trust) {
      problem.status = 'past';
    }

    if (problem.status === 'pending') summary.pending.push(problem);
    else if (problem.status === 'in-progress') summary.ongoing.push(problem);
    else if (problem.status === 'solved') summary.solved.push(problem);
    else if (problem.status === 'past') summary.past.push(problem);
    else if (!problem.done_by_village && !problem.done_by_trust && new Date(problem.posted_time) > new Date())
      summary.future.push(problem);
  });

  res.status(200).send({ message: "Trust problem status summary", payload: summary });
}));

module.exports = trustApp;
