/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "esri/widgets/support/widget", "dojo/_base/lang", "dojo/_base/Color", "dojo/number", "dojo/dom-geometry", "dojox/gfx", "dojox/gfx/matrix"], function (require, exports, __extends, __decorate, decorators_1, Widget, watchUtils, widget_1, lang, Color, dojoNumber, domGeom, gfx, matrix) {
    "use strict";
    var CSS = {
        base: "apl-compass-plus",
        size_larger: "apl-compass-plus-larger",
        options: "apl-compass-plus-options"
    };
    var CompassDefaultFont = (function () {
        function CompassDefaultFont() {
        }
        CompassDefaultFont.family = "Avenir Next W00";
        CompassDefaultFont.style = "bold";
        CompassDefaultFont.sizeLargest = "19pt";
        CompassDefaultFont.sizeLarger = "15pt";
        CompassDefaultFont.sizeNormal = "11pt";
        CompassDefaultFont.sizeSmaller = "9pt";
        CompassDefaultFont.sizeSmallest = "7pt";
        return CompassDefaultFont;
    }());
    var CompassDefaultStyle = (function () {
        function CompassDefaultStyle() {
            // FONTS //
            this.indicatorFont = {
                family: CompassDefaultFont.family,
                style: CompassDefaultFont.style,
                size: CompassDefaultFont.sizeLargest
            };
            this.directionFont = {
                family: CompassDefaultFont.family,
                style: CompassDefaultFont.style,
                size: CompassDefaultFont.sizeLarger
            };
            this.coordinateFont = {
                family: CompassDefaultFont.family,
                style: CompassDefaultFont.style,
                size: CompassDefaultFont.sizeSmaller
            };
            // LINE WIDTHS //
            this.lineWidthMajor = 2.5;
            this.lineWidthMinor = 1.5;
            // COLORS //
            this.fontColorMajor = Color.named.white;
            this.fontColorMinor = Color.named.whitesmoke;
            this.fillColor = Color.named.white.concat(0.2);
            this.lineColor = Color.named.limegreen.concat(0.8);
            this.indicatorColor = Color.named.yellow;
            this.horizonColor = Color.named.darkred;
        }
        return CompassDefaultStyle;
    }());
    var CompassDarkStyle = (function (_super) {
        __extends(CompassDarkStyle, _super);
        function CompassDarkStyle() {
            _super.apply(this, arguments);
            // COLORS //
            this.fontColorMajor = Color.named.black;
            this.fontColorMinor = Color.named.darkgray;
            this.fillColor = Color.named.silver.concat(0.2);
            this.lineColor = Color.named.limegreen.concat(0.8);
            this.indicatorColor = Color.named.darkgoldenrod;
            this.horizonColor = Color.named.darkred;
        }
        return CompassDarkStyle;
    }(CompassDefaultStyle));
    var CompassParts = (function () {
        function CompassParts() {
        }
        return CompassParts;
    }());
    var CompassPlus = (function (_super) {
        __extends(CompassPlus, _super);
        function CompassPlus() {
            _super.apply(this, arguments);
            this.size = CompassPlus.SIZES.DEFAULT;
            this.style = CompassPlus.STYLES.DEFAULT;
            this.parts = new CompassParts();
        }
        CompassPlus.prototype.postInitialize = function () {
            var _this = this;
            // CAMERA HEADING //
            watchUtils.init(this, "view.camera.heading", function (heading) { return _this._update(heading); });
        };
        CompassPlus.prototype.render = function () {
            var classes = (_a = {},
                _a[CSS.size_larger] = (this.size === CompassPlus.SIZES.LARGER),
                _a
            );
            return (widget_1.jsxFactory.createElement("div", {bind: this, class: CSS.base, classes: classes, afterCreate: this._initialize}));
            var _a;
        };
        CompassPlus.prototype.reset = function (azimuth) {
            this.view.goTo({ heading: azimuth || 0.0 });
        };
        CompassPlus.prototype._initialize = function (containerNode) {
            // NODE CONTENT BOX //
            this.parts.nodeBox = domGeom.getContentBox(containerNode);
            // CENTER AND RADIUS //
            this.parts.nodeCenter = { x: this.parts.nodeBox.w * 0.5, y: this.parts.nodeBox.h * 0.5 };
            this.parts.outerRadius = (this.parts.nodeBox.h * 0.4);
            // GFX SURFACE //
            this.parts.surface = gfx.createSurface(containerNode, this.parts.nodeBox.w, this.parts.nodeBox.h);
            // GROUP - INDICATORS: AZIMUTH, HORIZON, COORDINATES, ALTITUDE, SCALE //
            this.parts.indicators = this.parts.surface.createGroup();
            // GROUP - OUTER CIRCLE WITH AZIMUTHS //
            this.parts.outerCircle = this.parts.surface.createGroup();
            this.parts.outerCircle.on("click", this.reset.bind(this));
            // OUTER CIRCLE //
            this.parts.outerCircle.createCircle({
                cx: this.parts.nodeCenter.x,
                cy: this.parts.nodeCenter.y,
                r: this.parts.outerRadius
            }).setStroke({
                color: this.style.lineColor,
                style: "solid",
                width: this.style.lineWidthMajor
            }).setFill(this.style.fillColor);
            // CENTER //
            this.parts.outerCircle.createCircle({
                cx: this.parts.nodeCenter.x,
                cy: this.parts.nodeCenter.y,
                r: 5.0
            }).setFill(this.style.lineColor);
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
            var directions = { "N": 0.0, "E": 90.0, "S": 180.0, "W": 270.0 };
            for (var direction in directions) {
                if (directions.hasOwnProperty(direction)) {
                    var directionAzi = directions[direction];
                    var directionLabelPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius - 40.0, directionAzi - 5.0);
                    var directionLabelPnt2 = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius - 40.0, directionAzi + 5.0);
                    this.parts.outerCircle.createTextPath({
                        decoration: "none",
                        kerning: true,
                        rotated: false,
                        align: "middle",
                        text: direction,
                    }).moveTo(directionLabelPnt.x, directionLabelPnt.y).lineTo(directionLabelPnt2.x, directionLabelPnt2.y)
                        .setFont(this.style.directionFont).setFill(this.style.fontColorMajor);
                }
            }
            // AZIMUTHS //
            var lineStroke = { color: this.style.lineColor, style: "solid", width: this.style.lineWidthMinor };
            for (var azi = 0.0; azi < 360.0; azi += 5.0) {
                var lineLength = (azi % 15 === 0) ? 20.0 : 5.0;
                var outerPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius, azi);
                var innerPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius - lineLength, azi);
                this.parts.outerCircle.createLine({
                    x1: outerPnt.x, y1: outerPnt.y,
                    x2: innerPnt.x, y2: innerPnt.y
                }).setStroke(lineStroke);
                if (azi % 15 === 0) {
                    var fontSize = (azi % 45 === 0) ? CompassDefaultFont.sizeNormal : CompassDefaultFont.sizeSmallest;
                    var fontColor = (azi % 45 === 0) ? this.style.fontColorMajor : this.style.fontColorMinor;
                    var labelPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius + 8.0, azi - 5.0);
                    var labelPnt2 = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius + 8.0, azi + 5.0);
                    this.parts.outerCircle.createTextPath({
                        align: "middle",
                        text: String(azi),
                        decoration: "none",
                        kerning: true,
                        rotated: false
                    }).moveTo(labelPnt.x, labelPnt.y).lineTo(labelPnt2.x, labelPnt2.y).setFont({
                        family: CompassDefaultFont.family,
                        style: CompassDefaultFont.style,
                        size: fontSize
                    }).setFill(fontColor);
                }
            }
            this._update(this.view.camera.heading);
        };
        CompassPlus.prototype._update = function (heading) {
            // UPDATE OUTER CIRCLE //
            if (this.parts.outerCircle) {
                this.parts.outerCircle.setTransform(matrix.rotategAt(-heading, this.parts.nodeCenter));
            }
            // UPDATE INDICATORS //
            if (this.parts.indicators) {
                this.parts.indicators.clear();
                // CLIP GEOMETRY //
                var clipGeometry = {
                    cx: this.parts.nodeCenter.x,
                    cy: this.parts.nodeCenter.y,
                    rx: this.parts.outerRadius,
                    ry: this.parts.outerRadius
                };
                // HORIZON Y //
                var horizonY = (this.parts.outerRadius * (90.0 - this.view.camera.tilt) / 90.0);
                // HORIZON LINE //
                this.parts.indicators.createLine({
                    x1: 0,
                    y1: this.parts.nodeCenter.y - horizonY,
                    x2: this.parts.nodeBox.w,
                    y2: this.parts.nodeCenter.y - horizonY
                }).setStroke({ color: this.style.horizonColor, style: "dash", width: 1.5 }).setClip(clipGeometry);
                // AZIMUTH //
                var arrowWidth = 1.5;
                var indicatorPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius, 0.0);
                var indicatorLabelPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius - 75.0, 0.0);
                this.parts.indicators.createLine({
                    x1: indicatorPnt.x,
                    y1: indicatorPnt.y,
                    x2: indicatorLabelPnt.x,
                    y2: indicatorLabelPnt.y - 20.0
                }).setStroke({ color: this.style.indicatorColor, style: "dot", width: arrowWidth });
                this.parts.indicators.createText({
                    x: indicatorLabelPnt.x,
                    y: indicatorLabelPnt.y,
                    align: "middle",
                    text: heading.toFixed(0) + "°",
                    kerning: true
                }).setFont(this.style.indicatorFont).setFill(this.style.indicatorColor);
                // COORDINATE, ALTITUDE, AND SCALE INFO //
                var ddPrecision = (this.view.zoom < 9) ? 1 : (Math.floor(this.view.zoom / 3) - 1);
                var coordinateInfo = {
                    lon: dojoNumber.format(this.view.camera.position.longitude, { places: ddPrecision }),
                    lat: dojoNumber.format(this.view.camera.position.latitude, { places: ddPrecision }),
                    alt: dojoNumber.format(this.view.camera.position.z, { places: 1 }),
                    scale: dojoNumber.format(this.view.scale, { places: 0 })
                };
                // COORDINATE TEXT //
                this.parts.indicators.createText({
                    x: this.parts.nodeCenter.x,
                    y: this.parts.nodeCenter.y + 25.0,
                    align: "middle",
                    text: lang.replace("{lon}, {lat}", coordinateInfo),
                    kerning: true
                }).setFont(this.style.coordinateFont).setFill(this.style.fontColorMajor);
                // ALTITUDE TEXT //
                this.parts.indicators.createText({
                    x: this.parts.nodeCenter.x,
                    y: this.parts.nodeCenter.y + 40.0,
                    align: "middle",
                    text: lang.replace("{alt} m", coordinateInfo),
                    kerning: true
                }).setFont(this.style.coordinateFont).setFill(this.style.fontColorMajor);
                // SCALE TEXT //
                this.parts.indicators.createText({
                    x: this.parts.nodeCenter.x,
                    y: this.parts.nodeCenter.y + 55.0,
                    align: "middle",
                    text: lang.replace("1: {scale}", coordinateInfo),
                    kerning: true
                }).setFont(this.style.coordinateFont).setFill(this.style.fontColorMajor);
            }
        };
        CompassPlus._pointTo = function (p, dist, azimuth) {
            var radians = (-azimuth + 90.0) * (Math.PI / 180.0);
            return {
                x: p.x + Math.cos(radians) * dist,
                y: p.y - Math.sin(radians) * dist
            };
        };
        CompassPlus.version = "0.0.1";
        CompassPlus.SIZES = {
            DEFAULT: 0,
            LARGER: 1
        };
        CompassPlus.STYLES = {
            DEFAULT: new CompassDefaultStyle(),
            DARK: new CompassDarkStyle()
        };
        __decorate([
            decorators_1.property()
        ], CompassPlus.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], CompassPlus.prototype, "size", void 0);
        __decorate([
            decorators_1.property()
        ], CompassPlus.prototype, "style", void 0);
        __decorate([
            decorators_1.property()
        ], CompassPlus.prototype, "parts", void 0);
        CompassPlus = __decorate([
            decorators_1.subclass("apl.widgets.CompassPlus")
        ], CompassPlus);
        return CompassPlus;
    }(decorators_1.declared(Widget)));
    return CompassPlus;
});
//# sourceMappingURL=CompassPlus.js.map