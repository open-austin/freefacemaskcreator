
// move start
document.getElementById("move-area").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "move";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
// move calculations
function moveImg(mouseX, mouseY) {
    // move the overlay around with the mouse
    let diffX = mouseX - TMP['dragStartX'];
    let diffY = mouseY - TMP['dragStartY'];
    let newX = TMP['offsetX'] + (TMP['imgX'] * TMP['designScale']) + diffX;
    let newY = TMP['offsetY'] + (TMP['imgY'] * TMP['designScale']) + diffY;
    dragOverlay.style.left = parseInt(Math.round(newX, 0)) + "px";
    dragOverlay.style.top = parseInt(Math.round(newY, 0)) + "px";
    // recalculate the center of the dragged image in relation to the design dimensions
    let newCenterX = (TMP['imgX'] + (diffX / TMP['designScale']) + (TMP['imgW'] / 2.0)) / TMP['designWidth'];
    let newCenterY = (TMP['imgY'] + (diffY / TMP['designScale']) + (TMP['imgH'] / 2.0)) / TMP['designHeight'];
    DESIGN['imgCenter'] = [newCenterX, newCenterY];
}

// rotate start
document.getElementById("rotate-circle").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "rotate";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
function rotateImg(mouseX, mouseY) {
    // rotate the overlay around with the mouse
    let canvasCoords = document.getElementById("canvas-design").getBoundingClientRect();
    let designX = canvasCoords.x + TMP['offsetX'];
    let designY = canvasCoords.y + TMP['offsetY'];
    let imgCenterX = designX + ((TMP['imgX'] + (TMP['imgW'] / 2.0)) * TMP['designScale']);
    let imgCenterY = designY + ((TMP['imgY'] + (TMP['imgH'] / 2.0)) * TMP['designScale']);
    let opposite = mouseX - imgCenterX;
    let adjacent = imgCenterY - mouseY;
    // rotate the overlay around with the mouse
    let rot = Math.atan(opposite / adjacent) * 180.0 / Math.PI;
    if (opposite >= 0 && adjacent < 0) {
        rot = 180.0 + rot;
    } else if (opposite < 0 && adjacent < 0) {
        rot = rot + 180.0;
    } else if (opposite < 0 && adjacent > 0) {
        rot = 360.0 + rot;
    }
    rot = Math.round(rot, 2);
    dragOverlay.style.transform = "rotate(" + rot + "deg)";
    // set the rotation in image settings
    DESIGN['imgRotation'] = rot;
}

// scale from corners
document.getElementById("corner-top-left").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "scale-top-left";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
document.getElementById("corner-top-right").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "scale-top-right";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
document.getElementById("corner-bottom-left").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "scale-bottom-left";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
document.getElementById("corner-bottom-right").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "scale-bottom-right";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
function scaleCorner(mouseX, mouseY, corner) {
    // un-rotate the corner for easier scaling calc
    let canvasCoords = document.getElementById("canvas-design").getBoundingClientRect();
    let designX = canvasCoords.x + TMP['offsetX'];
    let designY = canvasCoords.y + TMP['offsetY'];
    let imgCenterX = designX + ((TMP['imgX'] + (TMP['imgW'] / 2.0)) * TMP['designScale']);
    let imgCenterY = designY + ((TMP['imgY'] + (TMP['imgH'] / 2.0)) * TMP['designScale']);
    // adjust mouse to image center as origin
    let adjustedMouseX = mouseX - imgCenterX;
    let adjustedMouseY = imgCenterY - mouseY;
    // rotate around that origin to get the point where the mouse would have been if not for the rotation
    let rotatedMouseX = (adjustedMouseX * Math.cos(DESIGN['imgRotation'] * Math.PI / 180.0)) - (adjustedMouseY * Math.sin(DESIGN['imgRotation'] * Math.PI / 180.0));
    if (corner === "top-left" || corner === "bottom-left") {
        rotatedMouseX = -1 * rotatedMouseX; // left corners have negative x values compared to the image center
    }
    // determine the horizontal movement of the mouse drag from that corner
    let diffX = rotatedMouseX - (TMP['imgW'] / 2.0) * TMP['designScale'];
    // scale based on the rotated x coordinate compared
    let newScale = (TMP['imgW'] + (diffX / TMP['designScale'])) / TMP['imgW'];
    // calculate the image's new size and position in the design scale
    let newImgW = TMP['imgW'] * newScale;
    let newImgH = TMP['imgH'] * newScale;
    let newImgX = undefined;
    let newImgY = undefined;
    switch (corner) {
        case "top-left":
            newImgX = TMP['imgX'] + TMP['imgW'] - newImgW;
            newImgY = TMP['imgY'] + TMP['imgH'] - newImgH;
            break;
        case "top-right":
            newImgX = TMP['imgX'];
            newImgY = TMP['imgY'] + TMP['imgH'] - newImgH;
            break;
        case "bottom-left":
            newImgX = TMP['imgX'] + TMP['imgW'] - newImgW;
            newImgY = TMP['imgY'];
            break;
        case "bottom-right":
            newImgX = TMP['imgX'];
            newImgY = TMP['imgY'];
            break;
    }
    // update the overlay size and position based on the updated image position
    dragOverlay.style.left = parseInt(Math.round(TMP['offsetX'] + (newImgX * TMP['designScale']), 0)) + "px";
    dragOverlay.style.top = parseInt(Math.round(TMP['offsetY'] + (newImgY * TMP['designScale']), 0)) + "px";
    dragOverlay.style.width = parseInt(Math.round(newImgW * TMP['designScale'], 0)) + "px";
    dragOverlay.style.height = parseInt(Math.round(newImgH * TMP['designScale'], 0)) + "px";
    // update the image scale to match the adjusted scale
    DESIGN['imgScaleX'] = newImgW / DESIGN['imgData'].width;
    DESIGN['imgScaleY'] = newImgH / DESIGN['imgData'].height;
    // update the deign's center anchor based on new scale and position
    DESIGN['imgCenter'][0] = (newImgX + (newImgW / 2.0)) / TMP['designWidth'];
    DESIGN['imgCenter'][1] = (newImgY + (newImgH / 2.0)) / TMP['designHeight'];
}

// scale from edges
document.getElementById("edge-top").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "scale-top";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
document.getElementById("edge-bottom").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "scale-bottom";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
document.getElementById("edge-left").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "scale-left";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
document.getElementById("edge-right").addEventListener("mousedown", function(e) {
    TMP['dragType'] = "scale-right";
    TMP['dragStartX'] = e.pageX;
    TMP['dragStartY'] = e.pageY;
});
function scaleEdge(mouseX, mouseY, edge) {
    // un-rotate the edge for easier scaling calc
    let canvasCoords = document.getElementById("canvas-design").getBoundingClientRect();
    let designX = canvasCoords.x + TMP['offsetX'];
    let designY = canvasCoords.y + TMP['offsetY'];
    let imgCenterX = designX + ((TMP['imgX'] + (TMP['imgW'] / 2.0)) * TMP['designScale']);
    let imgCenterY = designY + ((TMP['imgY'] + (TMP['imgH'] / 2.0)) * TMP['designScale']);
    // adjust mouse to image center as origin
    let adjustedMouseX = mouseX - imgCenterX;
    let adjustedMouseY = imgCenterY - mouseY;
    // calculate the new scaling factor based on which edge is being scaled
    let rotatedMouse = undefined;
    let diff = undefined;
    let newScale = undefined;
    let newImgW = undefined;
    let newImgH = undefined;
    let newImgX = undefined;
    let newImgY = undefined;
    switch (edge) {
        case "left":
            // find the amound of movement from the original edge based on rotated mouse coords
            rotatedMouse = (adjustedMouseX * Math.cos(DESIGN['imgRotation'] * Math.PI / 180.0)) - (adjustedMouseY * Math.sin(DESIGN['imgRotation'] * Math.PI / 180.0));
            diff = -1 * (TMP['imgW'] / 2.0) * TMP['designScale'] - rotatedMouse;
            newScale = (TMP['imgW'] + (diff / TMP['designScale'])) / TMP['imgW'];
            // calculate the new positioning for the image
            newImgW = TMP['imgW'] * newScale;
            newImgH = TMP['imgH'];
            newImgX = TMP['imgX'] + TMP['imgW'] - newImgW;
            newImgY = TMP['imgY'];
            // set the new scaling factor
            DESIGN['imgScaleX'] = newImgW / DESIGN['imgData'].width;
            break;
        case "right":
            // find the amound of movement from the original edge based on rotated mouse coords
            rotatedMouse = (adjustedMouseX * Math.cos(DESIGN['imgRotation'] * Math.PI / 180.0)) - (adjustedMouseY * Math.sin(DESIGN['imgRotation'] * Math.PI / 180.0));
            diff = -1 * (TMP['imgW'] / 2.0) * TMP['designScale'] + rotatedMouse;
            newScale = (TMP['imgW'] + (diff / TMP['designScale'])) / TMP['imgW'];
            // calculate the new positioning for the image
            newImgW = TMP['imgW'] * newScale;
            newImgH = TMP['imgH'];
            newImgX = TMP['imgX'];
            newImgY = TMP['imgY'];
            // set the new scaling factor
            DESIGN['imgScaleX'] = newImgW / DESIGN['imgData'].width;
            break;
        case "top":
            // find the amound of movement from the original edge based on rotated mouse coords
            rotatedMouse = (adjustedMouseX * Math.sin(DESIGN['imgRotation'] * Math.PI / 180.0)) + (adjustedMouseY * Math.cos(DESIGN['imgRotation'] * Math.PI / 180.0));
            diff = -1 * (TMP['imgH'] / 2.0) * TMP['designScale'] + rotatedMouse;
            newScale = (TMP['imgH'] + (diff / TMP['designScale'])) / TMP['imgH'];
            // calculate the new positioning for the image
            newImgW = TMP['imgW'];
            newImgH = TMP['imgH'] * newScale;
            newImgX = TMP['imgX'];
            newImgY = TMP['imgY'] + TMP['imgH'] - newImgH;
            // set the new scaling factor
            DESIGN['imgScaleY'] = newImgH / DESIGN['imgData'].height;
            break;
        case "bottom":
            // find the amound of movement from the original edge based on rotated mouse coords
            rotatedMouse = (adjustedMouseX * Math.sin(DESIGN['imgRotation'] * Math.PI / 180.0)) + (adjustedMouseY * Math.cos(DESIGN['imgRotation'] * Math.PI / 180.0));
            diff = (TMP['imgH'] / 2.0) * TMP['designScale'] + rotatedMouse;
            newScale = (TMP['imgH'] - (diff / TMP['designScale'])) / TMP['imgH'];
            console.log("rotatedMouse", rotatedMouse, "diff", diff);
            // calculate the new positioning for the image
            newImgW = TMP['imgW'];
            newImgH = TMP['imgH'] * newScale;
            newImgX = TMP['imgX'];
            newImgY = TMP['imgY'];
            // set the new scaling factor
            DESIGN['imgScaleY'] = newImgH / DESIGN['imgData'].height;
            break;
    }
    // update the overlay size and position based on the updated image position
    dragOverlay.style.left = parseInt(Math.round(TMP['offsetX'] + (newImgX * TMP['designScale']), 0)) + "px";
    dragOverlay.style.top = parseInt(Math.round(TMP['offsetY'] + (newImgY * TMP['designScale']), 0)) + "px";
    dragOverlay.style.width = parseInt(Math.round(newImgW * TMP['designScale'], 0)) + "px";
    dragOverlay.style.height = parseInt(Math.round(newImgH * TMP['designScale'], 0)) + "px";
    // update the deign's center anchor based on new scale and position
    DESIGN['imgCenter'][0] = (newImgX + (newImgW / 2.0)) / TMP['designWidth'];
    DESIGN['imgCenter'][1] = (newImgY + (newImgH / 2.0)) / TMP['designHeight'];
}

// drag start
document.getElementsByTagName("body")[0].addEventListener("mousemove", function(e) {
    switch (TMP['dragType']) {
        case "move":                moveImg(e.pageX, e.pageY);                      break;
        case "rotate":              rotateImg(e.pageX, e.pageY);                    break;
        case "scale-top":           scaleEdge(e.pageX, e.pageY, "top");             break;
        case "scale-bottom":        scaleEdge(e.pageX, e.pageY, "bottom");          break;
        case "scale-left":          scaleEdge(e.pageX, e.pageY, "left");            break;
        case "scale-right":         scaleEdge(e.pageX, e.pageY, "right");           break;
        case "scale-top-left":      scaleCorner(e.pageX, e.pageY, "top-left");      break;
        case "scale-top-right":     scaleCorner(e.pageX, e.pageY, "top-right");     break;
        case "scale-bottom-left":   scaleCorner(e.pageX, e.pageY, "bottom-left");   break;
        case "scale-bottom-right":  scaleCorner(e.pageX, e.pageY, "bottom-right");  break;
        case undefined:             break; // do nothing if not currently dragging
    }
});
// drag end
document.getElementsByTagName("body")[0].addEventListener("mouseup", function(e) {
    if (TMP['dragType'] !== undefined) {

        // save movement to UNDO queue
        saveUndo();

        // send final update to redraw the image
        draw();

        // reset the drag cache
        TMP['dragType'] = undefined;
        TMP['dragStartX'] = undefined;
        TMP['dragStartY'] = undefined;
    }
});

