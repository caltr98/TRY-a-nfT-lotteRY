import React from 'react'
import { useState } from 'react'

const TransferKittyAddress= ({ onAdd, kittyId }) => {

    const [newOwnerAddress, setNewOwnerAddress] = useState('');

    const onSubmit = (e) =>{
        e.preventDefault();
        console.log("kittyID"+  kittyId);
        if(!newOwnerAddress){
            alert ('Add new Owner Address');
            return;
        }

        onAdd({newOwnerAddress},{kittyId});
        setNewOwnerAddress('');
    }

return (
  <form onSubmit={onSubmit} className = 'borderToDiv'>
  <div className='form-control' >
    <label>Kitty Transfer</label>
    <input
      type='text'
      placeholder='Type New Owner Account  Address'
      value={newOwnerAddress}
      onChange={(e) => setNewOwnerAddress(e.target.value)}
    />
  </div>
  <input id='submitAddr' type='submit' value='Transfer Kitty' className='btn btn-transferOwn' />
  </form>
)
}


export default TransferKittyAddress
