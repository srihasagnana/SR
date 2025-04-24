import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { villageContext } from "../Context/LoginV_Context";
import "./Village_profile.css";

const VillageProfile = () => {
  const { currentVillage } = useContext(villageContext);
  const [villageDetails, setVillageDetails] = useState(null);
  const [topTrusts, setTopTrusts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [mapLoading, setMapLoading] = useState(false);
  const [trustsLoading, setTrustsLoading] = useState(false);
  const [trustsError, setTrustsError] = useState(null);
  const MAPS_API_KEY = "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ12345678"; // Replace with your actual key
  const [topIndividuals, setTopIndividuals] = useState([]);
  const [individualsLoading, setIndividualsLoading] = useState(false);
  const [individualsError, setIndividualsError] = useState(null);
const [projects, setProjects] = useState({
  past: [],
  ongoing: [],
  upcoming: [],
  pending:[]
});
const projectCounts = {
  past: projects.past.length,
  ongoing: projects.ongoing.length,
  upcoming: projects.upcoming.length,
  pending: projects.pending.length
};
  const [showModal, setShowModal] = useState(false);
const [modalProjects, setModalProjects] = useState([]);
const [modalTitle, setModalTitle] = useState("");

const handleProjectClick = (projectType) => {
  setModalTitle(`${projectType} Projects`);
  setModalProjects(projects[projectType]);
  setShowModal(true);
};

  // Get village ID with localStorage fallback
  const villageId = currentVillage || localStorage.getItem("villageId");

  // Fetch village details
  const getVillage = async () => {
    if (!villageId) {
      setError("No village selected");
      return;
    }
  
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:9125/village-api/village/${villageId}`);
      if (res.data.payload && res.data.payload.length > 0) {
        const villageData = res.data.payload[0];
        setVillageDetails(villageData);
        setProjects(calculateProjects(villageData.problems));
        localStorage.setItem("villageData", JSON.stringify(villageData));
      } else {
        throw new Error("No village data found");
      }
    } catch (err) {
      setError(err.message);
      const cachedData = localStorage.getItem("villageData");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setVillageDetails(parsedData);
        setProjects(calculateProjects(parsedData.problems));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch top trusts by money contribution
  const fetchTopTrusts = async () => {
    if (!villageId) {
      setTopTrusts([]);
      return;
    }

    try {
      setTrustsLoading(true);
      setTrustsError(null);
      
      const response = await axios.get(
        `http://localhost:9125/village-api/village/${villageId}`
      );

      const villageData = response.data.payload?.[0] || JSON.parse(localStorage.getItem("villageData"));
      const trusts = villageData?.trusts || [];
      
      // Sort by total_money and take top 3
      const sortedTrusts = [...trusts].sort((a, b) => (b.total_money || 0) - (a.total_money || 0));
      const top3 = sortedTrusts.slice(0, 3).map((trust, index) => ({
        id: trust._id || index,
        name: trust.trust_name || "Anonymous Trust",
        amount: trust.total_money || 0,
        rank: index + 1,
        projects: Math.floor((trust.total_money || 0) / 10000) || 1
      }));

      setTopTrusts(top3);
      localStorage.setItem("topTrusts", JSON.stringify(top3)); // Cache results
    } catch (err) {
      console.error("Error fetching trusts:", err);
      setTrustsError("Failed to load top contributors");
      // Load from cache if available
      const cachedTrusts = localStorage.getItem("topTrusts");
      if (cachedTrusts) {
        setTopTrusts(JSON.parse(cachedTrusts));
      } else {
        setTopTrusts([]);
      }
    } finally {
      setTrustsLoading(false);
    }
  };

  // Get village map image
  const getVillageImage = async () => {
    if (!villageDetails) return;

    setMapLoading(true);
    const villageName = villageDetails.name || "Tangeda";
    const state = villageDetails.state || "Andhra Pradesh";
    const pincode = villageDetails.pincode || "522414";

    try {
      // Try to get coordinates first
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          `${villageName}, ${pincode}, ${state}, India`
        )}&key=${MAPS_API_KEY}`
      );

      if (geocodeResponse.data.results?.length > 0) {
        const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=600x400&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${MAPS_API_KEY}`;
        setImageUrl(staticMapUrl);
        localStorage.setItem("villageMap", staticMapUrl);
      } else {
        throw new Error("Geocoding failed");
      }
    } catch (error) {
      console.error("Map error:", error);
      // Fallback to cached map or SVG
      const cachedMap = localStorage.getItem("villageMap");
      if (cachedMap) {
        setImageUrl(cachedMap);
      } else {
        setImageUrl(
          `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23f0f0f0' width='600' height='400'/%3E%3Ctext fill='%23000' font-family='Arial' font-size='24' font-weight='bold' text-anchor='middle' x='300' y='200'%3E${encodeURIComponent(
            villageName
          )}%3C/text%3E%3Ctext fill='%23666' font-family='Arial' font-size='18' text-anchor='middle' x='300' y='230'%3E${encodeURIComponent(
            state
          )}, ${pincode}%3C/text%3E%3C/svg%3E`
        );
      }
    } finally {
      setMapLoading(false);
    }
  };

  // Open Google Maps
  const openGoogleMaps = () => {
    if (!villageDetails) return;
    
    const villageName = villageDetails.name || "Tangeda";
    const state = villageDetails.state || "Andhra Pradesh";
    const pincode = villageDetails.pincode || "522414";
    
    const coordMatch = imageUrl.match(/center=([\d.-]+),([\d.-]+)/);
    if (coordMatch) {
      window.open(`https://www.google.com/maps/@${coordMatch[1]},${coordMatch[2]},14z`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${villageName}, ${pincode}, ${state}`)}`, '_blank');
    }
  };

  // Fetch top individuals by money contribution
const fetchTopIndividuals = async () => {
  if (!villageId) {
    setTopIndividuals([]);
    return;
  }

  try {
    setIndividualsLoading(true);
    setIndividualsError(null);
    
    const response = await axios.get(
      `http://localhost:9125/village-api/village/${villageId}`
    );

    const villageData = response.data.payload?.[0] || JSON.parse(localStorage.getItem("villageData"));
    const individuals = villageData?.user || [];
    
    // Sort by total_money and take top 3
    const sortedIndividuals = [...individuals].sort((a, b) => (b.total_money || 0) - (a.total_money || 0));
    const top3 = sortedIndividuals.slice(0, 3).map((individual, index) => ({
      id: individual._id || index,
      name: individual.user_name || "Anonymous Individual",
      amount: individual.total_money || 0,
      rank: index + 1,
      donations: Math.floor((individual.total_money || 0) / 5000) || 1
    }));

    setTopIndividuals(top3);
    localStorage.setItem("topIndividuals", JSON.stringify(top3));
  } catch (err) {
    console.error("Error fetching individuals:", err);
    setIndividualsError("Failed to load top individuals");
    // Load from cache if available
    const cachedIndividuals = localStorage.getItem("topIndividuals");
    if (cachedIndividuals) {
      setTopIndividuals(JSON.parse(cachedIndividuals));
    } else {
      setTopIndividuals([]);
    }
  } finally {
    setIndividualsLoading(false);
  }
};

const calculateProjects = (problems) => {
  if (!problems || !Array.isArray(problems)) {
    return {
      past: [],
      ongoing: [],
      upcoming: [],
      pending:[]
    };
  }

  return {
    past: problems.filter(problem => problem.status === "done"),
    ongoing: problems.filter(problem => problem.status === "ongoing"),
    upcoming: problems.filter(problem => problem.status === "upcoming"),
    pending: problems.filter(problem => problem.status === "pending")
  };
};

  // Initial data load
  useEffect(() => {
    // Load from cache first for instant display
    const cachedData = localStorage.getItem("villageData");
    const cachedTrusts = localStorage.getItem("topTrusts");
    const cachedIndividuals = localStorage.getItem("topIndividuals");
    const cachedMap = localStorage.getItem("villageMap");
  
    if (cachedData) setVillageDetails(JSON.parse(cachedData));
    if (cachedTrusts) setTopTrusts(JSON.parse(cachedTrusts));
    if (cachedIndividuals) setTopIndividuals(JSON.parse(cachedIndividuals));
    if (cachedMap) setImageUrl(cachedMap);
  
    // Then fetch fresh data
    if (villageId) {
      getVillage();
      fetchTopTrusts();
      fetchTopIndividuals(); // Add this line
    }
  }, [villageId]);

  // Get map when village details change
  useEffect(() => {
    if (villageDetails) {
      getVillageImage();
    }
  }, [villageDetails]);

  // Loading and error states
  if (!villageId) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">
          No village selected. Please select a village first.
        </div>
      </div>
    );
  }

  if (loading && !villageDetails) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading village data...</p>
      </div>
    );
  }

  

  return (
    <div className="container village-profile-container">
      {/* Loading state for map */}
      {mapLoading && (
        <div className="alert loading-state">
          <div className="spinner-border me-2" role="status"></div>
          Loading map...
        </div>
      )}
{error && (
        <div className="alert error-state">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {villageDetails && (
        <div>
          {/* Row 1 */}
          <div className="row mb-4">
            <div className="col-md-5">
              <div className="card profile-card">
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="me-4">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${villageDetails?.name || "village"} location`}
                        className="img-fluid rounded-circle profile-image"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="img-fluid rounded-circle profile-image bg-secondary d-flex justify-content-center align-items-center text-white"
                        style={{ width: "150px", height: "150px" }}
                      >
                        No Image
                      </div>
                    )}
  
                    </div>
                    <div>
                      <h2 className="village-name">{villageDetails.name}</h2>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <span className="badge profile-badge me-2">
                            <i className="bi bi-envelope profile-icon"></i>
                          </span>
                          {villageDetails.email}
                        </li>
                        <li>
                          <span className="badge profile-badge me-2">
                            <i className="bi bi-telephone profile-icon"></i>
                          </span>
                          {villageDetails.contact}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button
                    className="btn map-button mt-3 w-100 py-2"
                    onClick={openGoogleMaps}
                  >
                    <i className="bi bi-map me-2"></i> Open in Google Maps
                  </button>
                </div>
              </div>
            </div>

            {/* Graph Section */}
            <div className="col-md-7">
              <div className="card stats-card">
                <div className="card-header stats-header">
                  <h3 className="mb-0">
                    <i className="bi bi-bar-chart-line me-2"></i>
                    Village Statistics
                  </h3>
                </div>
                <div className="card-body stats-body d-flex align-items-center justify-content-center">
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-graph-up" style={{ fontSize: "3rem" }}></i>
                    <p className="mt-2">Visualization will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="row">
            {/* Trusts Section */}
            <div className="col-md-5">
              <div className="card contributors-card">
                <div className="card-header contributors-header">
                  <h4 className="mb-0">
                    <i className="bi bi-trophy me-2"></i>
                    Top Contributors
                  </h4>
                </div>
                <div className="card-body">
                <div className="mb-4">
  <h5 className="text-warning">
    <i className="bi bi-currency-rupee me-2"></i>
    Top 3 Contributing Trusts
  </h5>
  {trustsLoading ? (
    <div className="text-center py-3">
      <div className="spinner-border text-warning" role="status"></div>
    </div>
  ) : trustsError ? (
    <div className="alert alert-warning">{trustsError}</div>
  ) : topTrusts.length > 0 ? (
    <div className="list-group">
      {topTrusts.map((trust) => (
        <div key={trust.id} className="list-group-item">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="badge bg-warning me-2">#{trust.rank}</span>
              <strong>{trust.name}</strong>
            </div>
            <div className="text-end">
              <div className="text-success">₹{trust.amount.toLocaleString()}</div>
              <small className="text-muted">{trust.projects} projects</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="alert alert-info">No trust contributions yet</div>
  )}
</div>

<div>
  <h5 className="text-warning">
    <i className="bi bi-person-fill me-2"></i>
    Top 3 Individuals
  </h5>
  {individualsLoading ? (
    <div className="text-center py-3">
      <div className="spinner-border text-warning" role="status"></div>
    </div>
  ) : individualsError ? (
    <div className="alert alert-warning">{individualsError}</div>
  ) : topIndividuals.length > 0 ? (
    <div className="list-group">
      {topIndividuals.map((individual) => (
        <div key={individual.id} className="list-group-item">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <span className="badge bg-warning me-2">#{individual.rank}</span>
              <strong>{individual.name}</strong>
            </div>
            <div className="text-end">
              <div className="text-success">₹{individual.amount.toLocaleString()}</div>
              <small className="text-muted">{individual.donations} donations</small>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="alert alert-info">No individual contributions yet</div>
  )}
</div>
</div>
</div>
</div>

{/* Projects Section */}
<div className="col-md-7">
  <div className="row justify-content-center g-4">
    <div className="col-md-6">
      <div 
        className="card past-projects h-100" 
        onClick={() => handleProjectClick('past')}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-body">
          <h5 className="card-title text-danger">
            <i className="bi bi-check-circle me-2"></i>
            Past Projects
          </h5>
          <p className="project-count text-center text-danger">{projects.past.length}</p>
        </div>
      </div>
    </div>

    <div className="col-md-6">
      <div 
        className="card ongoing-projects h-100" 
        onClick={() => handleProjectClick('ongoing')}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-body">
          <h5 className="card-title text-success">
            <i className="bi bi-arrow-repeat me-2"></i>
            Ongoing Projects
          </h5>
          <p className="project-count text-center text-success">{projects.ongoing.length}</p>
        </div>
      </div>
    </div>

    <div className="col-md-6">
      <div 
        className="card upcoming-projects h-100" 
        onClick={() => handleProjectClick('upcoming')}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-body">
          <h5 className="card-title text-primary">
            <i className="bi bi-calendar-plus me-2"></i>
            Upcoming Projects
          </h5>
          <p className="project-count text-center text-primary">{projects.upcoming.length}</p>
        </div>
      </div>
    </div>

    <div className="col-md-6">
      <div 
        className="card pending-projects h-100" 
        onClick={() => handleProjectClick('pending')}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-body">
          <h5 className="card-title text-warning">
            <i className="bi bi-calendar-plus me-2"></i>
            Pending Projects
          </h5>
          <p className="project-count text-center text-warning">{projects.pending?.length}</p>
        </div>
      </div>
    </div>
  </div>
</div>

</div>
</div>
)}
{showModal && (
  <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{modalTitle}</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          {/* REPLACE THIS SECTION WITH THE PROVIDED CODE */}
          {modalProjects.length > 0 ? (
            <ul className="list-group">
              {modalProjects.map((project, index) => (
                <li key={index} className="list-group-item">
                  <h6>{project?.description || "Untitled Project"}</h6>
                  <div className="mt-2">
                    {project?.reported_by && (
                      <p className="mb-1">
                        <small className="text-muted">
                          <strong>Reported by:</strong> {project?.reported_by}
                        </small>
                      </p>
                    )}
                    {project?.posted_time && (
                      <p className="mb-1">
                        <small className="text-muted">
                          <strong>Posted:</strong> {new Date(project?.posted_time).toLocaleDateString()}
                        </small>
                      </p>
                    )}
                    {project?.status && (
                      <p className="mb-1">
                        <small className="text-muted">
                          <strong>Status:</strong> {project?.status}
                        </small>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No projects found in this category</p>
          )}
          {/* END OF REPLACEMENT SECTION */}
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
  
};

export default VillageProfile;