import React from 'react';
import { useState } from 'react';

const ContractPublish = ({ onAdd }) => {


    const [contractAddress, setAddress] = useState('');

    const onSubmit = (e) =>{
        e.preventDefault();

        if(!contractAddress){
            alert ('Add board contract Address');
            return;
        }
        onAdd({contractAddress});
    }
return (
    <form onSubmit={onSubmit} className = 'borderToDiv'>
      <div className='form-control'>
        <h2>Insert Board Contact Address</h2>
        <h3>To use for publishing the new Lottery contract creation event</h3>
        <input
          type='text'
          placeholder='Type Board Contract Address'
          value={contractAddress}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <input id='submitAddrToPublish' type='submit' value='Enter Board Contract Address' className='btn btn-inline' />
    </form>
  )
}


export default ContractPublish
