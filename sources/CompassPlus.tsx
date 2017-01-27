/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");
import watchUtils = require("esri/core/watchUtils");
import {renderable, jsxFactory} from "esri/widgets/support/widget";

import SceneView = require("esri/views/SceneView");

import lang = require("dojo/_base/lang");
import Color = require("dojo/_base/Color");
import colors = require("dojo/colors");
import dojoNumber = require("dojo/number");
import domClass = require("dojo/dom-class");
import domGeom = require("dojo/dom-geometry");

import gfx = require("dojox/gfx");
import matrix = require("dojox/gfx/matrix");

const CSS = {
    base: "apl-compass-plus",
    size_larger: "apl-compass-plus-larger",
    options: "apl-compass-plus-options"
};

class CompassDefaultFont {
    static family: string = "Avenir Next W00";
    static style: string = "bold";
    static sizeLargest: string = "19pt";
    static sizeLarger: string = "15pt";
    static sizeNormal: string = "11pt";
    static sizeSmaller: string = "9pt";
    static sizeSmallest: string = "7pt";
}

class CompassDefaultStyle {
    // FONTS //
    indicatorFont: gfx.Font = {
        family: CompassDefaultFont.family,
        style: CompassDefaultFont.style,
        size: CompassDefaultFont.sizeLargest
    };
    directionFont: gfx.Font = {
        family: CompassDefaultFont.family,
        style: CompassDefaultFont.style,
        size: CompassDefaultFont.sizeLarger
    };
    coordinateFont: gfx.Font = {
        family: CompassDefaultFont.family,
        style: CompassDefaultFont.style,
        size: CompassDefaultFont.sizeSmaller
    };
    // LINE WIDTHS //
    lineWidthMajor: number = 2.5;
    lineWidthMinor: number = 1.5;
    // COLORS //
    fontColorMajor: gfx.ColorLike = Color.named.white;
    fontColorMinor: gfx.ColorLike = Color.named.whitesmoke;
    fillColor: gfx.ColorLike = Color.named.white.concat(0.2) as gfx.ColorLike;
    lineColor: gfx.ColorLike = Color.named.limegreen.concat(0.8) as gfx.ColorLike;
    indicatorColor: gfx.ColorLike = Color.named.yellow;
    horizonColor: gfx.ColorLike = Color.named.darkred;
}

class CompassDarkStyle extends CompassDefaultStyle {
    // COLORS //
    fontColorMajor: gfx.ColorLike = Color.named.black;
    fontColorMinor: gfx.ColorLike = Color.named.darkgray;
    fillColor: gfx.ColorLike = Color.named.silver.concat(0.2) as gfx.ColorLike;
    lineColor: gfx.ColorLike = Color.named.limegreen.concat(0.8) as gfx.ColorLike;
    indicatorColor: gfx.ColorLike = Color.named.darkgoldenrod;
    horizonColor: gfx.ColorLike = Color.named.darkred;
}

class CompassParts {
    nodeBox: dojo.DomGeometryBox;
    nodeCenter: gfx.Point;
    outerRadius: number;
    surface: gfx.Surface;
    indicators: gfx.Group;
    outerCircle: gfx.Group;
}


@subclass("apl.widgets.CompassPlus")
class CompassPlus extends declared(Widget) {

    static version: string = "0.0.1";

    static SIZES = {
        DEFAULT: 0,
        LARGER: 1
    };

    static STYLES = {
        DEFAULT: new CompassDefaultStyle(),
        DARK: new CompassDarkStyle()
    };

    @property()
    view: SceneView;

    @property()
    size: number = CompassPlus.SIZES.DEFAULT;

    @property()
    style: CompassDefaultStyle = CompassPlus.STYLES.DEFAULT;

    @property()
    parts: CompassParts = new CompassParts();

    postInitialize() {
        // CAMERA HEADING //
        watchUtils.init(this, "view.camera.heading", (heading) => this._update(heading));
    }

    render() {

        const classes = {
            [CSS.size_larger]: (this.size === CompassPlus.SIZES.LARGER)
        };

        return (
            <div bind={this} class={CSS.base} classes={classes} afterCreate={this._initialize}></div>
        );
    }

    reset(azimuth: number) {
        this.view.goTo({heading: azimuth || 0.0});
    }

    private _initialize(containerNode: Element) {

        // NODE CONTENT BOX //
        this.parts.nodeBox = domGeom.getContentBox(containerNode);

        // CENTER AND RADIUS //
        this.parts.nodeCenter = {x: this.parts.nodeBox.w * 0.5, y: this.parts.nodeBox.h * 0.5};
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
        let directions = {"N": 0.0, "E": 90.0, "S": 180.0, "W": 270.0};
        for (let direction in directions) {
            if (directions.hasOwnProperty(direction)) {
                let directionAzi = directions[direction];
                let directionLabelPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius - 40.0, directionAzi - 5.0);
                let directionLabelPnt2 = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius - 40.0, directionAzi + 5.0);
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
        let lineStroke = {color: this.style.lineColor, style: "solid", width: this.style.lineWidthMinor};
        for (let azi = 0.0; azi < 360.0; azi += 5.0) {

            let lineLength = (azi % 15 === 0) ? 20.0 : 5.0;
            let outerPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius, azi);
            let innerPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius - lineLength, azi);
            this.parts.outerCircle.createLine({
                x1: outerPnt.x, y1: outerPnt.y,
                x2: innerPnt.x, y2: innerPnt.y
            }).setStroke(lineStroke);

            if (azi % 15 === 0) {
                let fontSize = (azi % 45 === 0) ? CompassDefaultFont.sizeNormal : CompassDefaultFont.sizeSmallest;
                let fontColor = (azi % 45 === 0) ? this.style.fontColorMajor : this.style.fontColorMinor;
                let labelPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius + 8.0, azi - 5.0);
                let labelPnt2 = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius + 8.0, azi + 5.0);
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
    }

    private _update(heading: number) {

        // UPDATE OUTER CIRCLE //
        if (this.parts.outerCircle) {
            this.parts.outerCircle.setTransform(matrix.rotategAt(-heading, this.parts.nodeCenter));
        }

        // UPDATE INDICATORS //
        if (this.parts.indicators) {
            this.parts.indicators.clear();

            // CLIP GEOMETRY //
            let clipGeometry = {
                cx: this.parts.nodeCenter.x,
                cy: this.parts.nodeCenter.y,
                rx: this.parts.outerRadius,
                ry: this.parts.outerRadius
            };

            // HORIZON Y //
            let horizonY = (this.parts.outerRadius * (90.0 - this.view.camera.tilt) / 90.0);
            // HORIZON LINE //
            this.parts.indicators.createLine({
                x1: 0,
                y1: this.parts.nodeCenter.y - horizonY,
                x2: this.parts.nodeBox.w,
                y2: this.parts.nodeCenter.y - horizonY
            }).setStroke({color: this.style.horizonColor, style: "dash", width: 1.5}).setClip(clipGeometry);

            // AZIMUTH //
            let arrowWidth = 1.5;
            let indicatorPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius, 0.0);
            let indicatorLabelPnt = CompassPlus._pointTo(this.parts.nodeCenter, this.parts.outerRadius - 75.0, 0.0);
            this.parts.indicators.createLine({
                x1: indicatorPnt.x,
                y1: indicatorPnt.y,
                x2: indicatorLabelPnt.x,
                y2: indicatorLabelPnt.y - 20.0
            }).setStroke({color: this.style.indicatorColor, style: "dot", width: arrowWidth});
            this.parts.indicators.createText({
                x: indicatorLabelPnt.x,
                y: indicatorLabelPnt.y,
                align: "middle",
                text: heading.toFixed(0) + "°",
                kerning: true
            }).setFont(this.style.indicatorFont).setFill(this.style.indicatorColor);

            // COORDINATE, ALTITUDE, AND SCALE INFO //
            let ddPrecision = (this.view.zoom < 9) ? 1 : (Math.floor(this.view.zoom / 3) - 1);
            let coordinateInfo = {
                lon: dojoNumber.format(this.view.camera.position.longitude, {places: ddPrecision}),
                lat: dojoNumber.format(this.view.camera.position.latitude, {places: ddPrecision}),
                alt: dojoNumber.format(this.view.camera.position.z, {places: 1}),
                scale: dojoNumber.format(this.view.scale, {places: 0})
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

    }


    private static _pointTo(p: gfx.Point, dist: number, azimuth: number) {
        let radians = (-azimuth + 90.0) * (Math.PI / 180.0);
        return {
            x: p.x + Math.cos(radians) * dist,
            y: p.y - Math.sin(radians) * dist
        };
    }

}

export = CompassPlus;
