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
 * XiaDetail is a wrapper of a Kinetic Node to store xia specific informations
 */
function XiaDetail(detail, idText) {
    "use strict";
    
    var that = this;
    // observers are used to manage lines connectors
    this.observers = new ObserverList();
    this.title = detail.title;
    this.onfailreturn = false;
    this.path = "";
    this.kineticElement = null;
    this.persistent = "";
    this.options = "";
    this.backgroundImage = null;
    this.tooltip = null;
    this.draggable_object = true;
    this.target_id = null;
    this.magnet_state = null;
    this.droparea = false;
    this.idText = idText;
    // if this detail is a connector line, keep references to the start object and the end object
    this.connectionStart = null;
    this.connectionEnd = null;
    this.connectorStart = null;
    this.connectorEnd = null;
    this.style= "";
    this.stroke=null;
    this.strokeWidth=null;
    this.lastDragPos = {x:0, y:0};
    // used to force details to go home if onfailreturn is specified when dropped onwrong drop area
    this.originalCoords = {x:0,y:0};
    this.minX = 10000;
    this.minY = 10000;
    this.maxX = -10000;
    this.maxY = -10000;
    // match is used to know if current detail has been dropped over the right drop area
    this.match = false;
    // delta is used to remember delta between real coordinates and min,max ones. (only useful for paths)
    this.delta = {x:0, y:0};

    // retrieve options
    if ((typeof(detail.options) !== 'undefined')) {
        this.options = detail.options;
    }

    var onfail_state = $("#" + idText).data("onfail");
    if (onfail_state == "return") {
        this.onfailreturn = true;
    }
    // retrieve styles
    if ((typeof(detail.style) !== 'undefined')) {
        this.style = detail.style;
        var stroke = this.style.match("stroke:(.*?);");
        if (stroke) this.stroke = stroke[1];

        var strokeWidth = this.style.match("stroke-width:(.*?);");
        if (strokeWidth) this.strokeWidth = strokeWidth[1];
    }

    // retrieve connection if exists
    if ((typeof(detail.connectionStart) !== 'undefined')) {
        this.connectionStart = detail.connectionStart;
        this.connectionEnd = detail.connectionEnd;
        this.options += " disable-click ";
    }

    if (this.options.indexOf("disable-click") != -1) {
        this.draggable_object = false;
    };  
    if ($('article[data-target="' + $("#" + idText).data("kinetic_id") + '"]').length != 0) {
        this.draggable_object = false;
    }    
    if ($('article[data-tooltip="' + $("#" + idText).data("kinetic_id") + '"]').length != 0) {
        this.draggable_object = false;
    }  
    
    this.target_id = $('#' + idText).data("target");
    this.magnet_state = $("#" + idText).data("magnet");

    if ($('article[data-target="' + $("#" + idText).data("kinetic_id") + '"]').length != 0) {
        this.droparea = true;
        
    }    
    
}

XiaDetail.prototype.addObserver = function( observer ){
  this.observers.add( observer );
};

XiaDetail.prototype.removeObserver = function( observer ){
  this.observers.removeAt( this.observers.indexOf( observer, 0 ) );
};

XiaDetail.prototype.notify = function(){
  var observerCount = this.observers.count();
  for(var i=0; i < observerCount; i++){
    this.observers.get(i).update();
  }
};

XiaDetail.prototype.update = function(){
    // redraw connector
 var coeff = (1/this.kineticElement.getIaObject().mainScene.coeff);
 xStart = this.connectorStart.x() * coeff+ this.connectorStart.width() / 2;
 yStart = this.connectorStart.y() * coeff+ this.connectorStart.height() / 2;
 xEnd = this.connectorEnd.x() * coeff + this.connectorEnd.width() / 2;
 yEnd = this.connectorEnd.y() * coeff + this.connectorEnd.height() / 2;

 this.kineticElement.data("M" + (xStart) + "," + (yStart) + " " + (xEnd) + "," + (yEnd) + " z");

};