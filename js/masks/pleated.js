// render the pleated mask type
function drawPleated() {

    ///////////////////
    // Design Canvas //
    ///////////////////

    // lines have rounded corners by default
    ctxDesign.lineJoin = "round";

    // determine the template size based on the mask size
    let patternOutline = undefined;
    let patternSeam = undefined;
    let patternFoldTop = undefined;
    let patternFoldMiddle = undefined;
    let patternFoldBottom = undefined;
    switch (DESIGN['maskSize']) {
        case "small":
            TMP['designWidth'] = 750;  // 7.5"
            TMP['designHeight'] = 550; // 5.5"
            patternOutline = [[0, 0], [750, 0], [750, 550], [0, 550]];
            patternSeam = [[275, 525], [50, 525], [50, 25], [700, 25], [700, 525], [475, 525]];
            patternFoldTop = [[50, 100], [700, 100], [700, 175], [50, 175]];
            patternFoldMiddle = [[50, 225], [700, 225], [700, 300], [50, 300]];
            patternFoldBottom = [[50, 350], [700, 350], [700, 425], [50, 425]];
            break;
        case "medium":
            TMP['designWidth'] = 825;  // 8.25"
            TMP['designHeight'] = 625; // 6.25"
            patternOutline = [[0, 0], [825, 0], [825, 625], [0, 625]];
            patternSeam = [[300, 600], [50, 600], [50, 25], [775, 25], [775, 600], [475, 600]];
            patternFoldTop = [[50, 125], [775, 125], [775, 225], [50, 225]];
            patternFoldMiddle = [[50, 275], [775, 275], [775, 375], [50, 375]];
            patternFoldBottom = [[50, 425], [775, 425], [775, 525], [50, 525]];
            break;
        case "large":
            TMP['designWidth'] = 900; // 9"
            TMP['designHeight'] = 700; // 7"
            patternOutline = [[0, 0], [900, 0], [900, 700], [0, 700]];
            patternSeam = [[300, 675], [50, 675], [50, 25], [850, 25], [850, 675], [600, 675]];
            patternFoldTop = [[50, 175], [850, 175], [850, 275], [50, 275]];
            patternFoldMiddle = [[50, 325], [850, 325], [850, 425], [50, 425]];
            patternFoldBottom = [[50, 475], [850, 475], [850, 575], [50, 575]];
            break;
    }

    // set the canvas scaling and centering based on the mask design size
    TMP['designScale'] = canvasDesign.width / TMP['designWidth'];
    if ((TMP['designScale'] * TMP['designHeight']) > canvasDesign.height) {
        TMP['designScale'] = canvasDesign.height / TMP['designHeight'];
    }
    TMP['designScale'] = TMP['designScale'] * 0.8; // shrink scaling slightly smaller than canvas size
    TMP['offsetX'] = (canvasDesign.width - (TMP['designScale'] * TMP['designWidth'])) / 2.0;
    TMP['offsetY'] = (canvasDesign.height - (TMP['designScale'] * TMP['designHeight'])) / 2.0;
    ctxDesign.translate(TMP['offsetX'], TMP['offsetY']);
    ctxDesign.scale(TMP['designScale'], TMP['designScale']);

    // draw user-added image
    if (DESIGN['imgData']) {

        // default scale and center positioning if not yet set
        if (DESIGN['imgCenter'] === undefined) {
            DESIGN['imgScaleX'] = Math.min(
                TMP['designWidth'] / DESIGN['imgData'].width,
                TMP['designHeight'] / DESIGN['imgData'].height,
            );
            DESIGN['imgScaleY'] = DESIGN['imgScaleX'];
            DESIGN['imgCenter'] = [0.5, 0.5];
            DESIGN['imgRotation'] = 0;
        }

        // convert the centering and scale to xy-coords
        TMP['imgW'] = DESIGN['imgScaleX'] * DESIGN['imgData'].width;
        TMP['imgH'] = DESIGN['imgScaleY'] * DESIGN['imgData'].height;
        TMP['imgX'] = DESIGN['imgCenter'][0] * TMP['designWidth'] - (TMP['imgW'] / 2);
        TMP['imgY'] = DESIGN['imgCenter'][1] * TMP['designHeight'] - (TMP['imgH'] / 2);

        // draw the rotated image
        ctxDesign.save();
        ctxDesign.translate((DESIGN['imgCenter'][0] * TMP['designWidth']), (DESIGN['imgCenter'][1] * TMP['designHeight']));
        ctxDesign.rotate(DESIGN['imgRotation'] * Math.PI / 180);
        ctxDesign.translate(-1 * (DESIGN['imgCenter'][0] * TMP['designWidth']), -1 * (DESIGN['imgCenter'][1] * TMP['designHeight']));
        ctxDesign.drawImage(DESIGN['imgData'], TMP['imgX'], TMP['imgY'], TMP['imgW'], TMP['imgH']);
        ctxDesign.restore();

        // reposition resize/moving/rotating overlay
        dragOverlay.style.left = parseInt(Math.round(TMP['offsetX'] + (TMP['imgX'] * TMP['designScale']), 0)) + "px";
        dragOverlay.style.top = parseInt(Math.round(TMP['offsetY'] + (TMP['imgY'] * TMP['designScale']), 0)) + "px";
        dragOverlay.style.width = parseInt(Math.round(TMP['imgW'] * TMP['designScale'], 0)) + "px";
        dragOverlay.style.height = parseInt(Math.round(TMP['imgH'] * TMP['designScale'], 0)) + "px";
        dragOverlay.style.transform = "rotate(" + DESIGN['imgRotation'] + "deg)";
        dragOverlay.classList.remove("d-none");
    }

    // draw pattern outline
    ctxDesign.beginPath();
    drawLine(ctxDesign, patternOutline);
    ctxDesign.closePath();
    ctxDesign.lineWidth = 2 / TMP['designScale'];
    ctxDesign.stroke();

    // draw the seam
    ctxDesign.setLineDash([5 / TMP['designScale'], 10 / TMP['designScale']]);
    ctxDesign.lineWidth = 1 / TMP['designScale'];
    ctxDesign.strokeStyle = "rgb(255, 0, 0)";

    ctxDesign.beginPath();
    drawLine(ctxDesign, patternSeam);
    ctxDesign.stroke();

    // render a hatch pattern for fold areas
    const hatchingCanvas = document.createElement('canvas');
    const hatchingContext = hatchingCanvas.getContext('2d');
    hatchingCanvas.width = TMP['designHeight'] / 10;
    hatchingCanvas.height = TMP['designHeight'] / 10;
    hatchingContext.setLineDash([5 / TMP['designScale'], 10 / TMP['designScale']]);
    hatchingContext.lineWidth = 1 / TMP['designScale'];
    hatchingContext.strokeStyle = "rgb(255, 0, 0)";
    hatchingContext.moveTo(0, hatchingCanvas.height);
    hatchingContext.lineTo(hatchingCanvas.width, 0);
    hatchingContext.stroke();
    const hatching = ctxDesign.createPattern(hatchingCanvas, 'repeat');

    // draw the fold areas
    ctxDesign.setLineDash([5 / TMP['designScale'], 10 / TMP['designScale']]);
    ctxDesign.lineWidth = 1 / TMP['designScale'];
    ctxDesign.strokeStyle = "rgb(255, 0, 0)";
    ctxDesign.fillStyle = hatching;

    ctxDesign.beginPath();
    drawLine(ctxDesign, patternFoldTop);
    ctxDesign.closePath();
    ctxDesign.stroke();
    ctxDesign.fill();

    ctxDesign.beginPath();
    drawLine(ctxDesign, patternFoldMiddle);
    ctxDesign.closePath();
    ctxDesign.stroke();
    ctxDesign.fill();

    ctxDesign.beginPath();
    drawLine(ctxDesign, patternFoldBottom);
    ctxDesign.closePath();
    ctxDesign.stroke();
    ctxDesign.fill();

    ///////////////
    // 3D Render //
    ///////////////

    //TODO

    /////////////////////
    // Print Preview //
    /////////////////////

    // lines have rounded corners by default
    ctxPreview.lineJoin = "round";

    // determine the template size based on the mask size
    let pdfWidth = undefined;
    let pdfHeight = undefined;
    let jsPdfFormat = undefined;
    switch (DESIGN['paperType']) {
        case "us-letter":
            pdfWidth = 1100; // 11"
            pdfHeight = 850; // 8.5"
            jsPdfFormat = "letter";
            break;
        case "a4":
            pdfWidth = 1170; // 11.7"
            pdfHeight = 827; // 8.27"
            jsPdfFormat = "a4";
            break;
    }

    // set the canvas scaling and centering based on the mask design size
    let previewScale = canvasPreview.width / pdfWidth;
    if ((previewScale * pdfHeight) > canvasPreview.height) {
        previewScale = canvasPreview.height / pdfHeight;
    }
    previewScale = previewScale * 0.9; // shrink scaling slightly smaller than canvas size
    const previewOffsetX = (canvasPreview.width - (previewScale * pdfWidth)) / 2.0;
    const previewOffsetY = (canvasPreview.height - (previewScale * pdfHeight)) / 2.0;
    ctxPreview.translate(previewOffsetX, previewOffsetY);
    ctxPreview.scale(previewScale, previewScale);

    // draw page outline
    ctxPreview.save();
    ctxPreview.beginPath();
    ctxPreview.moveTo(0, 0);
    ctxPreview.lineTo(pdfWidth, 0);
    ctxPreview.lineTo(pdfWidth, pdfHeight);
    ctxPreview.lineTo(0, pdfHeight);
    ctxPreview.closePath();
    ctxPreview.fillStyle = 'white';
    ctxPreview.shadowColor = '#999';
    ctxPreview.shadowBlur = 10;
    ctxPreview.shadowOffsetX = 5;
    ctxPreview.shadowOffsetY = 5;
    ctxPreview.strokeStyle = "rgb(200,200,200)";
    ctxPreview.stroke();
    ctxPreview.fill();
    ctxPreview.restore();

    // flip the pattern if an iron-on transfer
    if (DESIGN['isReverse']) {
        ctxPreview.scale(-1, 1);
        ctxPreview.translate(-1 * pdfWidth, 0);
    }

    // move to centered pattern
    const patternOffsetX = (pdfWidth - TMP['designWidth']) / 2.0;
    const patternOffsetY = (pdfHeight - TMP['designHeight']) / 2.0;
    ctxPreview.translate(patternOffsetX, patternOffsetY);

    // draw print preview image
    if (DESIGN['imgData']) {
        // set save point pre-clipping
        ctxPreview.save();

        // clipping region for the image
        ctxPreview.beginPath();
        drawLine(ctxPreview, patternOutline);
        ctxPreview.closePath();
        ctxPreview.clip();

        // draw the rotated image (will get clipped)
        ctxPreview.save();
        ctxPreview.translate((DESIGN['imgCenter'][0] * TMP['designWidth']), (DESIGN['imgCenter'][1] * TMP['designHeight']));
        ctxPreview.rotate(DESIGN['imgRotation'] * Math.PI / 180);
        ctxPreview.translate(-1 * (DESIGN['imgCenter'][0] * TMP['designWidth']), -1 * (DESIGN['imgCenter'][1] * TMP['designHeight']));
        ctxPreview.drawImage(DESIGN['imgData'], TMP['imgX'], TMP['imgY'], TMP['imgW'], TMP['imgH']);
        ctxPreview.restore();

        // revert clipping
        ctxPreview.restore();
    }

    // draw pattern outline
    ctxPreview.beginPath();
    drawLine(ctxPreview, patternOutline);
    ctxPreview.closePath();
    ctxPreview.lineWidth = 1 / previewScale;
    ctxPreview.strokeStyle = "rgb(100, 100, 100)";
    ctxPreview.stroke();

    //////////////////
    // PDF Download //
    //////////////////

    // create a pdf file for download
    TMP['pdf'] = new jsPDF({
        "unit": "in",
        "orientation": "portrait",
        "format": jsPdfFormat,
    });

    // resize and clear the canvas that will be used for rendering the first pdf page
    const pdfScale = 2.0; // make pdf image render resolution 200 pixels per inch
    const pdfPadding = 10; // 0.1" padding to allow for stroke widths to show
    canvasPdf.width = (TMP['designHeight'] + pdfPadding) * pdfScale; // flipped width/height since pdf is in portrait mode
    canvasPdf.height = (TMP['designWidth'] + pdfPadding) * pdfScale; // flipped width/height since pdf is in portrait mode
    ctxPdf.setTransform(1, 0, 0, 1, 0, 0);
    ctxPdf.clearRect(0, 0, canvasPdf.width, canvasPdf.height);

    // fill canvas with white background
    ctxPdf.save();
    ctxPdf.fillStyle = "white";
    ctxPdf.fillRect(0, 0, canvasPdf.width, canvasPdf.height);
    ctxPdf.restore();

    // center the padding
    ctxPdf.translate(pdfPadding / 2.0, pdfPadding / 2.0);
    ctxPdf.scale(pdfScale, pdfScale);

    // rotate to fit portrait mode
    ctxPdf.rotate(90 * Math.PI / 180);
    ctxPdf.translate(0, -1 * TMP['designHeight']);

    // flip the pattern if an iron-on transfer
    if (DESIGN['isReverse']) {
        ctxPdf.scale(-1, 1);
        ctxPdf.translate(-1 * TMP['designWidth'], 0);
    }

    // draw print preview image
    if (DESIGN['imgData']) {
        // set save point pre-clipping
        ctxPdf.save();

        // clipping region for the image
        ctxPdf.beginPath();
        drawLine(ctxPdf, patternOutline);
        ctxPdf.closePath();
        ctxPdf.clip();

        // draw the rotated image (will get clipped)
        ctxPdf.save();
        ctxPdf.translate((DESIGN['imgCenter'][0] * TMP['designWidth']), (DESIGN['imgCenter'][1] * TMP['designHeight']));
        ctxPdf.rotate(DESIGN['imgRotation'] * Math.PI / 180);
        ctxPdf.translate(-1 * (DESIGN['imgCenter'][0] * TMP['designWidth']), -1 * (DESIGN['imgCenter'][1] * TMP['designHeight']));
        ctxPdf.drawImage(DESIGN['imgData'], TMP['imgX'], TMP['imgY'], TMP['imgW'], TMP['imgH']);
        ctxPdf.restore();

        // revert clipping
        ctxPdf.restore();
    }

    // draw pattern outline
    ctxPdf.beginPath();
    drawLine(ctxPdf, patternOutline);
    ctxPdf.closePath();
    ctxPdf.lineWidth = 2;
    ctxPdf.strokeStyle = "rgb(100, 100, 100)";
    ctxPdf.stroke();

    // insert image render into the pdf
    const pdfImg = canvasPdf.toDataURL("image/jpeg", 0.95);
    const pdfOffsetX = (pdfHeight - (TMP['designHeight'] + pdfPadding)) / 2.0 / 100.0;
    const pdfOffsetY = (pdfWidth - (TMP['designWidth'] + pdfPadding)) / 2.0 / 100.0;
    TMP['pdf'].addImage(pdfImg, "JPEG", pdfOffsetX, pdfOffsetY, (TMP['designHeight'] + pdfPadding) / 100.0, (TMP['designWidth'] + pdfPadding) / 100.0);

}
