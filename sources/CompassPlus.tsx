/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// ESRI WIDGET //
import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import watchUtils = require("esri/core/watchUtils");
import {renderable, jsxFactory} from "esri/widgets/support/widget";

// ESRI SCENEVIEW //
import SceneView = require("esri/views/SceneView");

// DOJO //
import Color = require("dojo/colors");  // THIS WILL ALSO IMPORT THE CSS3 'named' COLORS...
import lang = require("dojo/_base/lang");
import dojoNumber = require("dojo/number");
import domGeom = require("dojo/dom-geometry");

// DOJOX //
import gfx = require("dojox/gfx");
import matrix = require("dojox/gfx/matrix");

// WIDGET CSS //
const CSS = {
    base: "apl-compass-plus",
    size_larger: "apl-compass-plus-larger"
};

// DEFAULT FONT //
class CompassDefaultFont {
    static family: string = "Avenir Next W00";
    static style: string = "bold";
    static sizeLargest: string = "19pt";
    static sizeLarger: string = "15pt";
    static sizeNormal: string = "11pt";
    static sizeSmaller: string = "9pt";
    static sizeSmallest: string = "7pt";
}

// DEFAULT STYLE //
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
    fillColor: gfx.ColorLike = (Color.named.white.concat(0.2) as dojo._base.ColorValueAlpha) as gfx.ColorLike;
    lineColor: gfx.ColorLike = Color.named.limegreen;
    indicatorColor: gfx.ColorLike = Color.named.yellow;
    horizonColor: gfx.ColorLike = Color.named.darkred;
}

// DARK STYLE //
class CompassDarkStyle extends CompassDefaultStyle {
    // DARK STYLE COLORS OVERRIDE //
    fontColorMajor: gfx.ColorLike = Color.named.black;
    fontColorMinor: gfx.ColorLike = Color.named.darkgray;
    indicatorColor: gfx.ColorLike = Color.named.darkgoldenrod;
}

// COMPASS PARTS //
class CompassParts {
    nodeBox: dojo.DomGeometryBox;
    nodeCenter: gfx.Point;
    outerRadius: number;
    surface: gfx.Surface;
    indicators: gfx.Group;
    outerCircle: gfx.Group;
}

// COMPASS PLUS WIDGET //
@subclass("apl.widgets.CompassPlus")
class CompassPlus extends declared(Widget) {
    // VERSION  //
    public static version: string = "0.0.1";

    // SIZES //
    public static SIZES = {
        DEFAULT: 0,
        LARGER: 1
    };

    // STYLES //
    public static STYLES = {
        DEFAULT: new CompassDefaultStyle(),
        DARK: new CompassDarkStyle()
    };

    @property()
    public view: SceneView;

    @property()
    public size: number = CompassPlus.SIZES.DEFAULT;

    @property()
    get style(): CompassDefaultStyle {
        return this._get("style");
    }

    set style(value: CompassDefaultStyle) {

        const oldValue = this._get<CompassDefaultStyle>("style");
        if (oldValue !== value) {
            this._set("style", value);
            this._styleUpdate();            
        }
    }

    private _parts: CompassParts = new CompassParts();

    private _ready: boolean = false;

    constructor() {
        super();
    }

    // POST INITIALIZE //
    postInitialize() {
        // CAMERA HEADING //
        watchUtils.init(this, "view.camera.heading", (heading) => this._updateIndicators(heading));
    }

    // JSX RENDER //
    render() {

        const classes = {
            [CSS.size_larger]: (this.size === CompassPlus.SIZES.LARGER)
        };

        return (
            <div bind={this} class={CSS.base} classes={classes} afterCreate={this._initializeCompass}></div>
        );
    }

    // RESET HEADING //
    protected reset(): void {
        this.view.goTo({heading: 0.0});
    }

    // INITIALIZE COMPASS //
    private _initializeCompass(containerNode: Element): void {

        // NODE CONTENT BOX //
        this._parts.nodeBox = domGeom.getContentBox(containerNode);

        // CENTER AND RADIUS //
        this._parts.nodeCenter = {x: this._parts.nodeBox.w * 0.5, y: this._parts.nodeBox.h * 0.5};
        this._parts.outerRadius = (this._parts.nodeBox.h * 0.4);

        // GFX SURFACE //
        this._parts.surface = gfx.createSurface(containerNode, this._parts.nodeBox.w, this._parts.nodeBox.h);

        // GROUP - INDICATORS: AZIMUTH, HORIZON, COORDINATES, ALTITUDE, SCALE //
        this._parts.indicators = this._parts.surface.createGroup();

        // GROUP - OUTER CIRCLE WITH AZIMUTHS //
        this._parts.outerCircle = this._parts.surface.createGroup();
        this._parts.outerCircle.on("click", this.reset.bind(this));

        // CREATE OUTER CIRCLE //
        this._createOuterCircle();
        // UPDATE INDICATORS //
        this._updateIndicators(this.view.camera.heading);

        // READY //
        this._ready = true;
    }


    private _styleUpdate(): void {
        if (this._ready) {
            // CREATE OUTER CIRCLE //
            this._createOuterCircle();
            // UPDATE INDICATORS //
            this._updateIndicators(this.view.camera.heading);
            // SCHEDULE RENDERER //
            this.scheduleRender();
        }
    }

    private _createOuterCircle(): void {

        if (this._parts.outerCircle) {
            this._parts.outerCircle.clear();
        }

        // OUTER CIRCLE //
        this._parts.outerCircle.createCircle({
            cx: this._parts.nodeCenter.x,
            cy: this._parts.nodeCenter.y,
            r: this._parts.outerRadius
        }).setStroke({
            color: this.style.lineColor,
            style: "solid",
            width: this.style.lineWidthMajor
        }).setFill(this.style.fillColor);

        // CENTER //
        this._parts.outerCircle.createCircle({
            cx: this._parts.nodeCenter.x,
            cy: this._parts.nodeCenter.y,
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
                let directionLabelPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius - 40.0, directionAzi - 5.0);
                let directionLabelPnt2 = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius - 40.0, directionAzi + 5.0);
                this._parts.outerCircle.createTextPath({
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
            let outerPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius, azi);
            let innerPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius - lineLength, azi);
            this._parts.outerCircle.createLine({
                x1: outerPnt.x, y1: outerPnt.y,
                x2: innerPnt.x, y2: innerPnt.y
            }).setStroke(lineStroke);

            if (azi % 15 === 0) {
                let fontSize = (azi % 45 === 0) ? CompassDefaultFont.sizeNormal : CompassDefaultFont.sizeSmallest;
                let fontColor = (azi % 45 === 0) ? this.style.fontColorMajor : this.style.fontColorMinor;
                let labelPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius + 8.0, azi - 5.0);
                let labelPnt2 = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius + 8.0, azi + 5.0);
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

    }

    // UPDATE OUTER CIRCLE AND INDICATORS //
    private _updateIndicators(heading: number): void {

        // UPDATE OUTER CIRCLE //
        if (this._parts.outerCircle) {
            this._parts.outerCircle.setTransform(matrix.rotategAt(-heading, this._parts.nodeCenter));
        }

        // UPDATE INDICATORS //
        if (this._parts.indicators) {
            this._parts.indicators.clear();

            // CLIP GEOMETRY //
            let clipGeometry = {
                cx: this._parts.nodeCenter.x,
                cy: this._parts.nodeCenter.y,
                rx: this._parts.outerRadius,
                ry: this._parts.outerRadius
            };

            // HORIZON Y //
            let horizonY = (this._parts.outerRadius * (90.0 - this.view.camera.tilt) / 90.0);
            // HORIZON LINE //
            this._parts.indicators.createLine({
                x1: 0,
                y1: this._parts.nodeCenter.y - horizonY,
                x2: this._parts.nodeBox.w,
                y2: this._parts.nodeCenter.y - horizonY
            }).setStroke({color: this.style.horizonColor, style: "dash", width: 1.5}).setClip(clipGeometry);

            // AZIMUTH //
            let arrowWidth = 1.5;
            let indicatorPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius, 0.0);
            let indicatorLabelPnt = CompassPlus._pointTo(this._parts.nodeCenter, this._parts.outerRadius - 75.0, 0.0);
            this._parts.indicators.createLine({
                x1: indicatorPnt.x,
                y1: indicatorPnt.y,
                x2: indicatorLabelPnt.x,
                y2: indicatorLabelPnt.y - 20.0
            }).setStroke({color: this.style.indicatorColor, style: "dot", width: arrowWidth});
            this._parts.indicators.createText({
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
            this._parts.indicators.createText({
                x: this._parts.nodeCenter.x,
                y: this._parts.nodeCenter.y + 25.0,
                align: "middle",
                text: lang.replace("{lon}, {lat}", coordinateInfo),
                kerning: true
            }).setFont(this.style.coordinateFont).setFill(this.style.fontColorMajor);
            // ALTITUDE TEXT //
            this._parts.indicators.createText({
                x: this._parts.nodeCenter.x,
                y: this._parts.nodeCenter.y + 40.0,
                align: "middle",
                text: lang.replace("{alt} m", coordinateInfo),
                kerning: true
            }).setFont(this.style.coordinateFont).setFill(this.style.fontColorMajor);
            // SCALE TEXT //
            this._parts.indicators.createText({
                x: this._parts.nodeCenter.x,
                y: this._parts.nodeCenter.y + 55.0,
                align: "middle",
                text: lang.replace("1: {scale}", coordinateInfo),
                kerning: true
            }).setFont(this.style.coordinateFont).setFill(this.style.fontColorMajor);

        }

    }

    // CALCULATE LOCATION BASED ON STARTING LOCATION, DISTANCE, AND AZIMUTH //
    private static _pointTo(p: gfx.Point, dist: number, azimuth: number): gfx.Point {
        let radians = (-azimuth + 90.0) * (Math.PI / 180.0);
        return {
            x: p.x + Math.cos(radians) * dist,
            y: p.y - Math.sin(radians) * dist
        };
    }

}
export = CompassPlus;
