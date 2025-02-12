import React, { useState, useEffect } from 'react'
import Picker from '@emoji-mart/react'

function EmojiPicker({ onEmojiSelect, pickerVisibility, onVisibilityChange }) {
  const [emojiData, setEmojiData] = useState(null)
  const [isPickerVisible, setIsPickerVisible] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('https://cdn.jsdelivr.net/npm/@emoji-mart/data')
      const data = await response.json()
      setEmojiData(data)
    }
    fetchData()
  }, [])

  useEffect(() => {
    setIsPickerVisible(pickerVisibility)
  }, [pickerVisibility])

  const handleClickOutside = () => {
    setIsPickerVisible(false)
    onVisibilityChange(false)
  }

  return (
    isPickerVisible && (
      <div style={{ height: '230px', overflow:'hidden', borderRadius: '0px'}}> 
        <Picker 
          data={emojiData} 
          onEmojiSelect={onEmojiSelect} 
          previewPosition={"none"} 
          dynamicWidth={false}
          theme={"light"}
          onClickOutside={handleClickOutside}
          maxFrequentRows={1}
          emojiButtonSize={24}
          emojiSize={16}
          navPosition={'none'}
          skinTonePosition={'none'}
        />
      </div>
    )
  )
}

export default EmojiPicker
