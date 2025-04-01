import { useEffect, useState, useContext } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import axios from "axios"
import { villageContext } from "../Context/LoginV_Context";

const VillageProfile = () => {
  const {currentVillage}= useContext(villageContext);
  const [tab, setTab] = useState("upcoming"); // Default tab
  let [VillageDetails,setVillageDetails]=useState([])
  async function getVillage(){
    let res = await axios.get(`http://localhost:9125/village-api/village/${currentVillage}`)
    setVillageDetails(res.data.payload[0])
    console.log(VillageDetails,res.data.payload[0])
  }
  useEffect(() => {
    getVillage()
  }, [VillageDetails]);

  return (
    <div>

    </div>
  );
};

export default VillageProfile;
