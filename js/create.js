/*
 * This file has the overall initialization and general draw behavior for the
 * mask creation tool. It assumes other js files (see create.html > additional_js)
 * have been loaded first and that the create.html global canvas variables are
 * available.
 */


// load shared image design into DESIGN variable
function loadImageFromUrl(callback) {

    // load from design url
    // Format: "#<design_id>.urlsafe_base64(<decrypt_key>)"
    // Example: "#myrandomid.aaaaaaaabbbbbbbbbb"
    let designParams = window.location.hash.match(/^#([\w-]{3,})\.([\w-]{3,})$/);
    if (designParams) {
        let designId = designParams[1];
        let decryptKey = Base64Binary.decode(designParams[2].replace("-", "+").replace("_", "/"));

        //TODO: load the design from storage, decrypt it, and show it
        console.log(designId);
        console.log(decryptKey);

        callback();
    }

    // no design url so just call the callback
    else {
        callback();
    }
}


// redraw rendered images in the interface
function draw() {

    // resize designer canvas
    canvasDesign.width = canvasDesign.parentNode.offsetWidth;
    canvasDesign.height = canvasDesign.parentNode.offsetWidth > 400 ? 400 : 300; // slightly smaller for mobile

    // resize 3d render canvas
    canvas3d.width = canvas3d.parentNode.offsetWidth;
    canvas3d.height = 200;

    // resize pdf print preview canvas
    canvasPreview.width = canvasPreview.parentNode.offsetWidth;
    canvasPreview.height = 200;

    // reset transformations
    ctxDesign.setTransform(1, 0, 0, 1, 0, 0);
    ctx3d.setTransform(1, 0, 0, 1, 0, 0);
    ctxPreview.setTransform(1, 0, 0, 1, 0, 0);
    ctxPdf.setTransform(1, 0, 0, 1, 0, 0);

    // clear the designs
    ctxDesign.clearRect(0, 0, canvasDesign.width, canvasDesign.height);
    ctx3d.clearRect(0, 0, canvas3d.width, canvas3d.height);
    ctxPreview.clearRect(0, 0, canvasPreview.width, canvasPreview.height);
    ctxPdf.clearRect(0, 0, canvasPdf.width, canvasPdf.height);

    // clear the overlay
    dragOverlay.classList.add("d-none");

    // update the mask type
    switch (document.querySelector(".mask-type.btn-primary").id) {
        case "mask-curved":     DESIGN['maskType'] = "curved";      break;
        case "mask-flatfront":  DESIGN['maskType'] = "flatfront";   break;
        case "mask-pleated":    DESIGN['maskType'] = "pleated";     break;
    }

    // update the mask size
    switch (document.querySelector(".mask-size.active").id) {
        case "size-sm": DESIGN['maskSize'] = "small";   break;
        case "size-md": DESIGN['maskSize'] = "medium";  break;
        case "size-lg": DESIGN['maskSize'] = "large";   break;
    }

    // update the paper type and whether to reverse the printout
    switch (document.querySelector(".paper-type.active").id) {
        case "paper-ltr-iron":  DESIGN['paperType'] = "us-letter";  DESIGN['isReverse'] = true;     break;
        case "paper-ltr-trace": DESIGN['paperType'] = "us-letter";  DESIGN['isReverse'] = false;    break;
        case "paper-a4-iron":   DESIGN['paperType'] = "a4";         DESIGN['isReverse'] = true;     break;
        case "paper-a4-trace":  DESIGN['paperType'] = "a4";         DESIGN['isReverse'] = false;    break;
    }

    // draw new renderings of the mask
    switch (DESIGN['maskType']) {
        case "curved": drawCurved(); break;         // from masks/curved.js
        case "flatfront": drawFlatFront(); break;   // from masks/flat-front.js
        case "pleated": drawPleated(); break;       // from masks/pleated.js
    }
}


// util for drawing a line from a series of xy-coordinates
function drawLine(canvasObj, line, scaler) {
    scaler = scaler ? scaler : 1;
    canvasObj.moveTo(line[0][0] * scaler, line[0][1] * scaler);
    for (const xy of line.slice(1)) {
        canvasObj.lineTo(xy[0] * scaler, xy[1] * scaler);
    }
}


// undo/redo functionality
function saveUndo() {
    TMP['undo'].push({
        "maskType": DESIGN['maskType'],
        "maskSize": DESIGN['maskSize'],
        "paperType": DESIGN['paperType'],
        "isReverse": DESIGN['isReverse'],
        "imgCenter": [DESIGN['imgCenter'][0], DESIGN['imgCenter'][1]],
        "imgScaleX": DESIGN['imgScaleX'],
        "imgScaleY": DESIGN['imgScaleY'],
        "imgRotation": DESIGN['imgRotation'],
    });
    // clear the redo queue
    TMP['redo'] = [];
}

function undo(e) {
    if (e !== undefined) {
        e.preventDefault();
    }

    // at the beginning of the queue, so don't do anything
    if (TMP['undo'].length < 2) {
        return;
    }

    // pop off the current state and add it to the redo queue
    let currentChange = TMP['undo'].pop();
    TMP['redo'].push(currentChange);

    // get the next state (which is what the user wants to revert to)
    let prevChange = TMP['undo'][TMP['undo'].length - 1];

    // update the global design state
    DESIGN['maskType'] = prevChange['maskType'];
    DESIGN['maskSize'] = prevChange['maskSize'];
    DESIGN['paperType'] = prevChange['paperType'];
    DESIGN['isReverse'] = prevChange['isReverse'];
    DESIGN['imgCenter'] = [prevChange['imgCenter'][0], prevChange['imgCenter'][1]];
    DESIGN['imgScaleX'] = prevChange['imgScaleX'];
    DESIGN['imgScaleY'] = prevChange['imgScaleY'];
    DESIGN['imgRotation'] = prevChange['imgRotation'];

    // set the mask type/size/paper selections
    //TODO

    // redraw the image
    draw();
}

function redo(e) {
    if (e !== undefined) {
        e.preventDefault();
    }
    // pop off the latest redo state
    let nextChange = TMP['redo'].pop();
    if (nextChange !== undefined) {

        // update the global design state
        DESIGN['maskType'] = nextChange['maskType'];
        DESIGN['maskSize'] = nextChange['maskSize'];
        DESIGN['paperType'] = nextChange['paperType'];
        DESIGN['isReverse'] = nextChange['isReverse'];
        DESIGN['imgCenter'] = [nextChange['imgCenter'][0], nextChange['imgCenter'][1]];
        DESIGN['imgScaleX'] = nextChange['imgScaleX'];
        DESIGN['imgScaleY'] = nextChange['imgScaleY'];
        DESIGN['imgRotation'] = nextChange['imgRotation'];

        // set the mask type/size/paper selections
        //TODO

        // redraw the image
        draw();

        // add the state as the current in the undo queue
        TMP['undo'].push(nextChange);
    }
}
//TODO: make undo/redo prettier and show the only when available
document.getElementById("undo-button").addEventListener("click", undo);
document.getElementById("redo-button").addEventListener("click", redo);


// redraw when window is resized
let resizeTimeout;
window.onresize = function(){
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(draw, 200);
};


// mask style switcher
let maskCurved = document.getElementById("mask-curved");
let maskFlatFront = document.getElementById("mask-flatfront");
let maskPleated = document.getElementById("mask-pleated");
function switchMaskType(e) {
    e.preventDefault();

    // reset masks to unselected
    maskCurved.classList.remove("btn-primary");
    maskCurved.classList.add("btn-outline-secondary");
    maskFlatFront.classList.remove("btn-primary");
    maskFlatFront.classList.add("btn-outline-secondary");
    maskPleated.classList.remove("btn-primary");
    maskPleated.classList.add("btn-outline-secondary");

    // update the dropdown text and make current selection active
    switch (e.target.id) {
        case "mask-curved":
            maskCurved.classList.add("btn-primary");
            maskCurved.classList.remove("btn-outline-secondary");
            document.getElementById("pattern-coming-soon").classList.remove("d-none"); // TODO: remove when all patterns work
            break;
        case "mask-flatfront":
            maskFlatFront.classList.add("btn-primary");
            maskFlatFront.classList.remove("btn-outline-secondary");
            document.getElementById("pattern-coming-soon").classList.add("d-none"); // TODO: remove when all patterns work
            break;
        case "mask-pleated":
            maskPleated.classList.add("btn-primary");
            maskPleated.classList.remove("btn-outline-secondary");
            document.getElementById("pattern-coming-soon").classList.add("d-none"); // TODO: remove when all patterns work
            break;
    }

    // redraw using the updated mask type
    draw();
}
maskCurved.addEventListener("click", switchMaskType);
maskFlatFront.addEventListener("click", switchMaskType);
maskPleated.addEventListener("click", switchMaskType);


// size settings switcher
let sizeSelected = document.getElementById("size-selected");
let sizeSmall = document.getElementById("size-sm");
let sizeMedium = document.getElementById("size-md");
let sizeLarge = document.getElementById("size-lg");
function switchSize(e) {
    e.preventDefault();

    // remove current selection
    sizeSmall.classList.remove("active");
    sizeMedium.classList.remove("active");
    sizeLarge.classList.remove("active");

    // update the dropdown text and make current selection active
    switch (e.target.id) {
        case "size-sm":
            sizeSmall.classList.add("active");
            sizeSelected.innerText = "Size: Small";
            break;
        case "size-md":
            sizeMedium.classList.add("active");
            sizeSelected.innerText = "Size: Medium";
            break;
        case "size-lg":
            sizeLarge.classList.add("active");
            sizeSelected.innerText = "Size: Large";
            break;
    }

    // redraw using the updated mask type
    draw();
}
sizeSmall.addEventListener("click", switchSize);
sizeMedium.addEventListener("click", switchSize);
sizeLarge.addEventListener("click", switchSize);


// image import
function imageChanged(e) {
    e.preventDefault();

    // read in the image
    let imgFile = document.getElementById("img-input").files[0];
    let imgReader = new FileReader();
    imgReader.addEventListener("load", function () {

        // set the global image variable
        DESIGN['imgData'] = new Image();
        DESIGN['imgType'] = imgFile.type;

        // wait for the image to fully load
        DESIGN['imgData'].src = imgReader.result;
        DESIGN['imgData'].onload = function() {

            // clear any previous image positioning
            DESIGN['imgCenter'] = undefined;
            DESIGN['imgScaleX'] = undefined;
            DESIGN['imgScaleY'] = undefined;
            DESIGN['imgRotation'] = undefined;

            // clear the undo and redo queues
            TMP['undo'] = [];
            TMP['redo'] = [];

            // update the preview disclaimer
            showPreviewDisclaimer();

            // redraw the canvases
            draw();

            // save the first undo state
            saveUndo();

            // remove the add image overlay
            document.querySelector(".add-image-wrapper").classList.add("d-none");

            // show the change image option
            document.querySelector(".change-image-wrapper").classList.remove("d-none");
        }

    }, false);
    if (imgFile) {
        imgReader.readAsDataURL(imgFile);
    }


}
document.getElementById("img-input").addEventListener("change", imageChanged);


// user indicating they want to pick an image
function triggerFilePicker(e) {
    e.preventDefault();
    document.getElementById("img-input").click();
}
document.getElementById("add-image").addEventListener("click", triggerFilePicker);
document.getElementById("change-image").addEventListener("click", triggerFilePicker);


// allow user to switch to tracing or iron-on via preview disclaimer
let previewMirrored = document.getElementById("preview-mirrored");
let previewRightway = document.getElementById("preview-rightway");
function showPreviewDisclaimer() {
    previewMirrored.classList.add("d-none");
    previewRightway.classList.add("d-none");
    switch (document.querySelector(".paper-type.active").id) {
        case "paper-ltr-iron":  previewMirrored.classList.remove("d-none"); break;
        case "paper-ltr-trace": previewRightway.classList.remove("d-none"); break;
        case "paper-a4-iron":   previewMirrored.classList.remove("d-none"); break;
        case "paper-a4-trace":  previewRightway.classList.remove("d-none"); break;
    }
}
function flipPreview(e) {
    e.preventDefault();
    switch (document.querySelector(".paper-type.active").id) {
        case "paper-ltr-iron":  paperLtrTrace.click();  break;
        case "paper-ltr-trace": paperLtrIron.click();   break;
        case "paper-a4-iron":   paperA4Trace.click();   break;
        case "paper-a4-trace":  paperA4Iron.click();    break;
    }
}
previewMirrored.querySelector("a").addEventListener("click", flipPreview);
previewRightway.querySelector("a").addEventListener("click", flipPreview);


// paper settings switcher
let paperSelected = document.getElementById("paper-selected");
let paperLtrIron = document.getElementById("paper-ltr-iron");
let paperLtrTrace = document.getElementById("paper-ltr-trace");
let paperA4Iron = document.getElementById("paper-a4-iron");
let paperA4Trace = document.getElementById("paper-a4-trace");
function switchPaper(e) {
    e.preventDefault();

    // remove current selection
    paperLtrIron.classList.remove("active");
    paperLtrTrace.classList.remove("active");
    paperA4Iron.classList.remove("active");
    paperA4Trace.classList.remove("active");

    // update the dropdown text and make current selection active
    switch (e.target.id) {
        case "paper-ltr-iron":
            paperLtrIron.classList.add("active");
            paperSelected.innerText = "Paper: US Letter (iron-on)";
            break;
        case "paper-ltr-trace":
            paperLtrTrace.classList.add("active");
            paperSelected.innerText = "Paper: US Letter (for tracing)";
            break;
        case "paper-a4-iron":
            paperA4Iron.classList.add("active");
            paperSelected.innerText = "Paper: A4 (iron-on)";
            break;
        case "paper-a4-trace":
            paperA4Trace.classList.add("active");
            paperSelected.innerText = "Paper: A4 (for tracing)";
            break;
    }

    // update the preview disclaimer
    showPreviewDisclaimer();

    // redraw using the updated paper selection
    draw();
}
paperLtrIron.addEventListener("click", switchPaper);
paperLtrTrace.addEventListener("click", switchPaper);
paperA4Iron.addEventListener("click", switchPaper);
paperA4Trace.addEventListener("click", switchPaper);


// download button functionality
function downloadPdf(e) {
    e.preventDefault();
    TMP['pdf'].save("mask_template.pdf");
}
document.getElementById("download-pdf").addEventListener("click", downloadPdf);
canvasPreview.addEventListener("click", downloadPdf); // clicking on the preview will also download the pdf


// unique design url generator
//TODO


// copy listener for copying unique design url
document.getElementById("copy-link").addEventListener("click", function(e){
    e.preventDefault();
    let input = document.getElementById("share-link");
    input.focus();
    input.select();
    try {
        let result = document.execCommand("copy");
        if(result) {
            input.blur();
            document.getElementById("copy-link-default").classList.add("d-none");
            document.getElementById("copy-link-copied").classList.remove("d-none");
            window.setTimeout(function(){
                document.getElementById("copy-link-default").classList.remove("d-none");
                document.getElementById("copy-link-copied").classList.add("d-none");
            }, 500);
        }
    } catch (err) {
        console.log("[Debug] Error copying link", err);
    }
});


// iframe functionality
//TODO


// postMessage functionality
//TODO

