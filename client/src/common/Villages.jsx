import {useState, useEffect} from 'react'
import axios from 'axios'
function Villages() {
    let [villages,setvillages]=useState([])
    let [error,seterror]=useState([])
    async function handlevillages() {
        let res= await axios.get('http://localhost:9125/village-api/village')
        if(res.data.message==='Villages'){
          setvillages( res.data.payload)
          seterror('')
        }
        else
          seterror(res.data.message)
      }
    
      
      useEffect(()=>{
        handlevillages()
      },[])

      console.log(villages)

  return (
    <div>
      {
        villages.map((i)=>(
          <div className='card' key={i.email}>
            <div className="card-body">
              <p>{i.name}</p>
              <p>{i.email}</p>
          </div>
      </div>
        ))
      }
      
    </div>
  )
}

export default Villages
