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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/watchUtils", "esri/widgets/support/widget", "dojo/colors", "dojo/_base/lang", "dojo/number", "dojox/gfx", "dojox/gfx/matrix"], function (require, exports, __extends, __decorate, decorators_1, Widget, watchUtils, widget_1, Color, lang, dojoNumber, gfx, matrix) {
    "use strict";
    // WIDGET CSS //
    var CSS = {
        base: "apl-compass-plus",
        hidden: "apl-compass-plus-hidden"
    };
    // DEFAULT FONT //
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
    // DEFAULT STYLE //
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
            this.lineColor = Color.named.limegreen;
            this.indicatorColor = Color.named.yellow;
            this.horizonColor = Color.named.darkred;
        }
        return CompassDefaultStyle;
    }());
    // DARK STYLE //
    var CompassDarkStyle = (function (_super) {
        __extends(CompassDarkStyle, _super);
        function CompassDarkStyle() {
            _super.apply(this, arguments);
            // DARK STYLE COLORS OVERRIDE //
            this.fontColorMajor = Color.named.black;
            this.fontColorMinor = Color.named.darkgray;
            this.indicatorColor = Color.named.darkgoldenrod;
        }
        return CompassDarkStyle;
    }(CompassDefaultStyle));
    // COMPASS PARTS //
    var CompassParts = (function () {
        function CompassParts() {
        }
        return CompassParts;
    }());
    // COMPASS PLUS WIDGET //
    var CompassPlus = (function (_super) {
        __extends(CompassPlus, _super);
        function CompassPlus() {
            _super.apply(this, arguments);
            // VIEW //
            this.view = null;
            // VISIBLE //
            this.visible = true;
            // SIZE //
            this.size = CompassPlus.SIZES.DEFAULT;
            // STYLE //
            this._style = new CompassDefaultStyle();
            // GFX PARTS //
            this._parts = new CompassParts();
            // WIDGET READY //
            this._ready = false;
        }
        Object.defineProperty(CompassPlus.prototype, "style", {
            // STYLE //
            get: function () {
                return this._style;
            },
            set: function (value) {
                var oldValue = this._get("style");
                if (oldValue !== value) {
                    this._set("style", value);
                    this._style = value;
                    this._styleUpdated();
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
         * POST INITIALIZE
         */
        CompassPlus.prototype.postInitialize = function () {
            var _this = this;
            // CAMERA HEADING //
            watchUtils.init(this, "view.camera.heading", function (heading) { return _this._updateIndicators(heading); });
        };
        /**
         * JSX RENDER
         *
         * @returns {any}
         */
        CompassPlus.prototype.render = function () {
            var dynamicStyles = {
                width: this.size + "px",
                height: this.size + "px"
            };
            var classes = (_a = {},
                _a[CSS.hidden] = (!this.visible),
                _a
            );
            return (widget_1.jsxFactory.createElement("div", {bind: this, class: CSS.base, classes: classes, styles: dynamicStyles, afterCreate: this._initializeCompass}));
            var _a;
        };
        /**
         * RESET HEADING
         */
        CompassPlus.prototype.reset = function () {
            this.view.goTo({ heading: 0.0 });
        };
        /**
         * INITIALIZE COMPASS
         *
         * @param containerNode
         * @private
         */
        CompassPlus.prototype._initializeCompass = function (containerNode) {
            // CENTER AND RADIUS //
            this._parts.nodeCenter = { x: this.size * 0.5, y: this.size * 0.5 };
            this._parts.outerRadius = (this.size * 0.4);
            // GFX SURFACE //
            this._parts.surface = gfx.createSurface(containerNode, this.size, this.size);
            // GROUP - INDICATORS: AZIMUTH, HORIZON, COORDINATES, ALTITUDE, SCALE //
            this._parts.indicators = this._parts.surface.createGroup();
            // GROUP - OUTER CIRCLE WITH AZIMUTHS //
            this._parts.outerCircle = this._parts.surface.createGroup();
            this._parts.outerCircle.on("click", this.reset.bind(this));
            // CREATE OUTER CIRCLE //
            this._updateOuterCircle();
            // UPDATE INDICATORS //
            this._updateIndicators(this.view.camera.heading);
            // READY //
            this._ready = true;
        };
        /**
         *
         * @private
         */
        CompassPlus.prototype._styleUpdated = function () {
            if (this._ready) {
                // CREATE OUTER CIRCLE //
                this._updateOuterCircle();
                // UPDATE INDICATORS //
                this._updateIndicators(this.view.camera.heading);
                // SCHEDULE RENDERER //
                this.scheduleRender();
            }
        };
        /**
         *
         * @private
         */
        CompassPlus.prototype._updateOuterCircle = function () {
            if (this._parts.outerCircle) {
                this._parts.outerCircle.clear();
            }
            // OUTER CIRCLE //
            this._parts.outerCircle.createCircle({
                cx: this._parts.nodeCenter.x,
                cy: this._parts.nodeCenter.y,
                r: this._parts.outerRadius
            }).setStroke({
                color: this._style.lineColor,
                style: "solid",
                width: this._style.lineWidthMajor
            }).setFill(this._style.fillColor);
            // CENTER //
            this._parts.outerCircle.createCircle({
                cx: this._parts.nodeCenter.x,
                cy: this._parts.nodeCenter.y,
                r: 5.0
            }).setFill(this._style.lineColor);
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
                    var directionLabelPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius - 40.0, directionAzi - 5.0);
                    var directionLabelPnt2 = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius - 40.0, directionAzi + 5.0);
                    this._parts.outerCircle.createTextPath({
                        decoration: "none",
                        kerning: true,
                        rotated: false,
                        align: "middle",
                        text: direction,
                    }).moveTo(directionLabelPnt.x, directionLabelPnt.y).lineTo(directionLabelPnt2.x, directionLabelPnt2.y)
                        .setFont(this._style.directionFont).setFill(this._style.fontColorMajor);
                }
            }
            // AZIMUTHS //
            var lineStroke = { color: this._style.lineColor, style: "solid", width: this._style.lineWidthMinor };
            for (var azi = 0.0; azi < 360.0; azi += 5.0) {
                var lineLength = (azi % 15 === 0) ? 20.0 : 5.0;
                var outerPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius, azi);
                var innerPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius - lineLength, azi);
                this._parts.outerCircle.createLine({
                    x1: outerPnt.x, y1: outerPnt.y,
                    x2: innerPnt.x, y2: innerPnt.y
                }).setStroke(lineStroke);
                if (azi % 15 === 0) {
                    var fontSize = (azi % 45 === 0) ? CompassDefaultFont.sizeNormal : CompassDefaultFont.sizeSmallest;
                    var fontColor = (azi % 45 === 0) ? this._style.fontColorMajor : this._style.fontColorMinor;
                    var labelPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius + 8.0, azi - 5.0);
                    var labelPnt2 = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius + 8.0, azi + 5.0);
                    this._parts.outerCircle.createTextPath({
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
        };
        /**
         * UPDATE OUTER CIRCLE AND INDICATORS
         *
         * @param heading number
         * @private
         */
        CompassPlus.prototype._updateIndicators = function (heading) {
            // UPDATE OUTER CIRCLE //
            if (this._parts.outerCircle) {
                this._parts.outerCircle.setTransform(matrix.rotategAt(-heading, this._parts.nodeCenter));
            }
            // UPDATE INDICATORS //
            if (this._parts.indicators) {
                this._parts.indicators.clear();
                // CLIP GEOMETRY //
                var clipGeometry = {
                    cx: this._parts.nodeCenter.x,
                    cy: this._parts.nodeCenter.y,
                    rx: this._parts.outerRadius,
                    ry: this._parts.outerRadius
                };
                // HORIZON Y //
                var horizonY = (this._parts.outerRadius * (90.0 - this.view.camera.tilt) / 90.0);
                // HORIZON LINE //
                this._parts.indicators.createLine({
                    x1: 0,
                    y1: this._parts.nodeCenter.y - horizonY,
                    x2: this.size,
                    y2: this._parts.nodeCenter.y - horizonY
                }).setStroke({ color: this._style.horizonColor, style: "dash", width: 1.5 }).setClip(clipGeometry);
                // AZIMUTH //
                var arrowWidth = 1.5;
                var indicatorPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius, 0.0);
                var indicatorLabelPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius - 75.0, 0.0);
                this._parts.indicators.createLine({
                    x1: indicatorPnt.x,
                    y1: indicatorPnt.y,
                    x2: indicatorLabelPnt.x,
                    y2: indicatorLabelPnt.y - 20.0
                }).setStroke({ color: this._style.indicatorColor, style: "dot", width: arrowWidth });
                this._parts.indicators.createText({
                    x: indicatorLabelPnt.x,
                    y: indicatorLabelPnt.y,
                    align: "middle",
                    text: heading.toFixed(0) + "°",
                    kerning: true
                }).setFont(this._style.indicatorFont).setFill(this._style.indicatorColor);
                // COORDINATE, ALTITUDE, AND SCALE INFO //
                var ddPrecision = (this.view.zoom < 9) ? 1 : (Math.floor(this.view.zoom / 3) - 1);
                var coordinateInfo = {
                    lon: dojoNumber.format(this.view.camera.position.longitude, { places: ddPrecision }),
                    lat: dojoNumber.format(this.view.camera.position.latitude, { places: ddPrecision }),
                    alt: dojoNumber.format(this.view.camera.position.z, { places: 1 }),
                    scale: dojoNumber.format(this.view.scale, { places: 0 })
                };
                // COORDINATE TEXT //
                this._parts.indicators.createText({
                    x: this._parts.nodeCenter.x,
                    y: this._parts.nodeCenter.y + 25.0,
                    align: "middle",
                    text: lang.replace("{lon}, {lat}", coordinateInfo),
                    kerning: true
                }).setFont(this._style.coordinateFont).setFill(this._style.fontColorMajor);
                // ALTITUDE TEXT //
                this._parts.indicators.createText({
                    x: this._parts.nodeCenter.x,
                    y: this._parts.nodeCenter.y + 40.0,
                    align: "middle",
                    text: lang.replace("{alt} m", coordinateInfo),
                    kerning: true
                }).setFont(this._style.coordinateFont).setFill(this._style.fontColorMajor);
                // SCALE TEXT //
                this._parts.indicators.createText({
                    x: this._parts.nodeCenter.x,
                    y: this._parts.nodeCenter.y + 55.0,
                    align: "middle",
                    text: lang.replace("1: {scale}", coordinateInfo),
                    kerning: true
                }).setFont(this._style.coordinateFont).setFill(this._style.fontColorMajor);
            }
        };
        /**
         * CALCULATE END LOCATION BASED ON STARTING LOCATION, DISTANCE, AND AZIMUTH
         *
         * @param p
         * @param dist
         * @param azimuth
         * @returns {{x: number, y: number}}
         * @private
         */
        CompassPlus._pointTo = function (p, dist, azimuth) {
            var radians = (-azimuth + 90.0) * (Math.PI / 180.0);
            return {
                x: p.x + Math.cos(radians) * dist,
                y: p.y - Math.sin(radians) * dist
            };
        };
        // VERSION  //
        CompassPlus.version = "0.0.1";
        // SIZES //
        CompassPlus.SIZES = {
            DEFAULT: 300,
            LARGER: 450
        };
        // STYLES //
        CompassPlus.STYLES = {
            DEFAULT: new CompassDefaultStyle(),
            DARK: new CompassDarkStyle()
        };
        __decorate([
            decorators_1.property()
        ], CompassPlus.prototype, "view", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], CompassPlus.prototype, "visible", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], CompassPlus.prototype, "size", void 0);
        __decorate([
            decorators_1.property()
        ], CompassPlus.prototype, "style", null);
        CompassPlus = __decorate([
            decorators_1.subclass("apl.widgets.CompassPlus")
        ], CompassPlus);
        return CompassPlus;
    }(decorators_1.declared(Widget)));
    return CompassPlus;
});
//# sourceMappingURL=CompassPlus.js.map