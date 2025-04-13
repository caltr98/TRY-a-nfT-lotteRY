import React from 'react'
import { useState } from 'react'
import cat from "./question-mark-cat-sticker-vinyl-decal.jpg"
const KittyMint = ({ onAdd }) => {
  const [kittyClass, setKittyClass] = useState()

  const onSubmit = (e) => {
    e.preventDefault()

    if (!kittyClass) {
      alert('Please select a class for kitty')
      return
    }
    if(kittyClass>8 || kittyClass<1){
        alert("Please insert a kitty class in the range 1 to 8")
    }
    onAdd(kittyClass)

  }

  return (
      <form className='add-formBeta' onSubmit={onSubmit}>
        <div className='form-control'>
          <img src={cat} width={200} height={200} alt="Kitty Description "></img>        
          <label>Set new Kitty class</label>

          <input
            type='number'
            placeholder='Kitty class [1-8]'
            value={kittyClass}
            min="1"
            max="8"
  
            onChange={(e) => setKittyClass(e.target.value)}
          />
        </div>
        <input type='submit' value='Mint new Kitty!!!' className='btn btn-connectAccount' />
      </form>
  )
}

export default KittyMint
