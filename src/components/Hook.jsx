import { useState } from "react";

function Hook(){
    const [name, setName] = useState("bacth05");
    function  handleClick() {
        setName("batch05")
    }
        
   
    return(
        <>
        <h1>hooks</h1>
        <h1>{name}</h1>
        <button onClick={handleClick}> Click </button>
        </>
    );

}
export default Hook;