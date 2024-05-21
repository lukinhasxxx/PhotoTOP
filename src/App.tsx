import React, { useState, ChangeEvent, useRef, useMemo } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [images, setImages] = useState<{ src: string; editedSrc?: string | null }[]>([]);
  const [editedImage, setEditedImage] = useState<string | null>(null);
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
      const ctx = canvas.getContext('2d')!!;
      canvas.width = uploadedImageRef.current.width;
      canvas.height = uploadedImageRef.current.height;
      ctx.drawImage(uploadedImageRef.current, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);
      const editedSrc = canvas.toDataURL();
      setEditedImage(editedSrc);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const rotateImage = () => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!!;
      canvas.width = uploadedImageRef.current.height;
      canvas.height = uploadedImageRef.current.width;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(uploadedImageRef.current, -uploadedImageRef.current.width / 2, -uploadedImageRef.current.height / 2);
      const editedSrc = canvas.toDataURL();
      setEditedImage(editedSrc);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const compressImage = () => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!!;
      canvas.width = uploadedImageRef.current.width / 2;
      canvas.height = uploadedImageRef.current.height / 2;
      ctx.drawImage(uploadedImageRef.current, 0, 0, canvas.width, canvas.height);
      const editedSrc = canvas.toDataURL();
      setEditedImage(editedSrc);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const convertToBitmap = () => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!!;
      canvas.width = uploadedImageRef.current.width;
      canvas.height = uploadedImageRef.current.height;
      ctx.drawImage(uploadedImageRef.current, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg < 128 ? 0 : 255;
        data[i + 1] = avg < 128 ? 0 : 255;
        data[i + 2] = avg < 128 ? 0 : 255;
      }
      ctx.putImageData(imageData, 0, 0);
      const editedSrc = canvas.toDataURL();
      setEditedImage(editedSrc);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const handleStoreImage = () => {
    if (uploadedImageRef.current && image) {
      setImages(prevImages => [...prevImages, { src: image, editedSrc: editedImage }]);
      setImage(null);
      setEditedImage(null);
    }
  };

  const mirrorImage = () => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!!;
      canvas.width = uploadedImageRef.current.width;
      canvas.height = uploadedImageRef.current.height;
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(uploadedImageRef.current, 0, 0);
      const editedSrc = canvas.toDataURL();
      setEditedImage(editedSrc);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const blurOrSharpenImage = (amount: number) => {
    if (uploadedImageRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!!;
      canvas.width = uploadedImageRef.current.width;
      canvas.height = uploadedImageRef.current.height;
      ctx.filter = `blur(${amount}px)`;
      ctx.drawImage(uploadedImageRef.current, 0, 0);
      const editedSrc = canvas.toDataURL();
      setEditedImage(editedSrc);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const handleBlurImage = () => {
    blurOrSharpenImage(3); // Altere o valor de acordo com a quantidade de desfoque desejada
  };

  const handleSharpenImage = () => {
    blurOrSharpenImage(-3); // Altere o valor de acordo com a quantidade de nitidez desejada
  };

  const imageList = useMemo(
    () => images.map((img, index) => (
      <img
        key={index}
        src={img.editedSrc || img.src}
        alt={`Uploaded Image ${index}`}
        style={{ width: '100px', height: 'auto', margin: '5px', cursor: 'pointer' }}
        onClick={() => {
          setImage(img.src);
          setEditedImage(img.editedSrc || null);
        }}
      />
    )),
    [images]
  );

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
        textAlign: 'center',
        width: '80%'
      }}>
        <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} />
        <div style={{ marginBottom: '20px' }} className="image-container">
          {image && <img ref={uploadedImageRef} src={editedImage || image} alt="Uploaded Image" id="uploadedImage" />}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }} className="controls">
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
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            opacity: 0.9
          }} onClick={handleStoreImage}>Salvar Imagem</button>
          {/* Novos botões */}
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            opacity: 0.9
          }} onClick={mirrorImage}>Espelhar</button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            opacity: 0.9
          }} onClick={handleBlurImage}>Borrar</button>
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
            opacity: 0.9
          }} onClick={handleSharpenImage}>Nitidez</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {imageList}
        </div>
      </div>
    </div>
  );
}

export default App;
