import React from 'react';
import { useState } from 'react';

const ContractLogin = ({ onAdd }) => {


    const [contractAddress, setAddress] = useState('');

    const onSubmit = (e) =>{
        e.preventDefault();

        if(!contractAddress){
            alert ('Type contract Address');
            return;
        }

        onAdd({contractAddress});
        setAddress('');
    }

return (
  <form onSubmit={onSubmit} className = 'borderToDiv'>
  <div className='form-control'>
    <label>Contact Address</label>
    <input
      type='text'
      placeholder='Type Contract Address'
      value={contractAddress}
      onChange={(e) => setAddress(e.target.value)}
    />
  </div>
  <input id='submitAddr' type='submit' value='Enter Contract Address' className='btn btn-inline' />
  </form>

)
}


export default ContractLogin
