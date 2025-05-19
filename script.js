document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const processButton = document.getElementById('processButton');
    const outputCanvas = document.getElementById('outputCanvas');
    const downloadLink = document.getElementById('downloadLink');
    const processedImageHeader = document.getElementById('processedImageHeader');
    const ctx = outputCanvas.getContext('2d');

    let currentImage = null;
    const INSTAGRAM_PORTRAIT_RATIO = 4 / 5; // العرض / الارتفاع

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';

                currentImage = new Image();
                currentImage.onload = () => {
                    console.log('تم تحميل الصورة:', currentImage.width, 'x', currentImage.height);
                    // الصورة جاهزة للمعالجة
                    // إخفاء اللوحة ورابط التنزيل عند تحميل صورة جديدة
                    outputCanvas.style.display = 'none';
                    processedImageHeader.style.display = 'none';
                    downloadLink.style.display = 'none';
                    // مسح اللوحة السابقة إذا كانت موجودة
                    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
                };
                currentImage.onerror = () => {
                    console.error('خطأ في تحميل الصورة.');
                    alert('حدث خطأ أثناء تحميل الصورة.');
                    currentImage = null;
                };
                currentImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
            imagePreview.src = '#';
            currentImage = null;
            outputCanvas.style.display = 'none';
            processedImageHeader.style.display = 'none';
            downloadLink.style.display = 'none';
        }
    });

    processButton.addEventListener('click', () => {
        if (!currentImage || !currentImage.complete || currentImage.naturalWidth === 0) {
            alert('الرجاء اختيار صورة أولاً.');
            return;
        }

        const img = currentImage;
        let canvasWidth, canvasHeight;
        let drawX, drawY;

        const imageAspectRatio = img.width / img.height;

        if (imageAspectRatio > INSTAGRAM_PORTRAIT_RATIO) {
            // الصورة أعرض من نسبة 4:5 (مثلاً، صورة أفقية 16:9)
            // عرض اللوحة سيكون عرض الصورة، وارتفاع اللوحة سيُضبط ليناسب نسبة 4:5
            canvasWidth = img.width;
            canvasHeight = img.width / INSTAGRAM_PORTRAIT_RATIO; // canvasHeight = img.width * (5/4)
            drawX = 0;
            drawY = (canvasHeight - img.height) / 2;
        } else if (imageAspectRatio < INSTAGRAM_PORTRAIT_RATIO) {
            // الصورة أطول من نسبة 4:5 (مثلاً، صورة عمودية 9:16)
            // ارتفاع اللوحة سيكون ارتفاع الصورة، وعرض اللوحة سيُضبط ليناسب نسبة 4:5
            canvasHeight = img.height;
            canvasWidth = img.height * INSTAGRAM_PORTRAIT_RATIO; // canvasWidth = img.height * (4/5)
            drawX = (canvasWidth - img.width) / 2;
            drawY = 0;
        } else {
            // الصورة بالفعل بنسبة 4:5
            canvasWidth = img.width;
            canvasHeight = img.height;
            drawX = 0;
            drawY = 0;
        }

        outputCanvas.width = canvasWidth;
        outputCanvas.height = canvasHeight;

        // ملء الخلفية باللون الأبيض
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // رسم الصورة
        ctx.drawImage(img, drawX, drawY, img.width, img.height);

        outputCanvas.style.display = 'block';
        processedImageHeader.style.display = 'block';
        downloadLink.href = outputCanvas.toDataURL('image/png'); // أو 'image/jpeg' للحجم الأصغر
        downloadLink.download = `instagram_portrait_${Date.now()}.png`;
        downloadLink.style.display = 'inline-block'; // إظهار رابط التنزيل
    });
});
