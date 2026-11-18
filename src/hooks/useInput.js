import { useState } from 'react'

export const useInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue)

  const handleChange = (e) => {
    if (e && e.target !== undefined) {
      setValue(e.target.value)
    } else {
      setValue(e)
    }
  }

  const reset = () => setValue(initialValue)

  return [value, handleChange, setValue, reset]
}

export default useInput
