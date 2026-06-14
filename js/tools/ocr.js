import { showToast, copyToClipboard } from '../utils.js';

let currentImage = null;
let selection = { x: 50, y: 50, w: 200, h: 100, active: false };
let isDragging = false;
let isResizing = false;
let resizeHandle = null;
let dragStartX, dragStartY;

export function render() {
    return `
        <div class="ocr-standalone-container">
            <div class="ocr-input-section" id="ocrInputSection">
                <div class="ocr-dropzone" id="ocrDropzone">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    <p>Drop an image here or click to upload</p>
                    <p class="hint">You can also paste (Cmd+V)</p>
                    <input type="file" id="ocrFilePicker" accept="image/*" style="display: none;">
                </div>
            </div>

            <div class="ocr-workspace" id="ocrWorkspace" style="display: none;">
                <div class="ocr-image-area">
                    <div id="ocrImageHint" class="ocr-image-hint">Click and drag to select an area to scan</div>
                    <div class="ocr-image-wrapper" id="ocrImageWrapper">
                        <img id="ocrMainImage" src="" alt="OCR Target">
                        <div id="ocrSelector" class="ocr-selector" style="display: none;">
                            <div class="ocr-handle n"></div>
                            <div class="ocr-handle s"></div>
                            <div class="ocr-handle e"></div>
                            <div class="ocr-handle w"></div>
                            <div class="ocr-handle nw"></div>
                            <div class="ocr-handle ne"></div>
                            <div class="ocr-handle sw"></div>
                            <div class="ocr-handle se"></div>
                        </div>
                    </div>
                </div>
                
                <div class="ocr-sidebar">
                    <div class="ocr-controls">
                        <button id="ocrScanBtn" class="primary-btn">Extract Text</button>
                        <button id="ocrRemoveBtn" class="secondary-btn">New Image</button>
                    </div>
                    
                    <div class="ocr-result-area">
                        <div class="ocr-result-header">
                            <h4>Extracted Text</h4>
                            <button id="ocrCopyResultBtn" class="icon-btn" title="Copy to clipboard">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                            </button>
                        </div>
                        <textarea id="ocrTextResult" placeholder="Extracted text will appear here..." readonly></textarea>
                        <div id="ocrStatus" class="ocr-status">Ready</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init(workspace, actionsContainer) {
    const dropzone = workspace.querySelector('#ocrDropzone');
    const filePicker = workspace.querySelector('#ocrFilePicker');
    const imageWrapper = workspace.querySelector('#ocrImageWrapper');
    const mainImage = workspace.querySelector('#ocrMainImage');
    const selector = workspace.querySelector('#ocrSelector');
    const scanBtn = workspace.querySelector('#ocrScanBtn');
    const removeBtn = workspace.querySelector('#ocrRemoveBtn');
    const copyBtn = workspace.querySelector('#ocrCopyResultBtn');
    const resultText = workspace.querySelector('#ocrTextResult');
    const status = workspace.querySelector('#ocrStatus');

    // --- File Handling ---
    dropzone.onclick = () => filePicker.click();
    filePicker.onchange = (e) => handleFiles(e.target.files);

    workspace.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    workspace.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
    });

    workspace.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    document.addEventListener('paste', handleGlobalPaste);

    function handleGlobalPaste(e) {
        if (!document.getElementById('ocrInputSection')) return;
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                handleFiles([item.getAsFile()]);
            }
        }
    }

    function handleFiles(files) {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage = e.target.result;
            mainImage.src = currentImage;
            workspace.querySelector('#ocrInputSection').style.display = 'none';
            workspace.querySelector('#ocrWorkspace').style.display = 'grid';

            mainImage.onload = () => {
                selection.active = false;
                updateSelectorUI();
            };
        };
        reader.readAsDataURL(file);
    }

    // --- Selector Logic ---
    function updateSelectorUI() {
        if (!selection.active) {
            selector.style.display = 'none';
            return;
        }
        selector.style.display = 'block';
        selector.style.left = `${selection.x}px`;
        selector.style.top = `${selection.y}px`;
        selector.style.width = `${selection.w}px`;
        selector.style.height = `${selection.h}px`;
    }

    imageWrapper.onmousedown = (e) => {
        e.preventDefault();
        const rect = imageWrapper.getBoundingClientRect();
        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const startRelX = startMouseX - rect.left;
        const startRelY = startMouseY - rect.top;

        // Check if we clicked a handle
        const handle = e.target.closest('.ocr-handle');
        if (handle) {
            isResizing = true;
            resizeHandle = handle.classList[1];
        } else if (e.target.closest('.ocr-selector')) {
            // Clicked inside selector but not handle -> Dragging
            isDragging = true;
        } else {
            // Clicked outside selector -> Start new selection
            selection.active = true;
            selection.x = startRelX;
            selection.y = startRelY;
            selection.w = 0;
            selection.h = 0;
            isResizing = true;
            resizeHandle = 'se'; // Act like we are dragging the bottom-right corner
            workspace.querySelector('#ocrImageHint').style.display = 'none';
        }

        const initialX = selection.x;
        const initialY = selection.y;
        const initialW = selection.w;
        const initialH = selection.h;

        const onMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startMouseX;
            const dy = moveEvent.clientY - startMouseY;

            if (isDragging) {
                selection.x = Math.max(0, Math.min(mainImage.clientWidth - selection.w, initialX + dx));
                selection.y = Math.max(0, Math.min(mainImage.clientHeight - selection.h, initialY + dy));
            } else if (isResizing) {
                if (resizeHandle.includes('e')) {
                    selection.w = Math.max(5, Math.min(mainImage.clientWidth - selection.x, initialW + dx));
                }
                if (resizeHandle.includes('s')) {
                    selection.h = Math.max(5, Math.min(mainImage.clientHeight - selection.y, initialH + dy));
                }
                if (resizeHandle.includes('w')) {
                    const newW = Math.max(5, initialW - dx);
                    const newX = initialX + dx;
                    if (newX >= 0 && newX <= initialX + initialW - 5) {
                        selection.x = newX;
                        selection.w = newW;
                    }
                }
                if (resizeHandle.includes('n')) {
                    const newH = Math.max(5, initialH - dy);
                    const newY = initialY + dy;
                    if (newY >= 0 && newY <= initialY + initialH - 5) {
                        selection.y = newY;
                        selection.h = newH;
                    }
                }
            }
            updateSelectorUI();
        };

        const onMouseUp = () => {
            isDragging = false;
            isResizing = false;
            if (selection.w < 5 || selection.h < 5) {
                // If selection is too small, maybe user just clicked. 
                // Don't kill it if it was an existing selection click, but if it's a new one, maybe reset?
                // For now, keep it as is.
            }
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // --- OCR Processing ---
    scanBtn.onclick = async () => {
        if (!currentImage) return;

        scanBtn.disabled = true;
        scanBtn.textContent = 'Processing...';
        status.textContent = 'Running OCR...';
        status.className = 'ocr-status processing';

        try {
            const text = await runStandaloneOCR();
            resultText.value = text;
            status.textContent = 'OCR Complete';
            status.className = 'ocr-status success';
            showToast('Text extracted successfully', 'success');
        } catch (err) {
            console.error('OCR Error:', err);
            status.textContent = 'Error occurred';
            status.className = 'ocr-status error';
            showToast('Failed to extract text', 'error');
        } finally {
            scanBtn.disabled = false;
            scanBtn.textContent = 'Extract Text';
        }
    };

    async function runStandaloneOCR() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const tempImg = new Image();

        await new Promise((resolve, reject) => {
            tempImg.onload = resolve;
            tempImg.onerror = reject;
            tempImg.src = currentImage;
        });

        const scaleX = tempImg.naturalWidth / mainImage.clientWidth;
        const scaleY = tempImg.naturalHeight / mainImage.clientHeight;

        canvas.width = selection.w * scaleX;
        canvas.height = selection.h * scaleY;

        ctx.drawImage(
            tempImg,
            selection.x * scaleX, selection.y * scaleY, selection.w * scaleX, selection.h * scaleY,
            0, 0, canvas.width, canvas.height
        );

        const croppedData = canvas.toDataURL('image/png');

        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(croppedData);
        await worker.terminate();

        return ret.data.text;
    }

    // --- Actions ---
    removeBtn.onclick = () => {
        currentImage = null;
        selection.active = false;
        resultText.value = '';
        workspace.querySelector('#ocrInputSection').style.display = 'flex';
        workspace.querySelector('#ocrWorkspace').style.display = 'none';
        status.textContent = 'Ready';
        status.className = 'ocr-status';
    };

    copyBtn.onclick = () => {
        if (resultText.value) {
            copyToClipboard(resultText.value);
            showToast('Text copied to clipboard', 'success');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (selection.active && selection.w > 5 && selection.h > 5 && !scanBtn.disabled) {
                scanBtn.click();
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    const originalDestroy = workspace.destroy;
    workspace.destroy = () => {
        document.removeEventListener('paste', handleGlobalPaste);
        window.removeEventListener('keydown', handleKeyDown);
        if (originalDestroy) originalDestroy();
    };
}
