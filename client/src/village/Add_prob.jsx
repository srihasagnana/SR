import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useContext } from "react";
import { villageContext } from "../Context/LoginV_Context";
import { useForm } from "react-hook-form";
import axios from "axios";

function Add_prob() {
  const { currentVillage, setCurrentVillage } = useContext(villageContext);
  const [helpers, setHelpers] = useState([{ name: "", amount: "" }]);
  const [submittedProblems, setSubmittedProblems] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  console.log(currentVillage);

  const handleHelperChange = (index, field, value) => {
    const updatedHelpers = [...helpers];
    updatedHelpers[index][field] = value;
    setHelpers(updatedHelpers);
  };

  const addHelper = () => {
    setHelpers([...helpers, { name: "", amount: "" }]);
  };

  const handlesubmit = async (data) => {
    const { title, description, estimatedamt } = data;
    
    const newEntry = {
      shortTitle: title,
      description,
      estimatedAmount: estimatedamt,
      helpers,
    };

    setSubmittedProblems([...submittedProblems, newEntry]);

    // Optionally send to backend
    try {
      const payload = {
        name: currentVillage,
        problem: {
          title,
          description,
          estimatedamt: estimatedamt,
          helpers,
          reported_by: currentVillage.name,
        },
      };
      console.log(payload)
      const res = await axios.put("http://localhost:9125/village-api/add-problem", payload);
      console.log("Updated:", res.data);
    } catch (err) {
      console.error("Update failed:", err);
    }

    // Reset form and helpers
    reset();
    setHelpers([{ name: "", amount: "" }]);
  };

  return (
    <div className="container mt-5">
      <h3 className="text-primary mb-4">Village Problem Reporting Form</h3>
      <form onSubmit={handleSubmit(handlesubmit)} className="shadow p-4 rounded bg-light">
        <div className="mb-3">
          <label className="form-label">Short Title (2–3 words)</label>
          <input
            type="text"
            {...register("title", { required: true })}
            placeholder="e.g. Broken Road"
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Detailed Description</label>
          <textarea
            className="form-control"
            {...register("description", { required: true })}
            rows="3"
            placeholder="Describe the problem in detail..."
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Estimated Amount (₹)</label>
          <input
            type="number"
            {...register("estimatedamt", { required: true })}
            className="form-control"
            placeholder="e.g. 5000"
          />
        </div>


        <button type="submit" className="btn btn-success mt-3">
          Submit Problem
        </button>
      </form>
    </div>
  );
}

export default Add_prob;
