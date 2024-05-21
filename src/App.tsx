import React, { useState, ChangeEvent, useRef, useMemo, useEffect } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [images, setImages] = useState<{ src: string; editedSrc?: string | null }[]>([]);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const uploadedImageRef = useRef<HTMLImageElement>(null);
  const [blurStep, setBlurStep] = useState<number>(0);
  const [prevBlurSteps, setPrevBlurSteps] = useState<string[]>([]);
  const [isBlackAndWhite, setIsBlackAndWhite] = useState<boolean>(false);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);

  useEffect(() => {
    const updateImageSize = () => {
      if (uploadedImageRef.current) {
        const { width, height } = uploadedImageRef.current;
        setImageSize({ width, height });
      }
    };

    updateImageSize();
    window.addEventListener('resize', updateImageSize);

    return () => {
      window.removeEventListener('resize', updateImageSize);
    };
  }, [editedImage, image]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setOriginalImage(reader.result);
      }
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const convertToBlackAndWhite = () => {
    if (uploadedImageRef.current) {
      if (isBlackAndWhite) {
        setEditedImage(originalImage);
        uploadedImageRef.current.src = originalImage!;
      } else {
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
      setIsBlackAndWhite(!isBlackAndWhite);
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
      setCompressedImage(editedSrc);
      setEditedImage(editedSrc);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const decompressImage = () => {
    if (uploadedImageRef.current && compressedImage) {
      uploadedImageRef.current.src = originalImage!;
      setEditedImage(originalImage);
      setCompressedImage(null);
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
      setPrevBlurSteps(prevSteps => [...prevSteps, editedSrc]);
      setEditedImage(editedSrc);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const handleBlurImage = () => {
    if (uploadedImageRef.current) {
      blurOrSharpenImage(3);
      setBlurStep(prevStep => prevStep + 1);
    }
  };

  const handleUnblurImage = () => {
    if (blurStep > 0) {
      setBlurStep(prevStep => prevStep - 1);
      const prevImage = prevBlurSteps.pop();
      if (prevImage) {
        setEditedImage(prevImage);
        uploadedImageRef.current!.src = prevImage;
      }
    } else {
      setEditedImage(originalImage);
      if (originalImage) {
        uploadedImageRef.current!.src = originalImage;
      }
    }
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

  const handleDownloadImage = () => {
    if (editedImage) {
      const downloadLink = document.createElement('a');
      downloadLink.href = editedImage;
      downloadLink.download = 'edited_image.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
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
        textAlign: 'center',
        width: '80%'
      }}>
        {!image && (
          <div style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>
            <label htmlFor="imageInput" style={{ cursor: 'pointer', color: '#4e54c8' }}>
              Clique aqui para adicionar uma imagem
            </label>
          </div>
        )}
        <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        <div style={{ marginBottom: '20px', position: 'relative' }} className="image-container">
          {image && (
            <>
              <img
                ref={uploadedImageRef}
                src={editedImage || image}
                alt="Uploaded Image"
                id="uploadedImage"
                style={{
                  maxWidth: '100%',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              />
              {imageSize && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  padding: '5px 10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}>
                  {imageSize.width} x {imageSize.height}
                </div>
              )}
            </>
          )}
        </div>
        {image && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }} className="controls">
            <button className="button" onClick={convertToBlackAndWhite}>Preto e Branco</button>
            <button className="button" onClick={rotateImage}>Girar</button>
            <button className="button" onClick={compressImage}>Comprimir</button>
            <button className="button" onClick={decompressImage}>Descomprimir</button>
            <button className="button" onClick={convertToBitmap}>Bitmap</button>
            <button className="button" onClick={handleStoreImage}>Adicionar nova imagem</button>
            <button className="button" onClick={mirrorImage}>Espelhar</button>
            <button className="button" onClick={handleBlurImage}>Borrar</button>
            <button className="button" onClick={handleUnblurImage}>Desborrar</button>
            <button className="button" onClick={handleDownloadImage}>Download</button>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {imageList}
        </div>
      </div>
    </div>
  );
}

export default App;
