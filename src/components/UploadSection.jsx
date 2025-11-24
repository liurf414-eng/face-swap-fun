import { toast } from 'react-toastify'

function UploadSection({ 
  isDuoInteraction, 
  uploadedImage, 
  uploadedImage2, 
  onImageUpload,
  onDragOver,
  onDrop
}) {
  const processImageFile = async (file, isSecond = false) => {
    // 文件类型验证
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)')
      return
    }
    
    // 文件大小验证 (5MB限制)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return
    }
    
    // 文件名安全检查
    const fileName = file.name.toLowerCase()
    const dangerousPatterns = /[<>:"/\\|?*]/
    if (dangerousPatterns.test(fileName)) {
      toast.error('Invalid file name. Please rename your file.')
      return
    }

    // 直接读取文件
    const reader = new FileReader()
    reader.onload = (e) => {
      onImageUpload(e.target.result, isSecond)
    }
    reader.readAsDataURL(file)
  }
  const handleImageUpload = async (e, isSecond = false) => {
    const file = e.target.files[0]
    if (file) {
      await processImageFile(file, isSecond)
    }
  }

  const handleDropInternal = async (e, isSecond = false) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        await processImageFile(file, isSecond)
      } else {
        toast.error('Please upload an image file')
      }
    }
  }

  const UploadBox = ({ id, label, image, isSecond }) => (
    <div className="preview-card">
      <h3><span className="step-badge">Step 2</span>{image ? label : `Upload ${label}`}</h3>
      <div
        className={`preview-box ${image ? '' : 'upload-preview-box'}`}
        onDragOver={image ? undefined : onDragOver}
        onDrop={image ? undefined : (e) => handleDropInternal(e, isSecond)}
      >
        <input
          type="file"
          id={id}
          accept="image/*"
          onChange={(e) => handleImageUpload(e, isSecond)}
          style={{ display: 'none' }}
        />
        {image ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img 
              src={image} 
              alt={`Uploaded ${label.toLowerCase()} for face swap`}
              title={`${label} - Ready for face swap`}
            />
            <div className="upload-overlay">
              <button 
                className="change-photo-btn-modern"
                onClick={() => document.getElementById(id).click()}
              >
                ✏️ Change Photo
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor={id} className="upload-button-inline">
            📤 Click to Upload<br/>or Drag & Drop
          </label>
        )}
      </div>
    </div>
  )

  if (isDuoInteraction) {
    return (
      <>
        <UploadBox
          id="file-upload-1"
          label="Person 1 Photo"
          image={uploadedImage}
          isSecond={false}
        />
        <UploadBox
          id="file-upload-2"
          label="Person 2 Photo"
          image={uploadedImage2}
          isSecond={true}
        />
      </>
    )
  }

  return (
    <UploadBox
      id="file-upload"
      label="Your Photo"
      image={uploadedImage}
      isSecond={false}
    />
  )
}

export default UploadSection

