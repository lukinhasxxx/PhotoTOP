import React, { useState, useEffect, useRef, ChangeEvent, useMemo } from 'react';
import './App.css';

class ImageState {
  constructor(public src: string) {
    this.editedSrc = src;
    this.isBlackAndWhite = false;
    this.isCompressed = false;
    this.isBitmap = false;
    this.blurSteps = 0;
    this.originalSrc = src;
    this.prevBlurSteps = [];
  }

  editedSrc: string;
  isBlackAndWhite: boolean;
  isCompressed: boolean;
  isBitmap: boolean;
  blurSteps: number;
  originalSrc: string;
  prevBlurSteps: string[];

  setBlackAndWhite(state: boolean) {
    this.isBlackAndWhite = state;
  }

  setCompressed(state: boolean) {
    this.isCompressed = state;
  }

  setBitmap(state: boolean) {
    this.isBitmap = state;
  }

  incrementBlurSteps() {
    this.blurSteps += 1;
  }

  decrementBlurSteps() {
    this.blurSteps = Math.max(this.blurSteps - 1, 0);
  }

  addPrevBlurStep(step: string) {
    this.prevBlurSteps.push(step);
  }

  getPrevBlurStep() {
    return this.prevBlurSteps.pop();
  }
}

function App() {
  const [images, setImages] = useState<ImageState[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1); // Use -1 instead of null
  const [customWidth, setCustomWidth] = useState<number | ''>('');
  const [customHeight, setCustomHeight] = useState<number | ''>('');
  const uploadedImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const updateImageSize = () => {
      if (uploadedImageRef.current) {
        // Update any required image size here
      }
    };

    updateImageSize();
    window.addEventListener('resize', updateImageSize);

    return () => {
      window.removeEventListener('resize', updateImageSize);
    };
  }, [currentImageIndex, images]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const newImage = new ImageState(reader.result);

          // Atualiza o estado usando a função de callback:
          setImages((prevImages) => [...prevImages, newImage]);
          setCurrentImageIndex(images.length); // Define como atual a nova imagem
          e.target.value = ""; // Limpa o input
        }
      };
      reader.readAsDataURL(file);
    }
  };


  const applyEffectToCurrentImage = (effectCallback: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void) => {
    if (currentImageIndex !== -1 && uploadedImageRef.current) {
      const currentImage = images[currentImageIndex];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!!;
      canvas.width = uploadedImageRef.current.naturalWidth;
      canvas.height = uploadedImageRef.current.naturalHeight;
      ctx.drawImage(uploadedImageRef.current, 0, 0);

      effectCallback(ctx, canvas);

      const editedSrc = canvas.toDataURL();
      currentImage.editedSrc = editedSrc;
      setImages([...images]);
      uploadedImageRef.current.src = editedSrc;
    }
  };

  const convertToBlackAndWhite = () => {
    if (currentImageIndex !== -1 && uploadedImageRef.current) {
      const currentImage = images[currentImageIndex];
      if (currentImage.isBlackAndWhite) {
        currentImage.editedSrc = currentImage.originalSrc;
      } else {
        applyEffectToCurrentImage((ctx, canvas) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          ctx.putImageData(imageData, 0, 0);
        });
      }
      currentImage.setBlackAndWhite(!currentImage.isBlackAndWhite);
      setImages([...images]);
    }
  };

  const rotateImage = () => {
    applyEffectToCurrentImage((ctx, canvas) => {
      canvas.width = uploadedImageRef.current!.height;
      canvas.height = uploadedImageRef.current!.width;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(uploadedImageRef.current!, -uploadedImageRef.current!.width / 2, -uploadedImageRef.current!.height / 2);
    });
  };

  const compressImage = () => {
    if (currentImageIndex !== -1 && uploadedImageRef.current) {
      const currentImage = images[currentImageIndex];
      applyEffectToCurrentImage((ctx, canvas) => {
        canvas.width = uploadedImageRef.current!.naturalWidth / 2;
        canvas.height = uploadedImageRef.current!.naturalHeight / 2;
        ctx.drawImage(uploadedImageRef.current!, 0, 0, canvas.width, canvas.height);
      });
      currentImage.setCompressed(true);
      setImages([...images]);
    }
  };

  const decompressImage = () => {
    if (currentImageIndex !== -1 && uploadedImageRef.current) {
      const currentImage = images[currentImageIndex];
      uploadedImageRef.current.src = currentImage.originalSrc;
      currentImage.editedSrc = currentImage.originalSrc;
      currentImage.setBlackAndWhite(false);
      currentImage.setBitmap(false);
      currentImage.setCompressed(false);
      currentImage.blurSteps = 0;
      currentImage.prevBlurSteps = [];
      setImages([...images]);
    }
  };

  const convertToBitmap = () => {
    if (currentImageIndex !== -1 && uploadedImageRef.current) {
      const currentImage = images[currentImageIndex];
      if (currentImage.isBitmap) {
        currentImage.editedSrc = currentImage.originalSrc;
      } else {
        applyEffectToCurrentImage((ctx, canvas) => {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const bw = avg < 128 ? 0 : 255;
            data[i] = bw;
            data[i + 1] = bw;
            data[i + 2] = bw;
          }
          ctx.putImageData(imageData, 0, 0);
        });
      }
      currentImage.setBitmap(!currentImage.isBitmap);
      setImages([...images]);
    }
  };

  const handleStoreImage = () => {
    if (uploadedImageRef.current) {
      const currentImage = images[currentImageIndex];
      setImages((prevImages) => [...prevImages, new ImageState(currentImage.editedSrc)]);
      setCurrentImageIndex(images.length);
    }
  };

  const mirrorImage = () => {
    applyEffectToCurrentImage((ctx, canvas) => {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(uploadedImageRef.current!, 0, 0);
    });
  };

  const blurOrSharpenImage = (amount: number) => {
    if (currentImageIndex !== -1 && uploadedImageRef.current) {
      const currentImage = images[currentImageIndex];
      applyEffectToCurrentImage((ctx, canvas) => {
        ctx.filter = `blur(${amount}px)`;
        ctx.drawImage(uploadedImageRef.current!, 0, 0);
      });
      currentImage.addPrevBlurStep(currentImage.editedSrc);
      currentImage.incrementBlurSteps();
    }
  };

  const handleBlurImage = () => {
    blurOrSharpenImage(3);
  };

  const handleUnblurImage = () => {
    if (currentImageIndex !== -1) {
      const currentImage = images[currentImageIndex];
      currentImage.decrementBlurSteps();
      const prevImage = currentImage.getPrevBlurStep();
      if (prevImage) {
        currentImage.editedSrc = prevImage;
        uploadedImageRef.current!.src = prevImage;
      } else {
        currentImage.editedSrc = currentImage.originalSrc;
        uploadedImageRef.current!.src = currentImage.originalSrc;
      }
      setImages([...images]);
    }
  };

  const convertToSVG = () => {
    if (currentImageIndex !== -1 && uploadedImageRef.current) {
      const currentImage = images[currentImageIndex];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!!;
      canvas.width = uploadedImageRef.current.naturalWidth;
      canvas.height = uploadedImageRef.current.naturalHeight;
      ctx.drawImage(uploadedImageRef.current, 0, 0);
      const dataUrl = canvas.toDataURL();

      const img = new Image();
      img.onload = () => {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}"><image href="${dataUrl}" width="100%" height="100%"/></svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'image.svg';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      img.src = dataUrl;
    }
  };

  const imageList = useMemo(
    () =>
      images.map((img, index) => (
        <img
          key={index}
          src={img.editedSrc || img.src}
          alt={`Uploaded Image ${index}`}
          style={{ width: '100px', height: 'auto', margin: '5px', cursor: 'pointer' }}
          onClick={() => {
            setCurrentImageIndex(index);
          }}
        />
      )),
    [images]
  );

  const handleDownloadImage = () => {
    if (currentImageIndex !== -1) {
      const currentImage = images[currentImageIndex];
      const downloadLink = document.createElement('a');
      downloadLink.href = currentImage.editedSrc;
      downloadLink.download = 'edited_image.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleDownloadAllImages = () => {
    images.forEach((img, index) => {
      const downloadLink = document.createElement('a');
      downloadLink.href = img.editedSrc;
      downloadLink.download = `edited_image_${index}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  };

  const handleCustomResolution = () => {
    if (currentImageIndex !== -1 && uploadedImageRef.current && customWidth && customHeight) {
      applyEffectToCurrentImage((ctx, canvas) => {
        canvas.width = customWidth;
        canvas.height = customHeight;
        ctx.drawImage(uploadedImageRef.current!, 0, 0, customWidth, customHeight);
      });
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to right, #4e54c8, #8f94fb)', width: '100vw', overflow: 'hidden' }}>
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', textAlign: 'center', width: '80%' }}>
        {currentImageIndex === -1 && (
          <div style={{ fontSize: '24px', color: '#333', marginBottom: '20px', opacity: '0.7' }} className="add-image-text">
            <label htmlFor="imageInput" style={{ cursor: 'pointer', color: '#4e54c8' }}>
              Clique aqui para adicionar uma imagem
            </label>
          </div>
        )}
        <input type="file" id="imageInput" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        <div style={{ marginBottom: '20px', position: 'relative' }} className="image-container">
          {currentImageIndex !== -1 && (
            <>
              <img
                ref={uploadedImageRef}
                src={images[currentImageIndex].editedSrc}
                alt="Uploaded Image"
                id="uploadedImage"
                style={{ maxWidth: '100%', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' }}
              />
            </>
          )}
        </div>
        {currentImageIndex !== -1 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '0 20px' }} className="controls">
              <button className="button" onClick={convertToBlackAndWhite}>
                Preto e Branco
              </button>
              <button className="button" onClick={rotateImage}>
                Girar
              </button>
              <button className="button" onClick={compressImage}>
                Comprimir
              </button>
              <button className="button" onClick={decompressImage}>
                Descomprimir
              </button>
              <button className="button" onClick={convertToBitmap}>
                Bitmap
              </button>
              <button className="button" onClick={handleStoreImage}>
                Adicionar nova imagem
              </button>
              <button className="button" onClick={mirrorImage}>
                Espelhar
              </button>
              <button className="button" onClick={handleBlurImage}>
                Borrar
              </button>
              <button className="button" onClick={handleUnblurImage}>
                Desborrar
              </button>
              <button className="button" onClick={handleDownloadImage}>
                Download
              </button>
              <button className="button" onClick={convertToSVG}>
                Converter e baixar em SVG
              </button>
              <button className="button" onClick={handleDownloadAllImages}>
                Baixar todas as imagens
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
              <input type="number" placeholder="Largura" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value) || '')} style={{ marginRight: '10px', padding: '5px' }} />
              <input type="number" placeholder="Altura" value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value) || '')} style={{ marginRight: '10px', padding: '5px' }} />
              <button className="button" onClick={handleCustomResolution}>
                Aplicar resolução
              </button>
            </div>
          </>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>{imageList}</div>
      </div>
    </div>
  );
}

export default App;
