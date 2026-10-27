 import React from 'react';

 function List() {
    const cars = [
        {id: 1, brand: "Ford", price:2345678},
         {id: 2, brand: "BMW", price:6543210},
          {id: 3, brand: "BMW", price:998650},
           {id: 4, brand: "Ferrari", price:6698060},
           
    ];
    const newArray = cars.filter((ca)=> ca.brand ==="BMW");
   console.log(newArray);
   
    
     return (
        <>
<h1>
    REACT LIST
</h1>
<ul>{newArray.map((cars)=>(
    < li key =
      {cars.id}> {cars.brand}</li>
))}</ul>
        </>
          );
  }

export default List;