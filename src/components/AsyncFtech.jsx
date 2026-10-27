import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function AsyncFtech() {
    const[data,setData] = useState([]);
    const[loading,setLoading] = useState(true);
    const[error,setError]= useState(null);
    useEffect(()=>{
        apiFtech();
    },[]);
    async function apiFtech(){
        try{
            const response = await fetch("https://jsonplaceholder.typicode.com/posts");
            console.log(response);
            

                const rslt = await response.json();
          
                console.log(rslt);
                setData(rslt);
            }
            
            catch(error)  {
                console.log(error);
                setError(error);
            }finally{
              setLoading(false);
            }
    }
        if(loading) {
            return
                <h1>loading</h1>
            }
            if (error){
                return<h1> error :{error.message}</h1>
            }
        
    
  return (
    <>
      {data.map((item) => (
                <div key={item.id}>
                    <h1>• {item.title}</h1>
                    <p>{item.body}</p>
                </div>
            ))}
    </>
  );
}



export default AsyncFtech;

