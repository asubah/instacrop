document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const processButton = document.getElementById('processButton');
    const outputCanvas = document.getElementById('outputCanvas');
    const downloadLink = document.getElementById('downloadLink');
    const processedImageHeader = document.getElementById('processedImageHeader');
    const resultArea = document.getElementById('resultArea'); // للتحكم في منطقة النتائج
    const imagePreviewContainer = document.getElementById('imagePreviewContainer');
    const ctx = outputCanvas.getContext('2d');

    // عناصر خيارات الخلفية
    const bgCustomColorRadio = document.getElementById('bgCustomColor');
    const bgBlurredImageRadio = document.getElementById('bgBlurredImage');
    const customColorPicker = document.getElementById('customColorPicker');
    const customColorPickerContainer = document.getElementById('customColorPickerContainer'); // تم إضافته
    const blurSliderContainer = document.getElementById('blurSliderContainer');
    const blurAmountSlider = document.getElementById('blurAmountSlider');
    const blurAmountValueDisplay = document.getElementById('blurAmountValue');

    let currentImage = null;
    const PORTRAIT_RATIO = 4 / 5; // العرض / الارتفاع
    const LANDSCAPE_RATIO = 1.91 / 1; // العرض / الارتفاع

    // مستمعو الأحداث لإظهار/إخفاء منتقي الألوان ومقدار التمويه
    // ضبط الحالة الأولية بناءً على الاختيار الافتراضي (لون مخصص)
    if (bgCustomColorRadio.checked) {
        customColorPickerContainer.style.display = 'block'; // أو 'flex' إذا أردت تحكم أدق بالعناصر الداخلية
        blurSliderContainer.style.display = 'none';
    } else if (bgBlurredImageRadio.checked) {
        customColorPickerContainer.style.display = 'none';
        blurSliderContainer.style.display = 'block';
    }

    bgCustomColorRadio.addEventListener('change', () => {
        if (bgCustomColorRadio.checked) {
            customColorPickerContainer.style.display = 'block';
            blurSliderContainer.style.display = 'none';
        }
    });
    bgBlurredImageRadio.addEventListener('change', () => {
        if (bgBlurredImageRadio.checked) {
            customColorPickerContainer.style.display = 'none';
            blurSliderContainer.style.display = 'block';
        }
    });

    blurAmountSlider.addEventListener('input', () => {
        blurAmountValueDisplay.textContent = `${blurAmountSlider.value}px`;
    });

    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreviewContainer.style.display = 'block';
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';

                currentImage = new Image();
                currentImage.onload = () => {
                    console.log('تم تحميل الصورة:', currentImage.width, 'x', currentImage.height);
                    // الصورة جاهزة للمعالجة
                    // إخفاء منطقة النتائج عند تحميل صورة جديدة
                    resultArea.style.display = 'none';
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
            imagePreviewContainer.style.display = 'none';
            imagePreview.style.display = 'none';
            imagePreview.src = '#';
            currentImage = null;
            resultArea.style.display = 'none';
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

        // تطبيق الخلفية المختارة
        const selectedBackgroundOption = document.querySelector('input[name="backgroundType"]:checked').value;

        if (selectedBackgroundOption === 'customColor') {
            ctx.fillStyle = customColorPicker.value;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (selectedBackgroundOption === 'blurredImage') {
            // رسم صورة الخلفية المكبرة والمموهة
            const bgImg = currentImage;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            const bgImageAspectRatio = bgImg.width / bgImg.height;
            let bgDrawWidth, bgDrawHeight, bgDrawX, bgDrawY;

            if (bgImageAspectRatio > canvasAspectRatio) { // الصورة أعرض من نسبة أبعاد اللوحة
                bgDrawHeight = canvasHeight;
                bgDrawWidth = bgImg.width * (canvasHeight / bgImg.height);
                bgDrawX = (canvasWidth - bgDrawWidth) / 2;
                bgDrawY = 0;
            } else { // الصورة أطول أو بنفس نسبة أبعاد اللوحة
                bgDrawWidth = canvasWidth;
                bgDrawHeight = bgImg.height * (canvasWidth / bgImg.width);
                bgDrawX = 0;
                bgDrawY = (canvasHeight - bgDrawHeight) / 2;
            }
            
            const currentBlurAmount = blurAmountSlider.value;
            ctx.filter = `blur(${currentBlurAmount}px)`;
            ctx.drawImage(bgImg, bgDrawX, bgDrawY, bgDrawWidth, bgDrawHeight);
            ctx.filter = 'none'; // إعادة تعيين الفلتر قبل رسم الصورة الرئيسية
        }

        // رسم الصورة الرئيسية (الأصلية الممركزة)
        ctx.drawImage(img, drawX, drawY, img.width, img.height);


        resultArea.style.display = 'block'; // إظهار منطقة النتائج
        outputCanvas.style.display = 'block'; // تأكد أن اللوحة ظاهرة داخل المنطقة
        // processedImageHeader سيظهر تلقائياً عند إظهار resultArea
        downloadLink.href = outputCanvas.toDataURL('image/png');
        downloadLink.download = `instagram_${selectedRatioValue}_${Date.now()}.png`;
        downloadLink.style.display = 'block'; // بما أن الزر w-100، block مناسب
    });
});
