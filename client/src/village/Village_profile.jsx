import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { villageContext } from "../Context/LoginV_Context";
import 'bootstrap/dist/css/bootstrap.min.css';


const VillageProfile = () => {
  const { currentVillage } = useContext(villageContext);
  const [villageDetails, setVillageDetails] = useState(null);
  const [topTrusts, setTopTrusts] = useState([]);
  const [topIndividuals, setTopIndividuals] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trustsLoading, setTrustsLoading] = useState(false);
  const [trustsError, setTrustsError] = useState(null);
  const [individualsLoading, setIndividualsLoading] = useState(false);
  const [individualsError, setIndividualsError] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProjects, setModalProjects] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const MAPS_API_KEY = "AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ12345678"; // Replace with your actual key

  const [projects, setProjects] = useState({
    past: [],
    ongoing: [],
    upcoming: [],
    pending: []
  });

  const projectCounts = {
    past: projects.past.length,
    ongoing: projects.ongoing.length,
    upcoming: projects.upcoming.length,
    pending: projects.pending.length
  };

  const villageId = currentVillage || localStorage.getItem("villageId");

  const handleProjectClick = (projectType) => {
    setModalTitle(`${projectType.charAt(0).toUpperCase() + projectType.slice(1)} Projects`);
    setModalProjects(projects[projectType]);
    setShowModal(true);
  };

  const calculateProjects = (problems) => {
    if (!problems || !Array.isArray(problems)) return projects;
    return {
      past: problems.filter(p => p.status === "done"),
      ongoing: problems.filter(p => p.status === "ongoing"),
      upcoming: problems.filter(p => p.status === "upcoming"),
      pending: problems.filter(p => p.status === "pending")
    };
  };

  const getVillage = async () => {
    if (!villageId) {
      setError("No village selected");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:9125/village-api/village/${villageId}`);
      if (res.data.payload && res.data.payload.length > 0) {
        const villageData = res.data.payload;
        setVillageDetails(villageData);
        setProjects(calculateProjects(villageData.problems));
        localStorage.setItem("villageData", JSON.stringify(villageData));
      } else {
        throw new Error("No village data found");
      }
    } catch (err) {
      setError(err.message);
      const cached = localStorage.getItem("villageData");
      if (cached) {
        const data = JSON.parse(cached);
        setVillageDetails(data);
        setProjects(calculateProjects(data.problems));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTopTrusts = async () => {
    if (!villageId) return setTopTrusts([]);

    try {
      setTrustsLoading(true);
      const res = await axios.get(`http://localhost:9125/village-api/village/${villageId}`);
      const data = res.data.payload || JSON.parse(localStorage.getItem("villageData"));
      const trusts = data?.trusts || [];
      const top3 = [...trusts]
        .sort((a, b) => (b.total_money || 0) - (a.total_money || 0))
        .slice(0, 3)
        .map((t, i) => ({
          id: t._id || i,
          name: t.trust_name || "Anonymous Trust",
          amount: t.total_money || 0,
          rank: i + 1,
          projects: Math.floor((t.total_money || 0) / 10000) || 1
        }));

      setTopTrusts(top3);
      localStorage.setItem("topTrusts", JSON.stringify(top3));
    } catch (err) {
      setTrustsError("Failed to load top contributors");
      const cache = localStorage.getItem("topTrusts");
      if (cache) setTopTrusts(JSON.parse(cache));
    } finally {
      setTrustsLoading(false);
    }
  };

  const fetchTopIndividuals = async () => {
    if (!villageId) return setTopIndividuals([]);

    try {
      setIndividualsLoading(true);
      const res = await axios.get(`http://localhost:9125/village-api/village/${villageId}`);
      const data = res.data.payload || JSON.parse(localStorage.getItem("villageData"));
      const individuals = data?.user || [];

      const top3 = [...individuals]
        .sort((a, b) => (b.total_money || 0) - (a.total_money || 0))
        .slice(0, 3)
        .map((u, i) => ({
          id: u._id || i,
          name: u.user_name || "Anonymous Individual",
          amount: u.total_money || 0,
          rank: i + 1,
          donations: Math.floor((u.total_money || 0) / 5000) || 1
        }));

      setTopIndividuals(top3);
      localStorage.setItem("topIndividuals", JSON.stringify(top3));
    } catch (err) {
      setIndividualsError("Failed to load top individuals");
      const cache = localStorage.getItem("topIndividuals");
      if (cache) setTopIndividuals(JSON.parse(cache));
    } finally {
      setIndividualsLoading(false);
    }
  };

  const getVillageImage = async () => {
    if (!villageDetails) return;

    const villageName = villageDetails.name || "Tangeda";
    const state = villageDetails.state || "Andhra Pradesh";
    const pincode = villageDetails.pincode || "522414";

    setMapLoading(true);

    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          `${villageName}, ${pincode}, ${state}, India`
        )}&key=${MAPS_API_KEY}`
      );

      if (res.data.results?.length > 0) {
        const { lat, lng } = res.data.results[0].geometry.location;
        const staticUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=600x400&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${MAPS_API_KEY}`;
        setImageUrl(staticUrl);
        localStorage.setItem("villageMap", staticUrl);
      } else throw new Error("Geocoding failed");
    } catch (error) {
      const fallback = localStorage.getItem("villageMap");
      if (fallback) setImageUrl(fallback);
      else {
        setImageUrl(
          `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23eee' width='600' height='400'/%3E%3Ctext x='50%' y='50%' font-size='24' text-anchor='middle' fill='black'%3E${encodeURIComponent(
            villageName
          )}%3C/text%3E%3C/svg%3E`
        );
      }
    } finally {
      setMapLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (!villageDetails) return;
    const villageName = villageDetails.name || "Tangeda";
    const state = villageDetails.state || "Andhra Pradesh";
    const pincode = villageDetails.pincode || "522414";

    const coordMatch = imageUrl.match(/center=([\d.-]+),([\d.-]+)/);
    if (coordMatch) {
      window.open(`https://www.google.com/maps/@${coordMatch[1]},${coordMatch[2]},14z`, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${villageName}, ${pincode}, ${state}`)}`, "_blank");
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("villageData");
    const cachedTrusts = localStorage.getItem("topTrusts");
    const cachedIndividuals = localStorage.getItem("topIndividuals");
    const cachedMap = localStorage.getItem("villageMap");

    if (cached) setVillageDetails(JSON.parse(cached));
    if (cachedTrusts) setTopTrusts(JSON.parse(cachedTrusts));
    if (cachedIndividuals) setTopIndividuals(JSON.parse(cachedIndividuals));
    if (cachedMap) setImageUrl(cachedMap);

    if (villageId) {
      getVillage();
      fetchTopTrusts();
      fetchTopIndividuals();
    }
  }, [villageId]);

  useEffect(() => {
    if (villageDetails) getVillageImage();
  }, [villageDetails]);

  if (!villageId) {
    return <div className="alert alert-danger text-center py-4">No village selected</div>;
  }

  if (loading && !villageDetails) {
    return <div className="text-center py-4"><div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div></div>;
  }

  return (
    <div className="container my-4">
      <h2 className="text-center mb-3">{villageDetails?.name}, {villageDetails?.state}</h2>

      {mapLoading ? (
        <div className="text-center">Loading Map...</div>
      ) : (
        <img src={imageUrl} alt="Village Map" className="img-fluid rounded" onClick={openGoogleMaps} style={{ cursor: "pointer" }} />
      )}

      <div className="mt-4">
        <h4>Projects</h4>
        {Object.entries(projectCounts).map(([type, count]) => (
          <button key={type} onClick={() => handleProjectClick(type)} className="btn btn-outline-primary m-1">
            {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
          </button>
        ))}
      </div>

      <div className="mt-4">
        <h4>Top Trusts</h4>
        {trustsLoading ? <p>Loading...</p> : topTrusts.map(t => (
          <div key={t.id}>{t.rank}. {t.name} - ₹{t.amount}</div>
        ))}
        {trustsError && <p className="text-danger">{trustsError}</p>}
      </div>

      <div className="mt-4">
        <h4>Top Individuals</h4>
        {individualsLoading ? <p>Loading...</p> : topIndividuals.map(u => (
          <div key={u.id}>{u.rank}. {u.name} - ₹{u.amount}</div>
        ))}
        {individualsError && <p className="text-danger">{individualsError}</p>}
      </div>

      {/* Modal for Projects */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{modalTitle}</h5>
              <button className="close-button" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <ul>
              {modalProjects.map((project, index) => (
                <li key={index}>{project}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VillageProfile;
