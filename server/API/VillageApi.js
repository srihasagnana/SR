const exp = require('express')
const villageApp = exp.Router();
const eah = require('express-async-handler')
const Village = require('../models/VillageSchema')
villageApp.use(exp.json())

// Get all villages
villageApp.get('/village', eah(async (req, res) => {
    const villageList = await Village.find();
    res.status(200).send({ message: "Villages", payload: villageList })
}))

// Get specific village by name
villageApp.get('/village/:name', eah(async (req, res) => {
    const villageName = req.params.name
    const village = await Village.findOne({ name: villageName });
    if (!village) {
        return res.status(404).send({ message: "Village not found" })
    }
    res.status(200).send({ message: "Village details", payload: village })
}))

// get problem-status
villageApp.get('/village/:id/problem-status', eah(async (req, res) => {
    const villageId = req.params.id
    const village = await Village.findById(villageId)

    if (!village) {
        return res.status(404).send({ message: "Village not found" })
    }

    const summary = {
        pending: [],
        ongoing: [],
        upcoming: [],
        past: [],
        all: village.problems.length
    }

    village.problems.forEach(problem => {
        if (problem.status === 'pending') summary.pending.push(problem)
        else if (problem.status === 'ongoing') summary.ongoing.push(problem)
        else if (problem.status === 'upcoming') summary.upcoming.push(problem)
        else if (problem.status === 'past') summary.past.push(problem)
    })

    res.status(200).send({ message: "Problem status summary", payload: summary })
}))

// Create new village
villageApp.post('/village', eah(async (req, res) => {
    const villageData = req.body
    const existingVillage = await Village.findOne({ email: villageData.email })
    if (existingVillage) {
        return res.status(409).send({ message: "Village already exists", payload: villageData })
    }

    const newVillage = new Village(villageData)
    await newVillage.save()
    res.status(201).send({ message: "Village added", payload: newVillage })
}))

// Add problem to village
villageApp.put('/:name/add-problem', eah(async (req, res) => {
    const villageName = req.params.name
    const { title, estimatedamt, description } = req.body
    
    const village = await Village.findOne({name:villageName})
    if (!village) {
        return res.status(404).send({ message: "Village not found" })
    }
    
    const newProblem = {
        title,
        estimatedamt,
        description,
        status: "pending",
        posted_time: new Date()
    }
    
    village.problems.push(newProblem)
    await village.save()
    
    res.status(200).send({ 
        message: "Problem added successfully", 
        payload: village.problems[village.problems.length - 1] 
    })
}))


// Update done_by_trust status to accepted
villageApp.put('/:villageId/problem/:problemId/accept', eah(async (req, res) => {
    const { villageId, problemId } = req.params;

    const village = await Village.findById(villageId);
    if (!village) return res.status(404).send({ message: "Village not found" });

    const problem = village.problems.id(problemId);
    if (!problem) return res.status(404).send({ message: "Problem not found" });

    // Update directly since done_by_trust is a string
    problem.done_by_trust = 'accepted';
    
    await village.save();
    
    res.status(200).send({ 
        message: "Trust status updated to accepted", 
        payload: problem 
    });
}));

// Update done_by_village status to accepted
villageApp.put('/:villagename/problem/:problemId/village-accept', eah(async (req, res) => {
    const villageName = req.params.villagename;

    try {
        const village = await Village.findOne({name:villageName});
        if (!village) return res.status(404).send({ message: "Village not found" });

    const problemId = req.params.problemId;
        const problem = village.problems.id(problemId);
        if (!problem) return res.status(404).send({ message: "Problem not found" });

        // Update village acceptance status
        problem.done_by_village = 'accepted';
        
        // Update status based on trust's acceptance
        if (problem.done_by_trust === 'accepted') {
            problem.status = 'upcoming';
        } else {
            problem.status = 'pending';
        }
        
        await village.save();
        
        // Return the updated problem
        res.status(200).send({ 
            message: "Village acceptance status updated successfully", 
            payload: problem 
        });
    } catch (error) {
        console.error("Error updating village acceptance:", error);
        res.status(500).send({ message: "Internal server error" });
    }
}));

// API to get problems of a village where done_by_trust is "accepted"
villageApp.get('/:villageName/problems/accepted', async (req, res) => {
    const villageName = req.params.villageName;
  
    try {
      // Find the village by name
      const village = await Village.findOne({ name: villageName });
  
      if (!village) {
        return res.status(404).send({ message: 'Village not found' }); // You can adjust this response
      }
  
      // Filter accepted problems
      const acceptedProblems = village.problems.filter(
        (problem) => problem.done_by_trust === 'accepted' && problem.status === 'pending'
      );
  
      if (acceptedProblems.length === 0) {
        return res.status(200).send({ message: 'No accepted problems found', payload: [] }); // Empty array if no accepted problems
      }
  
      res.status(200).send({ message: 'Accepted problems found', payload: acceptedProblems });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Server error' });
    }
  });
  
  
  

// Get top contributors
villageApp.get('/village/:id/top-contributors', eah(async (req, res) => {
    const villageId = req.params.id
    const village = await Village.findById(villageId).lean()

    if (!village) {
        return res.status(404).send({ message: "Village not found" })
    }

    const topTrusts = village.trusts
        .sort((a, b) => b.total_money - a.total_money)
        .slice(0, 3)
        .map((trust, index) => ({
            ...trust,
            rank: index + 1,
            type: 'trust'
        }))

    const topIndividuals = village.user
        .sort((a, b) => (b.total_money || 0) - (a.total_money || 0))
        .slice(0, 3)
        .map((user, index) => ({
            ...user,
            rank: index + 1,
            type: 'individual'
        }))

    res.status(200).send({ 
        message: "Top contributors", 
        payload: [...topTrusts, ...topIndividuals].sort((a, b) => a.rank - b.rank)
    })
}))

// Delete problem
villageApp.delete('/village/:villageId/problem/:problemId', eah(async (req, res) => {
    const { villageId, problemId } = req.params

    const village = await Village.findById(villageId)
    if (!village) {
        return res.status(404).send({ message: "Village not found" })
    }

    const problem = village.problems.id(problemId)
    if (!problem) {
        return res.status(404).send({ message: "Problem not found" })
    }

    problem.remove()
    await village.save()

    res.status(200).send({ message: "Problem removed successfully" })
}))




module.exports = villageApp