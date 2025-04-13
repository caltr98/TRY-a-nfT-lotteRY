import React from 'react';
import { useState } from 'react';
import { ethers } from "ethers";

const CreateContract = ({ onAdd }) => {
  const [fee, setFee] = useState();
  const [roundDuration, setRoundDuration] = useState();
  const [feeInETH,setFeeInETH] = useState();

  const sum1Eth = () => {
    if(!fee){
      setFee(1000000000000000000n.toString());
      setFeeInETH(ethers.utils.formatEther(BigInt(1000000000000000000n.toString())));
    }
    else{
      setFeeInETH(ethers.utils.formatEther(BigInt(fee)+1000000000000000000n));
      setFee((BigInt(fee)+1000000000000000000n).toString());
    }
  
  }
  const sum1Gwei = () => {
    if(!fee){
      setFee(1000000000n.toString());
      setFeeInETH(ethers.utils.formatEther(BigInt(1000000000n.toString())))

    }
    else{
      setFeeInETH(ethers.utils.formatEther(BigInt(fee)+1000000000n));
      setFee((BigInt(fee)+1000000000n).toString());
    }
  }
  const onSubmit = (e) => {
    e.preventDefault();

    if (!fee) {
      alert('Please add a fee');
      return;
    }
    if (!roundDuration) {
        alert('Please add a fee');
        return;
    }
  
    onAdd(fee,roundDuration );

  }

  return (
    <div className='border'>
      <form className='add-form' onSubmit={onSubmit}>
        <div className='form-control'>
          <label>Set fee</label>
          <div className='FlexBox'>
          <input
            type='text'
            placeholder='fee value (wei)'
            value={fee}
            onChange={(e) => {setFee(e.target.value); setFeeInETH(ethers.utils.formatEther(BigInt(fee)))}}
          />
          <html style ={{color:"#808080"}}>{feeInETH} ETH</html>
          </div>
        </div>
        <div className='form-control'>
          <label>Set round duration</label>
          <input
            type='number'
            placeholder='round duration (blocks)'
            value={roundDuration}
            onChange={(e) => setRoundDuration(e.target.value)}
          />
        </div>
        <div className='samelinecontainer'>
          <input type='submit' value='Create Lottery!!!' className='btn btn-inlineBigger' />
          <button type='button' onClick={sum1Eth} className='btn btn-inline'>Plus 1 ETH fee</button>
          <button type='button' onClick={sum1Gwei} className='btn btn-inline'>Plus 1 gwei fee</button>
        </div>
      </form>
    </div>
  )
}

export default CreateContract
