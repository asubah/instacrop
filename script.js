document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const processButton = document.getElementById('processButton');
    const outputCanvas = document.getElementById('outputCanvas');
    const downloadLink = document.getElementById('downloadLink');
    const processedImageHeader = document.getElementById('processedImageHeader');
    const ctx = outputCanvas.getContext('2d');

    let currentImage = null;
    const PORTRAIT_RATIO = 4 / 5; // العرض / الارتفاع
    const LANDSCAPE_RATIO = 1.91 / 1; // العرض / الارتفاع

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

        const selectedRatioOption = document.querySelector('input[name="aspectRatio"]:checked');
        if (!selectedRatioOption) {
            alert('الرجاء اختيار نسبة الأبعاد.');
            return;
        }
        const selectedRatioValue = selectedRatioOption.value;
        let targetRatio;

        if (selectedRatioValue === 'portrait') {
            targetRatio = PORTRAIT_RATIO;
        } else if (selectedRatioValue === 'landscape') {
            targetRatio = LANDSCAPE_RATIO;
        } else {
            alert('نسبة أبعاد غير صالحة مختارة.');
            return;
        }

        const img = currentImage;
        let canvasWidth, canvasHeight;
        let drawX, drawY;

        const imageAspectRatio = img.width / img.height;

        if (imageAspectRatio > targetRatio) {
            // الصورة أعرض من النسبة المطلوبة (مثلاً، صورة أفقية ونريد بورتريه)
            // أو صورة أقل عرضاً من لاندسكيب (مثلاً بورتريه ونريد لاندسكيب أوسع)
            // نجعل عرض اللوحة هو عرض الصورة، ونضبط ارتفاع اللوحة ليناسب النسبة المطلوبة
            canvasWidth = img.width;
            canvasHeight = img.width / targetRatio;
            drawX = 0;
            drawY = (canvasHeight - img.height) / 2; // توسيط الصورة عمودياً
        } else if (imageAspectRatio < targetRatio) {
            // الصورة أطول من النسبة المطلوبة (مثلاً، صورة عمودية ونريد لاندسكيب)
            // أو صورة أقل طولاً من بورتريه (مثلاً لاندسكيب ونريد بورتريه أطول)
            // نجعل ارتفاع اللوحة هو ارتفاع الصورة، ونضبط عرض اللوحة ليناسب النسبة المطلوبة
            canvasHeight = img.height;
            canvasWidth = img.height * targetRatio;
            drawX = (canvasWidth - img.width) / 2; // توسيط الصورة أفقياً
            drawY = 0;
        } else {
            // الصورة بالفعل بالسبة المطلوبة
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
        downloadLink.href = outputCanvas.toDataURL('image/png');
        downloadLink.download = `instagram_${selectedRatioValue}_${Date.now()}.png`;
        downloadLink.style.display = 'inline-block';
    });
});
