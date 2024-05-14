import React, { useState, ChangeEvent, useRef } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const convertToBlackAndWhite = () => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = uploadedImageRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData?.data;
      if (data) {
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
        ctx?.putImageData(imageData, 0, 0);
        img.src = canvas.toDataURL();
      }
    }
  };

  const rotateImage = () => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = uploadedImageRef.current;
      canvas.width = img.height;
      canvas.height = img.width;
      ctx?.translate(canvas.width / 2, canvas.height / 2);
      ctx?.rotate(Math.PI / 2);
      ctx?.drawImage(img, -img.width / 2, -img.height / 2);
      img.src = canvas.toDataURL();
    }
  };

  const compressImage = () => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = uploadedImageRef.current;
      canvas.width = img.width / 2;
      canvas.height = img.height / 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = canvas.toDataURL();
    }
  };

  const convertToBitmap = () => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = uploadedImageRef.current;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData?.data;
      if (data) {
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg < 128 ? 0 : 255;
          data[i + 1] = avg < 128 ? 0 : 255;
          data[i + 2] = avg < 128 ? 0 : 255;
        }
        ctx?.putImageData(imageData, 0, 0);
        img.src = canvas.toDataURL();
      }
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to right, #4e54c8, #8f94fb)',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} />
        <div style={{ marginBottom: '20px' }} className="image-container">
          {image && <img src={image} alt="Uploaded Image" id="uploadedImage" ref={uploadedImageRef} />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }} className="controls">
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            opacity: 0.9
          }} onClick={convertToBlackAndWhite}>Preto e Branco</button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            opacity: 0.9
          }} onClick={rotateImage}>Girar</button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            opacity: 0.9
          }} onClick={compressImage}>Comprimir</button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            opacity: 0.9
          }} onClick={convertToBitmap}>Bitmap</button>
        </div>
      </div>
    </div>
  );
}

export default App;
