/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var decorators_1 = require("esri/core/accessorSupport/decorators");
var Widget = require("esri/widgets/Widget");
var watchUtils = require("esri/core/watchUtils");
var widget_1 = require("esri/widgets/support/widget");
var lang = require("dojo/_base/lang");
var Color = require("dojo/_base/Color");
var number = require("dojo/number");
var domGeom = require("dojo/dom-geometry");
var gfx = require("dojox/gfx");
var CSS = {
    base: "apl-compass-plus",
    size_larger: "apl-compass-larger"
};
var _HUD_SIZE;
(function (_HUD_SIZE) {
    _HUD_SIZE[_HUD_SIZE["DEFAULT"] = 0] = "DEFAULT";
    _HUD_SIZE[_HUD_SIZE["LARGER"] = 1] = "LARGER";
})(_HUD_SIZE || (_HUD_SIZE = {}));
var CompassPlus = (function (_super) {
    __extends(CompassPlus, _super);
    function CompassPlus() {
        _super.call(this);
        this.hudSize = CompassPlus.HUD_SIZE.DEFAULT;
        this._onViewChange = this._onViewChange.bind(this);
    }
    CompassPlus.prototype.render = function () {
        var classes = (_a = {},
            _a[CSS.size_larger] = (this.hudSize === CompassPlus.HUD_SIZE.LARGER),
            _a
        );
        return (<div bind={this} class={CSS.base} classes={classes}> HUD </div>);
        var _a;
    };
    CompassPlus.prototype.postInitialize = function () {
        var _this = this;
        watchUtils.init(this, "view.camera.heading", function () { return _this._onViewChange(); });
    };
    CompassPlus.prototype._onViewChange = function () {
        var heading = this.view.camera.heading;
    };
    CompassPlus.prototype.pointTo = function (p, dist, azimuth) {
        var radians = (-azimuth + 90.0) * (Math.PI / 180.0);
        return {
            x: p.x + Math.cos(radians) * dist,
            y: p.y - Math.sin(radians) * dist
        };
    };
    CompassPlus.prototype.initializeHUD = function (HUDNode) {
        HUDNode.innerHTML = "";
        var nodeBox = domGeom.getContentBox(HUDNode);
        var nodeCenter = { x: nodeBox.w * 0.5, y: nodeBox.h * 0.5 };
        var outerRadius = (nodeBox.h * 0.4);
        var surface = gfx.createSurface(HUDNode, nodeBox.w, nodeBox.h);
        // INDICATOR //
        var indicatorFont = { family: "Avenir Next W00", style: "bold", size: "19pt" };
        var indicatorColor = Color.named.yellow;
        var coordinateFont = { family: "Avenir Next W00", style: "bold", size: "9pt" };
        var coordinateColor = Color.named.white;
        var _indicator = surface.createGroup();
        var updateIndicator = function (heading) {
            _indicator.clear();
            // AZIMUTH //
            var arrowWidth = 1.5;
            var indicatorPnt = this._pointTo(nodeCenter, outerRadius, 0.0);
            var indicatorLabelPnt = this._pointTo(nodeCenter, outerRadius - 75.0, 0.0);
            _indicator.createLine({
                x1: indicatorPnt.x,
                y1: indicatorPnt.y,
                x2: indicatorLabelPnt.x,
                y2: indicatorLabelPnt.y - 20.0
            }).setStroke({ color: indicatorColor, style: "solid", width: arrowWidth });
            /*var arrowPnt1 = this._pointTo(indicatorPnt, 15.0, 150.0);
             this._indicator.createLine({
             x1: indicatorPnt.x,
             y1: indicatorPnt.y,
             x2: arrowPnt1.x,
             y2: arrowPnt1.y
             }).setStroke({ color: indicatorColor, style: "solid", width: arrowWidth });
             var arrowPnt2 = this._pointTo(indicatorPnt, 15.0, 210.0);
             this._indicator.createLine({
             x1: indicatorPnt.x,
             y1: indicatorPnt.y,
             x2: arrowPnt2.x,
             y2: arrowPnt2.y
             }).setStroke({ color: indicatorColor, style: "solid", width: arrowWidth });*/
            _indicator.createText({
                x: indicatorLabelPnt.x,
                y: indicatorLabelPnt.y,
                align: "middle",
                text: heading.toFixed(0) + "°"
            }).setFont(indicatorFont).setFill(indicatorColor);
            // COORDINATE TEXT //
            var coordText = lang.replace("{lon}, {lat}, {alt}", {
                lon: number.format(this.view.camera.position.longitude, { places: 2 }),
                lat: number.format(this.view.camera.position.latitude, { places: 2 }),
                alt: number.format(this.view.camera.position.z, { places: 2 })
            });
            _indicator.createText({
                x: nodeCenter.x,
                y: nodeCenter.y + 15.0,
                align: "middle",
                text: coordText
            }).setFont(coordinateFont).setFill(coordinateColor);
            // HORIZON //
            var tiltHeight = (outerRadius * (90.0 - this.view.camera.tilt) / 90.0);
            var horizonLine = this._indicator.createLine({
                x1: nodeCenter.x - 200.0,
                y1: nodeCenter.y - tiltHeight,
                x2: nodeCenter.x + 200.0,
                y2: nodeCenter.y - tiltHeight
            }).setStroke({ color: Color.named.darkred, style: "dash", width: 1.5 }).setClip({
                cx: nodeCenter.x, cy: nodeCenter.y, rx: outerRadius - 5.0, ry: outerRadius - 5.0
            });
            horizonLine.moveToBack();
        }.bind(this);
        updateIndicator(this.view.camera.heading);
        var _hud = surface.createGroup();
        // OUTER CIRCLE //
        var hudLineColor = Color.named.limegreen.concat(0.8);
        var hudFillColor = Color.named.white.concat(0.1);
        var outerWidth = 2.5;
        _hud.createCircle({
            cx: nodeCenter.x,
            cy: nodeCenter.y,
            r: outerRadius
        }).setStroke({ color: hudLineColor, style: "solid", width: outerWidth }).setFill(hudFillColor);
        // CENTER //
        /*this._hud.createCircle({
         cx: nodeCenter.x,
         cy: nodeCenter.y,
         r: 5.0
         }).setStroke({ color: Color.named.white, style: "solid", width: 1.0 }).setFill(Color.named.limegreen.concat(0.5));*/
        /*var centerLength = 40.0;
         var centerWidth = 2.0;
         // N - S //
         this.directionLine_NS = this._hud.createLine({
         x1: nodeCenter.x,
         y1: nodeCenter.y - centerLength,
         x2: nodeCenter.x,
         y2: nodeCenter.y + centerLength
         }).setStroke({ color: hudColor, style: "solid", width: centerWidth });
         // W - E //
         this.directionLine_WE = this._hud.createLine({
         x1: nodeCenter.x - centerLength,
         y1: nodeCenter.y,
         x2: nodeCenter.x + centerLength,
         y2: nodeCenter.y
         }).setStroke({ color: hudColor, style: "solid", width: centerWidth });*/
        // DIRECTIONS //
        var directionFont = { family: "Avenir Next W00", style: "bold", size: "15pt" };
        var directionFontColor = "#fff";
        var directions = { "N": 0.0, "E": 90.0, "S": 180.0, "W": 270.0 };
        for (var direction in directions) {
            if (directions.hasOwnProperty(direction)) {
                var directionAzi = directions[direction];
                var directionLabelPnt = this.pointTo(nodeCenter, outerRadius - 40.0, directionAzi - 5.0);
                var directionLabelPnt2 = this.pointTo(nodeCenter, outerRadius - 40.0, directionAzi + 5.0);
                _hud.createTextPath({
                    align: "middle",
                    text: direction
                }).moveTo(directionLabelPnt).lineTo(directionLabelPnt2).setFont(directionFont).setFill(directionFontColor);
            }
        }
        var hudStroke = { color: hudLineColor, style: "solid", width: 1.5 };
        for (var azi = 0.0; azi < 360.0; azi += 5.0) {
            var lineLength = (azi % 15 === 0) ? 20.0 : 5.0;
            var outerPnt = this.pointTo(nodeCenter, outerRadius, azi);
            var innerPnt = this.pointTo(nodeCenter, outerRadius - lineLength, azi);
            _hud.createLine({
                x1: outerPnt.x,
                y1: outerPnt.y,
                x2: innerPnt.x,
                y2: innerPnt.y
            }).setStroke(hudStroke);
            if (azi % 15 === 0) {
                var fontSize = (azi % 45 === 0) ? "11pt" : "7pt";
                var fontColor = (azi % 45 === 0) ? "#fff" : "#ddd";
                var labelPnt = this.pointTo(nodeCenter, outerRadius + 8.0, azi - 5.0);
                var labelPnt2 = this.pointTo(nodeCenter, outerRadius + 8.0, azi + 5.0);
                _hud.createTextPath({
                    align: "middle",
                    text: azi
                }).moveTo(labelPnt).lineTo(labelPnt2).setFont({
                    family: "Avenir Next W00",
                    style: "bold",
                    size: fontSize
                }).setFill(fontColor);
            }
        }
        _hud.setTransform(gfx.matrix.rotategAt(-this.view.camera.heading, nodeCenter));
        this.view.watch("camera.heading", function (heading) {
            _hud.setTransform(gfx.matrix.rotategAt(-heading, nodeCenter));
            updateIndicator(heading);
        }.bind(this));
    };
    CompassPlus.HUD_SIZE = _HUD_SIZE;
    __decorate([
        decorators_1.property(),
        widget_1.renderable()
    ], CompassPlus.prototype, "hudSize", void 0);
    __decorate([
        decorators_1.property(),
        widget_1.renderable()
    ], CompassPlus.prototype, "view", void 0);
    CompassPlus = __decorate([
        decorators_1.subclass("apl.widgets.CompassPlus")
    ], CompassPlus);
    return CompassPlus;
}(decorators_1.declared(Widget)));
module.exports = CompassPlus;
