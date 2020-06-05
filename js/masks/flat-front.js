// render the flat-front mask type
function drawFlatFront() {

    ///////////////////
    // Design Canvas //
    ///////////////////

    // lines have rounded corners by default
    ctxDesign.lineJoin = "round";

    // determine the template size based on the mask size
    let patternOutline = undefined;
    let patternFront = undefined;
    let patternSeamTop = undefined;
    let patternSeamBottom = undefined;
    switch (DESIGN['maskSize']) {
        case "small":
            TMP['designWidth'] = 800;  // 8"
            TMP['designHeight'] = 600; // 6"
            patternOutline = [[175, 0], [625, 0], [800, 150], [800, 450], [625, 600], [175, 600], [0, 450], [0, 150]];
            patternFront = [[100, 150], [700, 150], [700, 450], [100, 450]];
            patternSeamTop = [[45, 155], [190, 30], [610, 30], [755, 155]];
            patternSeamBottom = [[45, 445], [190, 570], [610, 570], [755, 445]];
            break;
        case "medium":
            TMP['designWidth'] = 900;  // 9"
            TMP['designHeight'] = 700; // 7"
            patternOutline = [[225, 0], [675, 0], [900, 175], [900, 525], [675, 700], [225, 700], [0, 525], [0, 175]];
            patternFront = [[100, 175], [800, 175], [800, 525], [100, 525]];
            patternSeamTop = [[45, 180], [240, 30], [660, 30], [855, 180]];
            patternSeamBottom = [[45, 520], [240, 670], [660, 670], [855, 520]];
            break;
        case "large":
            TMP['designWidth'] = 1000; // 10"
            TMP['designHeight'] = 800; // 8"
            patternOutline = [[250, 0], [750, 0], [1000, 200], [1000, 600], [750, 800], [250, 800], [0, 600], [0, 200]];
            patternFront = [[100, 200], [900, 200], [900, 600], [100, 600]];
            patternSeamTop = [[40, 205], [255, 30], [745, 30], [960, 205]];
            patternSeamBottom = [[40, 595], [255, 770], [745, 770], [960, 595]];
            break;
    }

    // set the canvas scaling and centering based on the mask design size
    TMP['designScale'] = canvasDesign.width / TMP['designWidth'];
    if ((TMP['designScale'] * TMP['designHeight']) > canvasDesign.height) {
        TMP['designScale'] = canvasDesign.height / TMP['designHeight'];
    }
    TMP['designScale'] = TMP['designScale'] * 0.9; // shrink scaling slightly smaller than canvas size
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

    // seams and front are dotted lines
    ctxDesign.setLineDash([5 / TMP['designScale'], 10 / TMP['designScale']]);
    ctxDesign.lineWidth = 1 / TMP['designScale'];
    ctxDesign.strokeStyle = "rgb(255, 0, 0)";

    // draw seam lines
    ctxDesign.beginPath();
    drawLine(ctxDesign, patternSeamTop);
    ctxDesign.stroke();

    ctxDesign.beginPath();
    drawLine(ctxDesign, patternSeamBottom);
    ctxDesign.stroke();

    // draw front area
    ctxDesign.beginPath();
    drawLine(ctxDesign, patternFront);
    ctxDesign.closePath();
    ctxDesign.stroke();

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

        // draw image that gets clipped
        ctxPreview.drawImage(DESIGN['imgData'], TMP['imgX'], TMP['imgY'], TMP['imgW'], TMP['imgH']);

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

        // draw image that gets clipped
        ctxPdf.drawImage(DESIGN['imgData'], TMP['imgX'], TMP['imgY'], TMP['imgW'], TMP['imgH']);

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

