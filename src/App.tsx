import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import './App.css';

function App() {
  const [imagem, setImagem] = useState<string | null>(null);
  const [imagens, setImagens] = useState<{ src: string; editedSrc?: string | null }[]>([]);
  const [imagemEditada, setImagemEditada] = useState<string | null>(null);
  const [imagemOriginal, setImagemOriginal] = useState<string | null>(null);
  const [tamanhoImagem, setTamanhoImagem] = useState<{ largura: number; altura: number } | null>(null);
  const [resolucaoImagemCarregada, setResolucaoImagemCarregada] = useState<{ largura: number; altura: number }>({ largura: 0, altura: 0 });
  const imagemCarregadaRef = useRef<HTMLImageElement>(null);
  const [passoBorrado, setPassoBorrado] = useState<number>(0);
  const [passosBorradosPrevios, setPassosBorradosPrevios] = useState<string[]>([]);
  const [isPretoBranco, setIsPretoBranco] = useState<boolean>(false);
  const [imagemComprimida, setImagemComprimida] = useState<string | null>(null);
  const [imagemBitmapPrevia, setImagemBitmapPrevia] = useState<string | null>(null);
  const [resolucaoPersonalizada, setResolucaoPersonalizada] = useState<{ largura: number; altura: number }>({ largura: 0, altura: 0 });

  useEffect(() => {
    const atualizarTamanhoImagem = () => {
      if (imagemCarregadaRef.current) {
        const { naturalWidth, naturalHeight } = imagemCarregadaRef.current;
        setTamanhoImagem({ largura: naturalWidth, altura: naturalHeight });
      }
    };

    atualizarTamanhoImagem();
    window.addEventListener('resize', atualizarTamanhoImagem);

    return () => {
      window.removeEventListener('resize', atualizarTamanhoImagem);
    };
  }, [imagemEditada, imagem]);

  useEffect(() => {
    if (imagemCarregadaRef.current && imagem) {
      const img = new Image();
      img.onload = () => {
        setResolucaoImagemCarregada({ largura: img.width, altura: img.height });
      };
      img.src = imagem;
    }
  }, [imagem]);

  const handleImagemChange = (e: ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files && e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImagem(reader.result);
        setImagemOriginal(reader.result);
        setImagemEditada(reader.result);
      }
    };

    if (arquivo) {
      reader.readAsDataURL(arquivo);
    }
  };

  const converterParaPretoBranco = () => {
    if (imagemCarregadaRef.current) {
      if (isPretoBranco) {
        setImagemEditada(imagemOriginal);
        imagemCarregadaRef.current.src = imagemOriginal!;
      } else {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = imagemCarregadaRef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        
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
        setImagemEditada(editedSrc);
        imagemCarregadaRef.current.src = editedSrc;
      }
      setIsPretoBranco(!isPretoBranco);
      setImagemComprimida(null);
      setImagemBitmapPrevia(null);
    }
  };

  const converterParaBitmap = () => {
    if (imagemCarregadaRef.current) {
      if (imagemBitmapPrevia) {
        setImagemEditada(imagemBitmapPrevia);
        imagemCarregadaRef.current.src = imagemBitmapPrevia;
        setImagemBitmapPrevia(null);
      } else {
        setImagemBitmapPrevia(imagemEditada || imagemOriginal);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = imagemCarregadaRef.current;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

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
        setImagemEditada(editedSrc);
        imagemCarregadaRef.current.src = editedSrc;
      }
    }
  };

  const girarImagem = () => {
    if (imagemCarregadaRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = imagemCarregadaRef.current;
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const editedSrc = canvas.toDataURL();
      setImagemEditada(editedSrc);
      imagemCarregadaRef.current.src = editedSrc;

      if (resolucaoImagemCarregada) {
        setResolucaoImagemCarregada({
          largura: canvas.width,
          altura: canvas.height
        });
      }
    }
  };

  const comprimirImagem = () => {
    if (imagemCarregadaRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = imagemCarregadaRef.current.width / 2;
      canvas.height = imagemCarregadaRef.current.height / 2;
      ctx.drawImage(imagemCarregadaRef.current, 0, 0, canvas.width, canvas.height);
      const editedSrc = canvas.toDataURL();
      setImagemComprimida(editedSrc);
      setImagemEditada(editedSrc);
      imagemCarregadaRef.current.src = editedSrc;

      if (resolucaoImagemCarregada) {
        setResolucaoImagemCarregada({
          largura: canvas.width,
          altura: canvas.height
        });
      }
    }
  };

  const descomprimirImagem = () => {
    if (imagemCarregadaRef.current && imagemComprimida) {
      imagemCarregadaRef.current.src = imagemOriginal!;
      setImagemEditada(imagemOriginal);
      setImagemComprimida(null);
    }
  };

  const handleArmazenarImagem = () => {
    if (imagemCarregadaRef.current && imagem) {
      setImagens(prevImagens => [...prevImagens, { src: imagemOriginal!, editedSrc: imagemEditada }]);
      setImagem(null);
      setImagemEditada(null);
      setImagemOriginal(null);
    }
  };

  const espelharImagem = () => {
    if (imagemCarregadaRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = imagemCarregadaRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      const editedSrc = canvas.toDataURL();
      setImagemEditada(editedSrc);
      imagemCarregadaRef.current.src = editedSrc;
    }
  };

  const borrarOuDesborrarImagem = (quantidade: number) => {
    if (imagemCarregadaRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = imagemCarregadaRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      ctx.filter = `blur(${quantidade}px)`;
      ctx.drawImage(canvas, 0, 0);

      const editedSrc = canvas.toDataURL();
      setImagemEditada(editedSrc);
      imagemCarregadaRef.current.src = editedSrc;
    }
  };

  const handleBorrarImagem = () => {
    setPassosBorradosPrevios(prev => [...prev, imagemEditada!]);
    setPassoBorrado(passoBorrado + 1);
    borrarOuDesborrarImagem(passoBorrado + 1);
  };

  const handleDesborrarImagem = () => {
    if (passosBorradosPrevios.length > 0) {
      const ultimoPasso = passosBorradosPrevios.pop()!;
      setImagemEditada(ultimoPasso);
      imagemCarregadaRef.current!.src = ultimoPasso;
      setPassoBorrado(passoBorrado - 1);
    }
  };

  const baixarImagem = () => {
    if (imagemEditada) {
      const link = document.createElement('a');
      link.href = imagemEditada;
      link.download = 'imagem-editada.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const baixarTodasImagens = () => {
    imagens.forEach((imagem, index) => {
      const link = document.createElement('a');
      link.href = imagem.editedSrc || imagem.src;
      link.download = `imagem-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const restaurarParaOriginal = () => {
    setImagem(imagemOriginal);
    setImagemEditada(imagemOriginal);
    if (imagemCarregadaRef.current) {
      imagemCarregadaRef.current.src = imagemOriginal!;
    }
    setResolucaoImagemCarregada({ largura: tamanhoImagem!.largura, altura: tamanhoImagem!.altura });
    setImagemComprimida(null);
    setImagemBitmapPrevia(null);
    setIsPretoBranco(false);
  };

  const handleResolucaoPersonalizadaChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResolucaoPersonalizada(prevState => ({
      ...prevState,
      [name]: Number(value)
    }));
  };

  const aplicarResolucaoPersonalizada = () => {
    if (imagemCarregadaRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = imagemCarregadaRef.current;
      canvas.width = resolucaoPersonalizada.largura;
      canvas.height = resolucaoPersonalizada.altura;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const editedSrc = canvas.toDataURL();
      setImagemEditada(editedSrc);
      imagemCarregadaRef.current.src = editedSrc;
      setResolucaoImagemCarregada({
        largura: canvas.width,
        altura: canvas.height
      });
    }
  };

  const selecionarImagem = (index: number) => {
    const imagemSelecionada = imagens[index];
    setImagem(imagemSelecionada.src);
    setImagemOriginal(imagemSelecionada.src);
    setImagemEditada(imagemSelecionada.editedSrc || imagemSelecionada.src);
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      margin: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(to right, #4E54C8, #F7EED4)',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: 'rgba(229 222 255 , 0.29)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '80%',
        position: 'relative',
        border: '5px solid #B4BCFF'
      }}>
        {!imagem && (
          <div style={{ fontSize: '36px', color: '#333', marginBottom: '20px' }}>
            <label htmlFor="imageInput" style={{ cursor: 'pointer', color: '#3E3EFF' }}>
              Clique aqui para adicionar uma imagem
            </label>
          </div>
        )}
        <input type="file" id="imageInput" accept="image/*" onChange={handleImagemChange} style={{ display: 'none' }} />
        <div style={{ marginBottom: '20px', position: 'relative' }} className="image-container">
          {imagem && (
            <>
              <img
                ref={imagemCarregadaRef}
                src={imagemEditada || imagem}
                alt="Uploaded"
                id="uploadedImage"
                style={{
                  maxWidth: '100%',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              />
              {resolucaoImagemCarregada && (
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
                  {resolucaoImagemCarregada.largura} x {resolucaoImagemCarregada.altura}
                </div>
              )}
            </>
          )}
        </div>
        {imagem && (
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '0 20px' }} className="controls">
            <button className="button" onClick={converterParaPretoBranco}>Preto e Branco</button>
            <button className="button" onClick={girarImagem}>Girar</button>
            <button className="button" onClick={comprimirImagem}>Comprimir</button>
            <button className="button" onClick={descomprimirImagem}>Descomprimir</button>
            <button className="button" onClick={converterParaBitmap}>Bitmap</button>
            <button className="button" onClick={espelharImagem}>Espelhar</button>
            <button className="button" onClick={handleBorrarImagem}>Borrar</button>
            <button className="button" onClick={handleDesborrarImagem}>Desborrar</button>
            <button className="button" onClick={baixarImagem}>Baixar imagem atual</button>
            <button className="button" onClick={baixarTodasImagens}>Baixar todas as imagens</button>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label htmlFor="largura" style={{ marginRight: '10px' }}>Largura:</label>
              <input
                type="number"
                id="largura"
                name="largura"
                value={resolucaoPersonalizada.largura}
                onChange={handleResolucaoPersonalizadaChange}
                style={{ width: '60px', marginRight: '10px', border: '2px solid #00CED1', 
                borderRadius: '5px', 
                padding: '2px'}}
              />
              <label htmlFor="altura" style={{ marginRight: '10px' }}>Altura:</label>
              <input
                type="number"
                id="altura"
                name="altura"
                value={resolucaoPersonalizada.altura}
                onChange={handleResolucaoPersonalizadaChange}
                style={{ width: '60px', marginRight: '10px', border: '2px solid #00CED1', borderRadius: '5px', padding:'2px' }}
              />
              <button className="button" onClick={aplicarResolucaoPersonalizada}>Aplicar Resolução Personalizada</button>
              <button className="button" onClick={handleArmazenarImagem}>Adicionar nova imagem</button>
            </div>
            <button className="button" onClick={restaurarParaOriginal}>Restaurar para configuração original</button>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
          {imagens.map((img, index) => (
            <img
              key={index}
              src={img.editedSrc || img.src}
              alt={`Imagem ${index + 1}`}
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer' }}
              onClick={() => selecionarImagem(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
