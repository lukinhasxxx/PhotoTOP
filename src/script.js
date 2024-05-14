const imageInput = document.getElementById('imageInput');
const uploadedImage = document.getElementById('uploadedImage');

imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function convertToBlackAndWhite() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;
    ctx.drawImage(uploadedImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
    uploadedImage.src = canvas.toDataURL();
}

function rotateImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = uploadedImage.height;
    canvas.height = uploadedImage.width;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(uploadedImage, -uploadedImage.width / 2, -uploadedImage.height / 2);
    uploadedImage.src = canvas.toDataURL();
}

function compressImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = uploadedImage.width / 2;
    canvas.height = uploadedImage.height / 2;
    ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    uploadedImage.src = canvas.toDataURL();
}

function convertToBitmap() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = uploadedImage.width;
    canvas.height = uploadedImage.height;
    ctx.drawImage(uploadedImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg < 128 ? 0 : 255;
        data[i + 1] = avg < 128 ? 0 : 255;
        data[i + 2] = avg < 128 ? 0 : 255;
    }
    ctx.putImageData(imageData, 0, 0);
    uploadedImage.src = canvas.toDataURL();
}
