import { toast } from 'react-toastify'
import imageCompression from 'browser-image-compression'

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

    // 显示压缩提示
    const compressionToast = toast.loading('正在压缩图片...', { autoClose: false })

    try {
      // 图片压缩选项 - 优化为WebP格式（如果支持）
      const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
      const options = {
        maxSizeMB: 1, // 压缩后最大1MB
        maxWidthOrHeight: 1920, // 最大宽度或高度
        useWebWorker: true, // 使用Web Worker加速
        fileType: supportsWebP ? 'image/webp' : (file.type.includes('png') ? 'image/png' : 'image/jpeg'), // 优先使用WebP
        initialQuality: 0.85 // 初始质量（稍微提高以保持质量）
      }

      // 压缩图片
      const compressedFile = await imageCompression(file, options)
      
      // 读取压缩后的图片
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageUpload(e.target.result, isSecond)
        
        // 显示压缩成功提示
        toast.dismiss(compressionToast)
        const originalSize = (file.size / 1024 / 1024).toFixed(2)
        const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2)
        toast.success(`图片压缩完成：${originalSize}MB → ${compressedSize}MB`, { autoClose: 2000 })
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('图片压缩失败:', error)
      toast.dismiss(compressionToast)
      toast.warning('图片压缩失败，使用原图')
      
      // 压缩失败时使用原图
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageUpload(e.target.result, isSecond)
      }
      reader.readAsDataURL(file)
    }
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
          <>
            <img 
              src={image} 
              alt={`Uploaded ${label.toLowerCase()} for face swap`}
              title={`${label} - Ready for face swap`}
            />
            <button 
              className="change-photo-btn-small"
              onClick={() => document.getElementById(id).click()}
            >
              Change Photo
            </button>
          </>
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

