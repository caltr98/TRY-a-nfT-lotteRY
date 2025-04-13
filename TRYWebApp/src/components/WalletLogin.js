import React from 'react'
import { useState } from 'react'

const WalletLogin = ({ onAdd }) => {
    const [walletAddress, setAddress] = useState('')

    const onSubmit = (e) =>{
        e.preventDefault();
        if(!walletAddress){
            alert ('Add Wallet Address');
            return;
        }
        onAdd({walletAddress});
    }
return (
    <form className='insert-address' onSubmit={onSubmit}>
      <div className='form-control'>
        <label>Wallet Address</label>
        <input
          type='text'
          placeholder='Type Wallet Address'
          value={walletAddress}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      <input type='submit' value='Enter Wallet Address' className='btn btn-inline' />
    </form>
  )
}


export default WalletLogin
