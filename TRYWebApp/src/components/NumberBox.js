import React from 'react'
import { useState } from 'react'


const NumberBox = ({onAdd},props) => {

    const [number1,setNumber1] = useState()
    const [number2,setNumber2] = useState()
    const [number3,setNumber3] = useState()
    const [number4,setNumber4] = useState()
    const [number5,setNumber5] = useState()
    const [number6,setNumber6] = useState()

    const onSubmit = (e) =>{
      e.preventDefault();

      if(!number1){
        alert ('Insert number 1');
        return;
      }


      if(number1 <1 || number1 >69){
        alert('Number 1 out of range - Please insert a number between 1-69 ');
        return;
      }

      if(!number2){
        alert ('Insert number 2');
        return;
      }

      if(number2 <1 || number2 >69){
        alert('Number 2 out of range - Please insert a number between 1-69 ')
        return
      }

      if(!number3){
        alert ('Insert number 3');
        return;
      }

      if(number3 <1 || number3 >69){
        alert('Number 3 out of range - Please insert a number between 1-69 ');
        return;
      }


      if(!number4){
        alert ('Insert number 4');
        return;
      }

      if(number4 <1 || number4 >69){
        alert('Number 4 out of range - Please insert a number between 1-69 ');
        return;
    }

      if(!number5){
        alert ('Insert number 5');
        return;
      }

      if(number5 <1 || number5 >69){
        alert('Number 5 out of range - Please insert a number between 1-69 ');
        return;
    }

    if(!number6){
      alert ('Insert number 6');
      return;
    }
    if(number6 <1 || number6 >26){
      alert('Number 6 out of range - Please insert a number between 1-26 ');
      return;
    }
      onAdd (number1,number2,number3,number4,number5,number6);
    }
    const generateRandom = () => {
      setNumber1(Math.floor(Math.random() * 69 + 1));
      setNumber2(Math.floor(Math.random() * 69 + 1));
      setNumber3(Math.floor(Math.random() * 69 + 1));
      setNumber4(Math.floor(Math.random() * 69 + 1));
      setNumber5(Math.floor(Math.random() * 69 + 1));
      setNumber6(Math.floor(Math.random() * 26 + 1));
    }
    
    
  return (
    <div className='Flexbox'>
    <form className='Flexbox' onSubmit={onSubmit}>
        <div className="samelinecontainer" >
        <input
        className='item'
          type="number"
          min="1"
          max="69"
          value={number1}
          placeholder='[1-69]'
          onChange={(e) => setNumber1(e.target.value)}
        /> 
        <input
        className='item'
          type="number"
          min="1"
          max="69"
          value={number2}
          placeholder='[1-69]'
          onChange={(e) => setNumber2(e.target.value)}
        /> 
        <input
        className='item'
        type="number"
        min="1"
        max="69"
        value={number3}

          placeholder='[1-69]'
          onChange={(e) => setNumber3(e.target.value)}
        /> 
        <input
        className='item'
        type="number"
        min="1"
        max="69"
        value={number4}

          placeholder='[1-69]'
          onChange={(e) => setNumber4(e.target.value)}
        /> 
        <input
        className='item'
        type="number"
        min="1"
        max="69"
        value={number5}

          placeholder='[1-69]'
          onChange={(e) => setNumber5(e.target.value)}
        /> 
        <input
        className='item'
        type="number"
        min="1"
        max="69"
        value={number6}

          placeholder='[1-26]'
          onChange={(e) => setNumber6(e.target.value)}
        /> 

  <h3>{props.text}</h3>
  <input type='submit' value='Play lottery' className='btn btn-greenBigger' />
  <button type='button' onClick={generateRandom} className='btn btn-inline'>Generate random numbers</button>

      </div>
    </form>
    </div>

  );
  
  
};

export default NumberBox;
