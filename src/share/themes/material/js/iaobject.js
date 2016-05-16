//   This program is free software: you can redistribute it and/or modify
//   it under the terms of the GNU General Public License as published by
//   the Free Software Foundation, either version 3 of the License, or
//   (at your option) any later version.
//   This program is distributed in the hope that it will be useful,
//   but WITHOUT ANY WARRANTY; without even the implied warranty of
//   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//   GNU General Public License for more details.
//   You should have received a copy of the GNU General Public License
//   along with this program.  If not, see <http://www.gnu.org/licenses/>
//
//
// @author : pascal.fautrero@ac-versailles.fr


/*
 *
 * @param {object} params
 * @constructor create image active object
 */
function IaObject(params) {
    "use strict";
    var that = this;
    this.path = [];
    this.title = [];
    this.kineticElement = [];
    this.backgroundImage = []
    this.finalBackground = null
    this.detail = [];
    this.backgroundImageOwnScaleX = [];
    this.backgroundImageOwnScaleY = [];
    this.persistent = [];
    this.originalX = [];
    this.originalY = [];
    this.options = [];
    this.stroke = [];
    this.strokeWidth = [];
    this.tween = [];
    this.agrandissement = 0;
    this.zoomActive = 0;
    this.minX = 10000;
    this.minY = 10000;
    this.maxX = -10000;
    this.maxY = -10000;
    this.tween_group = 0;
    this.group = 0;

    this.layer = params.layer;
    this.background_layer = params.background_layer;
    this.backgroundCache_layer = params.backgroundCache_layer;
    this.imageObj = params.imageObj;
    this.myhooks = params.myhooks;
    this.idText = params.idText;
    this.zoomLayer = params.zoomLayer;

    this.nbImages = 0
    this.nbImagesDone = 0
    this.allImagesLoaded = $.Deferred()
    this.allImagesLoaded.done(function(value){
      params.iaScene.nbDetailsLoaded+=value
      if (params.iaScene.nbDetails == params.iaScene.nbDetailsLoaded) params.iaScene.allDetailsLoaded.resolve()
      that.myhooks.afterIaObjectConstructor(params.iaScene, params.idText, params.detail, that);
    })

    that.cropCanvas = document.createElement('canvas');

    if (typeof(params.detail.path) !== 'undefined') {
      that.definePathBoxSize(params.detail, that)
    }
    else if (typeof(params.detail.image) !== 'undefined') {
      that.defineImageBoxSize(params.detail, that)
    }
    else if (typeof(params.detail.group) !== 'undefined') {
        for (var i in params.detail.group) {
            if (typeof(params.detail.group[i].path) !== 'undefined') {
              that.definePathBoxSize(params.detail.group[i], that)
            }
            else if (typeof(params.detail.group[i].image) !== 'undefined') {
              that.defineImageBoxSize(params.detail.group[i], that)
            }
        }
    }

    that.cropCanvas.setAttribute('width', parseFloat(that.maxX) - parseFloat(that.minX));
    that.cropCanvas.setAttribute('height', parseFloat(that.maxY) - parseFloat(that.minY));

    // Create kineticElements and include them in a group

    that.group = new Kinetic.Group();
    that.layer.add(that.group);

    if (typeof(params.detail.path) !== 'undefined') {
        that.nbImages = 1
        that.includePath(
          params.detail,
          0,
          that,
          params.iaScene,
          params.baseImage,
          params.idText
        )
    }
    else if (typeof(params.detail.image) !== 'undefined') {
        that.nbImages = 1
        that.includeImage(
          params.detail,
          0,
          that,
          params.iaScene,
          params.baseImage,
          params.idText
        )
    }
    else if (typeof(params.detail.group) !== 'undefined') {
        for (var i in params.detail.group) {
            if (typeof(params.detail.group[i].path) !== 'undefined') {
              that.nbImages++
            }
            else if (typeof(params.detail.group[i].image) !== 'undefined') {
              that.nbImages++
            }
        }
        for (var i in params.detail.group) {
            if (typeof(params.detail.group[i].path) !== 'undefined') {
                that.includePath(
                  params.detail.group[i],
                  i,
                  that,
                  params.iaScene,
                  params.baseImage,
                  params.idText
                )
            }
            else if (typeof(params.detail.group[i].image) !== 'undefined') {
                that.includeImage(
                  params.detail.group[i],
                  i,
                  that,
                  params.iaScene,
                  params.baseImage,
                  params.idText
                )
            }
        }

    }
    else {
        console.log(params.detail);
    }

    var dataUrl = that.cropCanvas.toDataURL()
    var cropedImage = new Image()

    cropedImage.onload = function() {
        that.finalBackground = cropedImage
        //document.body.appendChild(this)
        that.allImagesLoaded.resolve(that.nbImages)
    }
    cropedImage.src = dataUrl

    if (that.nbImages == 0) that.allImagesLoaded.resolve(0)
    this.defineTweens(this, params.iaScene);

}

/*
 *
 * @param {type} detail
 * @param {type} i KineticElement index
 * @returns {undefined}
 */
IaObject.prototype.includeImage = function(detail, i, that, iaScene, baseImage, idText) {
    //that.defineImageBoxSize(detail, that)
    var rasterObj = new Image()
    that.title[i] = detail.title
    that.backgroundImage[i] = rasterObj
    that.kineticElement[i] = new Kinetic.Image({
        name: detail.title,
        x: parseFloat(detail.x) * iaScene.coeff,
        y: parseFloat(detail.y) * iaScene.coeff + iaScene.y,
        width: detail.width,
        height: detail.height,
        scale: {x:iaScene.coeff,y:iaScene.coeff}
    });

    rasterObj.onload = function() {

        that.backgroundImageOwnScaleX[i] = iaScene.scale * detail.width / this.width;
        that.backgroundImageOwnScaleY[i] = iaScene.scale * detail.height / this.height;
        var zoomable = true;
        if ((typeof(detail.fill) !== 'undefined') &&
            (detail.fill == "#000000")) {
            zoomable = false;
        }
        if ((typeof(detail.options) !== 'undefined')) {
            that.options[i] = detail.options;
        }

        that.strokeWidth[i] = '0';
        that.stroke[i] = 'rgba(0, 0, 0, 0)';
        that.persistent[i] = "off-image";
        if ((typeof(detail.fill) !== 'undefined') &&
            (detail.fill == "#ffffff")) {
            that.persistent[i] = "onImage";
            that.kineticElement[i].fillPriority('pattern');
            that.kineticElement[i].fillPatternScaleX(that.backgroundImageOwnScaleX[i] * 1/iaScene.scale);
            that.kineticElement[i].fillPatternScaleY(that.backgroundImageOwnScaleY[i] * 1/iaScene.scale);
            that.kineticElement[i].fillPatternImage(that.backgroundImage[i]);
            zoomable = false;
        }

        that.group.add(that.kineticElement[i]);
        that.addEventsManagement(i,zoomable, that, iaScene, baseImage, idText);


        // define hit area excluding transparent pixels
        // =============================================================

        var cropX = Math.max(parseFloat(detail.minX), 0);
        var cropY = Math.max(parseFloat(detail.minY), 0);
        var cropWidth = (Math.min(parseFloat(detail.maxX) - parseFloat(detail.minX), Math.floor(parseFloat(iaScene.originalWidth) * 1)));
        var cropHeight = (Math.min(parseFloat(detail.maxY) - parseFloat(detail.minY), Math.floor(parseFloat(iaScene.originalHeight) * 1)));
        if (cropX + cropWidth > iaScene.originalWidth * 1) {
            cropWidth = iaScene.originalWidth * 1 - cropX * 1;
        }
        if (cropY * 1 + cropHeight > iaScene.originalHeight * 1) {
            cropHeight = iaScene.originalHeight * 1 - cropY * 1;
        }
	      var hitCanvas = that.layer.getHitCanvas();
        iaScene.completeImage = hitCanvas.getContext().getImageData(0,0,Math.floor(hitCanvas.width),Math.floor(hitCanvas.height));

        var canvas_source = document.createElement('canvas');
        canvas_source.setAttribute('width', cropWidth * iaScene.coeff);
        canvas_source.setAttribute('height', cropHeight * iaScene.coeff);
        var context_source = canvas_source.getContext('2d');
        context_source.drawImage(rasterObj,0,0, cropWidth * iaScene.coeff, cropHeight * iaScene.coeff);
        imageDataSource = context_source.getImageData(0, 0, cropWidth * iaScene.coeff, cropHeight * iaScene.coeff);
        len = imageDataSource.data.length;
        that.group.zoomActive = 0;

        (function(len, imageDataSource){
        that.kineticElement[i].hitFunc(function(context) {
            if (iaScene.zoomActive == 0) {

                var imageData = imageDataSource.data;
                var imageDest = iaScene.completeImage.data;
                var position1 = 0;
                var position2 = 0;
                var maxWidth = Math.floor(cropWidth * iaScene.coeff);
                var maxHeight = Math.floor(cropHeight * iaScene.coeff);
                var startY = Math.floor(cropY * iaScene.coeff);
                var startX = Math.floor(cropX * iaScene.coeff);
                var hitCanvasWidth = Math.floor(that.layer.getHitCanvas().width);
                var rgbColorKey = Kinetic.Util._hexToRgb(this.colorKey);
                for(var varx = 0; varx < maxWidth; varx +=1) {
                    for(var vary = 0; vary < maxHeight; vary +=1) {
                        position1 = 4 * (vary * maxWidth + varx);
                        position2 = 4 * ((vary + startY) * hitCanvasWidth + varx + startX);
                        if (imageData[position1 + 3] > 100) {
                           imageDest[position2 + 0] = rgbColorKey.r;
                           imageDest[position2 + 1] = rgbColorKey.g;
                           imageDest[position2 + 2] = rgbColorKey.b;
                           imageDest[position2 + 3] = 255;
                        }
                    }
                }
                context.putImageData(iaScene.completeImage, 0, 0);
            }
            else {
                context.beginPath();
                context.rect(0,0,this.width(),this.height());
                context.closePath();
                context.fillStrokeShape(this);
            }
        });
        })(len, imageDataSource);

        var cropCtx = that.cropCanvas.getContext('2d')
        cropCtx.drawImage(this,0,0)

        that.group.draw();
        that.nbImagesDone++
        if (that.nbImages == that.nbImagesDone) that.allImagesLoaded.resolve(1)

    };
    rasterObj.src = detail.image
};


/*
 *
 * @param {type} path
 * @param {type} i KineticElement index
 * @returns {undefined}
 */
IaObject.prototype.includePath = function(detail, i, that, iaScene, baseImage, idText) {
    that.path[i] = detail.path;
    that.detail[i] = {
      minX : detail.minX,
      minY : detail.minY,
      maxX : detail.maxX,
      maxY : detail.maxY,
    }
    that.title[i] = detail.title;
    // if detail is out of background, hack maxX and maxY
    if (parseFloat(detail.maxX) < 0) detail.maxX = 1;
    if (parseFloat(detail.maxY) < 0) detail.maxY = 1;

    that.kineticElement[i] = new Kinetic.Path({
        name: detail.title,
        data: detail.path,
        x: parseFloat(detail.x) * iaScene.coeff,
        y: parseFloat(detail.y) * iaScene.coeff + iaScene.y,
        //x : 0,
        //y : 0,
        scale: {x:iaScene.coeff,y:iaScene.coeff},
        fill: 'rgba(0, 0, 0, 0)'
    });
    that.group.add(that.kineticElement[i]);

    var cropCtx = that.cropCanvas.getContext('2d')
    var cropX = Math.max(parseFloat(detail.minX), 0);
    var cropY = Math.max(parseFloat(detail.minY), 0);
    var cropWidth = Math.min(
      (parseFloat(detail.maxX) - cropX) * iaScene.scale,
      Math.floor(parseFloat(iaScene.originalWidth) * iaScene.scale)
    )
    var cropHeight = Math.min(
      (parseFloat(detail.maxY) - cropY) * iaScene.scale,
      Math.floor(parseFloat(iaScene.originalHeight) * iaScene.scale)
    )
    if (cropX * iaScene.scale + cropWidth > iaScene.originalWidth * iaScene.scale) {
	     cropWidth = iaScene.originalWidth * iaScene.scale - cropX * iaScene.scale;
    }
    if (cropY * iaScene.scale + cropHeight > iaScene.originalHeight * iaScene.scale) {
	     cropHeight = iaScene.originalHeight * iaScene.scale - cropY * iaScene.scale;
    }
    var posX = detail.minX - that.minX
    var posY = detail.minY - that.minY
    if (parseFloat(detail.minX) < 0) posX = parseFloat(detail.minX) * (-1);
    if (parseFloat(detail.minY) < 0) posY = parseFloat(detail.minY) * (-1);
    // bad workaround to avoid null dimensions
    if (cropWidth <= 0) cropWidth = 1;
    if (cropHeight <= 0) cropHeight = 1;
    cropCtx.drawImage(
        that.imageObj,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        posX,
        posY,
        cropWidth,
        cropHeight
    );

    that.kineticElement[i].fillPatternRepeat('no-repeat')
    //that.kineticElement[i].fillPatternX(detail.minX)
    //that.kineticElement[i].fillPatternY(detail.minY)


    var zoomable = true;
    if ((typeof(detail.fill) !== 'undefined') &&
        (detail.fill == "#000000")) {
        zoomable = false;
    }
    if ((typeof(detail.options) !== 'undefined')) {
        that.options[i] = detail.options;
    }

    that.strokeWidth[i] = '0';
    that.stroke[i] = 'rgba(0, 0, 0, 0)';
    that.persistent[i] = "off";
    if ((typeof(detail.fill) !== 'undefined') &&
        (detail.fill == "#ffffff")) {
        that.persistent[i] = "onPath";
        that.kineticElement[i].fill('rgba(' + iaScene.colorPersistent.red + ',' + iaScene.colorPersistent.green + ',' + iaScene.colorPersistent.blue + ',' + iaScene.colorPersistent.opacity + ')');
    }
    that.group.draw();
    that.addEventsManagement(i, zoomable, that, iaScene, baseImage, idText);


};

/*
 *
 * @param {type} index
 * @returns {undefined}
 */
IaObject.prototype.defineImageBoxSize = function(detail, that) {
    "use strict";
    that.minX = Math.min(parseFloat(detail.x), that.minX)
    that.maxX = Math.max(parseFloat(detail.x) + parseFloat(detail.width), that.maxX)
    that.minY = Math.min(parseFloat(detail.y), that.minY)
    that.maxY = Math.max(parseFloat(detail.y) + parseFloat(detail.height), that.maxY)
};


/*
 *
 * @param {type} index
 * @returns {undefined}
 */
IaObject.prototype.definePathBoxSize = function(detail, that) {
    "use strict";
    if (  (typeof(detail.minX) !== 'undefined') &&
          (typeof(detail.minY) !== 'undefined') &&
          (typeof(detail.maxX) !== 'undefined') &&
          (typeof(detail.maxY) !== 'undefined')) {
        that.minX = Math.min(that.minX, detail.minX)
        that.minY = Math.min(that.minY, detail.minY)
        that.maxX = Math.max(that.maxX, detail.maxX)
        that.maxY = Math.max(that.maxY, detail.maxY)
    }
    else {
        console.log('definePathBoxSize failure');
    }
};



/*
 * Define zoom rate and define tween effect for each group
 * @returns {undefined}
 */
IaObject.prototype.defineTweens = function(that, iaScene) {

    that.minX = that.minX * iaScene.coeff;
    that.minY = that.minY * iaScene.coeff;
    that.maxX = that.maxX * iaScene.coeff;
    that.maxY = that.maxY * iaScene.coeff;

    var largeur = that.maxX - that.minX;
    var hauteur = that.maxY - that.minY;
    that.agrandissement1  = (iaScene.height - iaScene.y) / hauteur;   // beta
    that.agrandissement2  = iaScene.width / largeur;    // alpha

    if (hauteur * that.agrandissement2 > iaScene.height) {
        that.agrandissement = that.agrandissement1;
        that.tweenX = (0 - (that.minX)) * that.agrandissement + (iaScene.width - largeur * that.agrandissement) / 2;
        that.tweenY = (0 - iaScene.y - (that.minY)) * that.agrandissement + iaScene.y;
    }
    else {
        that.agrandissement = that.agrandissement2;
        that.tweenX = (0 - (that.minX)) * that.agrandissement;
        that.tweenY = 1 * ((0 - iaScene.y - (that.minY)) * that.agrandissement + iaScene.y + (iaScene.height - hauteur * that.agrandissement) / 2);
    }
};

/*
 * Define mouse events on the current KineticElement
 * @param {type} i KineticElement index
 * @returns {undefined}
 */

IaObject.prototype.addEventsManagement = function(i, zoomable, that, iaScene, baseImage, idText) {

    if (that.options[i].indexOf("disable-click") !== -1) return;
    /*
     * if mouse is over element, fill the element with semi-transparency
     */
    that.kineticElement[i].on('mouseover', function() {
        if (iaScene.cursorState.indexOf("ZoomOut.cur") !== -1) {

        }
        else if ((iaScene.cursorState.indexOf("ZoomIn.cur") !== -1) ||
           (iaScene.cursorState.indexOf("ZoomFocus.cur") !== -1)) {

        }
        else if (iaScene.cursorState.indexOf("HandPointer.cur") === -1) {

            document.body.style.cursor = "pointer";
            iaScene.cursorState = "url(img/HandPointer.cur),auto";
            for (var i in that.kineticElement) {
                if (that.persistent[i] == "off") {
                    that.kineticElement[i].fillPriority('color');
                    //that.kineticElement[i].fill(iaScene.overColor);
                    //that.kineticElement[i].scale(iaScene.coeff);
                    that.kineticElement[i].stroke(iaScene.overColorStroke);
                    that.kineticElement[i].strokeWidth(5);
                    that.kineticElement[i].dashEnabled()
                    that.kineticElement[i].dash([10,10]);

                }
                else if (that.persistent[i] == "onPath") {
                    that.kineticElement[i].fillPriority('color');
                    that.kineticElement[i].fill('rgba(' + iaScene.colorPersistent.red + ',' + iaScene.colorPersistent.green + ',' + iaScene.colorPersistent.blue + ',' + iaScene.colorPersistent.opacity + ')');
                }
                else if ((that.persistent[i] == "onImage") || (that.persistent[i] == "off-image")) {
                    that.kineticElement[i].fillPriority('pattern');
              //      that.kineticElement[i].fillPatternScaleX(that.backgroundImageOwnScaleX[i] * 1/iaScene.scale);
              //      that.kineticElement[i].fillPatternScaleY(that.backgroundImageOwnScaleY[i] * 1/iaScene.scale);
                    that.kineticElement[i].fillPatternImage(that.backgroundImage[i]);
                }
            }
            that.layer.batchDraw();

        }
    });
    /*
     * if we click in this element, manage zoom-in, zoom-out
     */
    if (that.options[i].indexOf("direct-link") !== -1) {
        that.kineticElement[i].on('click touchstart', function(e) {
            location.href = that.title[i];
        });
    }
    else {

        that.kineticElement[i].on('click touchstart', function() {
            // let's zoom
            var i = 0;
            iaScene.noPropagation = true;
            if ((iaScene.cursorState.indexOf("ZoomIn.cur") !== -1) &&
                (iaScene.element === that)) {

                iaScene.zoomActive = 1;

                document.body.style.cursor = "zoom-out";
                iaScene.cursorState = "url(img/ZoomOut.cur),auto";
                that.layer.moveToTop();
                this.moveToTop();
                that.group.moveToTop();
                that.group.zoomActive = 1;
                that.originalX[0] = that.group.x();
                that.originalY[0] = that.group.y();

                that.alpha = 0;
                that.step = 0.1;
                var personalTween = function(anim, thislayer) {
                    // linear
                    var tempX = that.originalX[0] + that.alpha.toFixed(2) * (that.tweenX - that.originalX[0]);
                    var tempY = that.originalY[0] + that.alpha.toFixed(2) * (that.tweenY - that.originalY[0]);
                    var tempScale = 1 + that.alpha.toFixed(2) * (that.agrandissement - 1);
                    var t = null;
                    if (that.alpha.toFixed(2) <= 1) {
                        that.alpha = that.alpha + that.step;
                        that.group.setPosition({x:tempX, y:tempY});
                        that.group.scale({x:tempScale,y:tempScale});
                    }
                    else {
                        that.zoomLayer.hitGraphEnabled(true);
                        anim.stop();
                    }
                };
                that.zoomLayer.moveToTop();
                that.group.moveTo(that.zoomLayer);
                that.layer.draw();
                var anim = new Kinetic.Animation(function(frame) {
                    personalTween(this, that.layer);
                }, that.zoomLayer);
                that.zoomLayer.hitGraphEnabled(false);
                anim.start();



            }
            // let's unzoom
            else if (iaScene.cursorState.indexOf("ZoomOut.cur") != -1) {

              var popupMaterialTopOrigin = ($("#popup_material_background").height() - $("#popup_material").height()) / 2
              var popupMaterialLeftOrigin = ($("#popup_material_background").width() - $("#popup_material").width()) / 2

              $("#popup_material").animate({
                "top": (popupMaterialTopOrigin * 2 + $("#popup_material").height()) + 'px',
                "left" : popupMaterialLeftOrigin + "px",
              },
              {queue : false});

              $("#popup_material_image_" + that.idText ).css({
                'transition' : '0s'
              })
              $("#popup_material_image_general").css({
                'transition' : '0s'
              })
              $(".popup_material_image").animate({
                "top": (popupMaterialTopOrigin * 2 + $("#popup_material").height()) + 'px',
                "left" : popupMaterialLeftOrigin + "px",
              },
              {queue : false});

              iaScene.zoomActive = 0;
              that.group.zoomActive = 0;
              that.group.scaleX(1);
              that.group.scaleY(1);
              that.group.x(that.originalX[0]);
              that.group.y(that.originalY[0]);

              that.backgroundCache_layer.moveToBottom();
              document.body.style.cursor = "default";
              iaScene.cursorState = "default";

              $('#' + that.idText + " audio").each(function(){
                  $(this)[0].pause();
              });
              $('#' + that.idText + " video").each(function(){
                  $(this)[0].pause();
              });

              for (i in that.kineticElement) {
                  if (that.persistent[i] == "off") {
//                      that.kineticElement[i].fillPriority('color');
//                      that.kineticElement[i].fill('rgba(0, 0, 0, 0)');
                      that.kineticElement[i].stroke('rgba(0, 0, 0, 0)');
                      that.kineticElement[i].strokeWidth(0);

                  }
                  else if (that.persistent[i] == "onPath") {
                      that.kineticElement[i].fillPriority('color');
                      that.kineticElement[i].fill('rgba(' + iaScene.colorPersistent.red + ',' + iaScene.colorPersistent.green + ',' + iaScene.colorPersistent.blue + ',' + iaScene.colorPersistent.opacity + ')');
                  }
                  else if (that.persistent[i] == "onImage") {
                      that.kineticElement[i].fillPriority('pattern');
  //                    that.kineticElement[i].fillPatternScaleX(that.backgroundImageOwnScaleX[i] * 1/iaScene.scale);
  //                    that.kineticElement[i].fillPatternScaleY(that.backgroundImageOwnScaleY[i] * 1/iaScene.scale);
                      that.kineticElement[i].fillPatternImage(that.backgroundImage[i]);
                  }
              }
              //that.group.moveTo(that.layer);
              //that.zoomLayer.moveToBottom();
              //that.zoomLayer.draw();
              that.layer.draw();
              that.backgroundCache_layer.draw();

            }
            // let's focus
            else {
                if (iaScene.zoomActive === 0) {
                    if ((iaScene.element !== 0) &&
                        (typeof(iaScene.element) !== 'undefined')) {

                        for (i in iaScene.element.kineticElement) {
                            //iaScene.element.kineticElement[i].fillPriority('color');
                            //iaScene.element.kineticElement[i].fill('rgba(0,0,0,0)');
                            iaScene.element.kineticElement[i].stroke('rgba(0, 0, 0, 0)');
                            iaScene.element.kineticElement[i].strokeWidth(0);
                        }
                        if (iaScene.element.layer) iaScene.element.layer.draw();
                        $('#' + iaScene.element.idText + " audio").each(function(){
                            $(this)[0].pause();
                        });
                        $('#' + iaScene.element.idText + " video").each(function(){
                            $(this)[0].pause();
                        });
                    }

                    if (zoomable === true) {
                        //document.body.style.cursor = "zoom-in";
                        //iaScene.cursorState = 'url("img/ZoomIn.cur"),auto';
                        $("#popup_material_image_" + that.idText).data('zoomable', true)
                        $("#popup_material_image_" + that.idText).css('cursor', 'pointer')
                    }
                    else {
                        //iaScene.cursorState = 'url("img/ZoomFocus.cur"),auto';
                        $("#popup_material_image_" + that.idText).data('zoomable', false)
                        $("#popup_material_image_" + that.idText).css('cursor', 'default')
                    }

                    var rippleEffect = true
                    if (rippleEffect) {
                        var mouseXY = that.layer.getStage().getPointerPosition();
                        var div = document.createElement("div")
                        var newdiv = '<div class="ripple-effect" style="top:' + (mouseXY.y - 25) + 'px;left:'+ (mouseXY.x - 25) +'px;"></div>'
                        $("#ripple_background").append(newdiv)
                        window.setTimeout(function(){
                          $(".ripple-effect").remove();
                        }, 1100);
                    }

                    $("#popup_material_image_" + that.idText).css({
                      'position' : 'absolute',
                      'display' : 'block',
                      'top' : that.minY + 'px',
                      'left' : that.minX + 'px',
                      'height' : (that.maxY - that.minY) + 'px',
                      'width' : (that.maxX - that.minX) + 'px',
                      'transition' : '0s'
                    })
                    $("#popup_material").css({
                      "position": "absolute",
                      "transition" : "0s"
                    });
                    iaScene.zoomActive = 1;
                    document.body.style.cursor = "default";
                    iaScene.cursorState = "url(img/ZoomOut.cur),auto";
                    that.group.zoomActive = 1;

                    var cacheBackground = true;
                    for (i in that.kineticElement) {
                        if (that.persistent[i] === "onImage") cacheBackground = false
                    }
                    if (cacheBackground === true) that.backgroundCache_layer.moveToTop();
                    that.layer.moveToTop();

                    for (i in that.kineticElement) {

                        if (that.persistent[i] == "off") {
                            //that.kineticElement[i].fillPriority('color');
                            //that.kineticElement[i].fill('rgba(0, 0, 0, 0)');
                            that.kineticElement[i].stroke('rgba(0, 0, 0, 0)');
                            that.kineticElement[i].strokeWidth(0);
                        }
                        else if (that.persistent[i] == "onPath") {
                            that.kineticElement[i].fillPriority('color');
                            that.kineticElement[i].fill('rgba(' + iaScene.colorPersistent.red + ',' + iaScene.colorPersistent.green + ',' + iaScene.colorPersistent.blue + ',' + iaScene.colorPersistent.opacity + ')');
                        }
                        else if (that.persistent[i] == "onImage") {
                            that.kineticElement[i].fillPriority('pattern');
    //                        that.kineticElement[i].fillPatternScaleX(that.backgroundImageOwnScaleX[i] * 1/iaScene.scale);
    //                        that.kineticElement[i].fillPatternScaleY(that.backgroundImageOwnScaleY[i] * 1/iaScene.scale);
                            that.kineticElement[i].fillPatternImage(that.backgroundImage[i]);
                        }
                    }

                    var popupMaterialTopOrigin = ($("#popup_material_background").height() - $("#popup_material").height()) / 2
                    var popupMaterialLeftOrigin = ($("#popup_material_background").width() - $("#popup_material").width()) / 2

                    var backgroundWidth = Math.min($("#popup_material_title").height(), $("#popup_material").width() / 2)
                    var backgroundHeight = $("#popup_material_title").height()
                    var imageWidth = (that.maxX - that.minX)
                    var imageHeight = (that.maxY - that.minY)
                    var a = Math.min(
                            backgroundWidth / imageWidth,
                            backgroundHeight / imageHeight)

                    var x = popupMaterialLeftOrigin
                    var y = ((backgroundHeight - a * imageHeight) / 2) + popupMaterialTopOrigin

                      $.easing.custom = function (x, t, b, c, d) {
                        return c*(t/=d)*t*t*t*t + b;
                      }
                      $("#popup_material_content").hide()
                      $("#content article").hide()
                      $("#popup_material").animate({
                        'top': (popupMaterialTopOrigin) + 'px',
                      },{
                        duration : 500,
                        easing : "custom",
                        queue : false,
                        complete : function(){
                          $("#" + that.idText).show()
                          $("#popup_material_content").fadeIn()
                        }
                      })

                      $("#popup_material_image_" + that.idText).animate({
                        'top' : y + 'px',
                        'left' : x + 'px',
                        'height' : (a * imageHeight) + 'px',
                        'width' : (a * imageWidth) + 'px',

                      },{
                        duration : 500,
                        easing : "custom",
                        queue : false
                      })

                      $("#popup_material_title_text").css({
                        "margin-left" : (a * imageWidth) + 'px'
                      })

                    that.layer.draw();
                    iaScene.element = that;

                    that.myhooks.afterIaObjectFocus(iaScene, idText, that);
                }
            }
        });
    }
    /*
     * if we leave this element, just clear the scene
     */
    that.kineticElement[i].on('mouseleave', function() {
        if ((iaScene.cursorState.indexOf("ZoomOut.cur") !== -1) ||
         (iaScene.cursorState.indexOf("ZoomIn.cur") !== -1) ||
           (iaScene.cursorState.indexOf("ZoomFocus.cur") !== -1)) {

        }
        else {
            var mouseXY = that.layer.getStage().getPointerPosition();
            if (typeof(mouseXY) == "undefined") {
		        mouseXY = {x:0,y:0};
            }
            if ((that.layer.getStage().getIntersection(mouseXY) != this)) {
                that.backgroundCache_layer.moveToBottom();
                for (var i in that.kineticElement) {
                    if ((that.persistent[i] == "off") || (that.persistent[i] == "off-image")) {
                        that.kineticElement[i].fillPriority('color');
                        that.kineticElement[i].fill('rgba(0, 0, 0, 0)');
                        that.kineticElement[i].stroke('rgba(0, 0, 0, 0)');
                        that.kineticElement[i].strokeWidth(0);
                    }
                    else if (that.persistent[i] == "onPath") {
                        that.kineticElement[i].fillPriority('color');
                        that.kineticElement[i].fill('rgba(' + iaScene.colorPersistent.red + ',' + iaScene.colorPersistent.green + ',' + iaScene.colorPersistent.blue + ',' + iaScene.colorPersistent.opacity + ')');
                    }
                    else if (that.persistent[i] == "onImage") {
                        that.kineticElement[i].fillPriority('pattern');
      //                  that.kineticElement[i].fillPatternScaleX(that.backgroundImageOwnScaleX[i] * 1/iaScene.scale);
      //                  that.kineticElement[i].fillPatternScaleY(that.backgroundImageOwnScaleY[i] * 1/iaScene.scale);
                        that.kineticElement[i].fillPatternImage(that.backgroundImage[i]);
                    }
                }
                document.body.style.cursor = "default";
                iaScene.cursorState = "default";
                that.layer.draw();
            }
        }
    });
};
