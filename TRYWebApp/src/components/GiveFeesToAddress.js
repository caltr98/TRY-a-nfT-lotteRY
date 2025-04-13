import React from 'react'
import { useState } from 'react'

const GiveFeesToAddress = ({ onAdd }) => {


    const [addressPayTo, setAddressPayTo]= useState('');

    const onSubmit = (e) =>{
        e.preventDefault();

        if(!addressPayTo){
            alert ('Type Account address');
            return;
        }

        onAdd({addressPayTo});
    }

return (
  <form onSubmit={onSubmit} className = 'borderToDiv'>
  <div className='form-control'>
    <label>Custom account to send fees</label>
    <input
      type='text'
      placeholder='Type account  to send collected fees'
      value={addressPayTo}
      onChange={(e) => setAddressPayTo(e.target.value)}
    />
  </div>
  <input id='submitAddr' type='submit' value='Enter Account address' className='btn btn-inline' />
  </form>

)
}


export default GiveFeesToAddress
