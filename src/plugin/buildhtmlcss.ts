import { randomString } from "../shared";

interface node {
    [key: string]: any;
}

interface css {
    [key: string]: string;
}

interface figmaNode {
    [key: string]: any;
}

interface processedNode {
    id: String;
    _fid: String;
    name?: string;
    css: Object;
    children?: Array<String>;
    styles?: Object;
    parent?: String | boolean;
    text?: String;
    image?: Uint8Array;
    img?: String;
    export: Object | boolean;
}

const generateCssObj = (node: node): object => {
    let css: css = {};

    css.width = node.width + "px";
    css.height = node.height + "px";

    css.opacity = node.opacity;

    if (node.type !== "GROUP") {
        if ("fills" in node && node.fills.length > 0 && node.fills[0].type === "IMAGE") {
            switch (node.fills[0].scaleMode) {
                case "FILL":
                    css["object-fit"] = "cover";
                    break;
                case "FIT":
                    css["object-fit"] = "contain";
                    break;
            }
        }

        if ("fills" in node && node.fills.length > 0 && node.fills[0].opacity < 1 && node.fills[0].type === "SOLID") {
            css["background-color"] = RGBtoHSLA(
                node.fills[0].color.r * 255,
                node.fills[0].color.g * 255,
                node.fills[0].color.b * 255,
                node.fills[0].opacity
            );
        } else if (
            "fills" in node &&
            node.fills.length > 0 &&
            node.fills[0].opacity === 1 &&
            node.fills[0].type === "SOLID"
        ) {
            css["background-color"] = RGBtoHEX(
                Math.ceil(node.fills[0].color.r * 255),
                Math.ceil(node.fills[0].color.g * 255),
                Math.ceil(node.fills[0].color.b * 255)
            );
        }

        if (node.strokes.length > 0) {
            if (node.strokeTopWeight !== undefined) css["border-top-width"] = node.strokeTopWeight + "px";
            if (node.strokeBottomWeight !== undefined) css["border-bottom-width"] = node.strokeBottomWeight + "px";
            if (node.strokeBottomWeight !== undefined) css["border-left-width"] = node.strokeBottomWeight + "px";
            if (node.strokeRightWeight !== undefined) css["border-right-width"] = node.strokeRightWeight + "px";
        }

        // if we have a border set up
        if (node.strokes.length > 0) {
            css["border-right-style"] = "solid";
            css["border-left-style"] = "solid";
            css["border-top-style"] = "solid";
            css["border-bottom-style"] = "solid";

            let borderRBGa =
                "rgba(" +
                Math.ceil(node.strokes[0].color.r * 255) +
                ", " +
                Math.ceil(node.strokes[0].color.g * 255) +
                ", " +
                Math.ceil(node.strokes[0].color.b * 255) +
                ", " +
                node.strokes[0].opacity +
                ")";
            css["border-right-color"] = borderRBGa;
            css["border-left-color"] = borderRBGa;
            css["border-top-color"] = borderRBGa;
            css["border-bottom-color"] = borderRBGa;
        }

        if (node.bottomLeftRadius !== undefined) css["border-bottom-left-radius"] = node.bottomLeftRadius + "px";
        if (node.bottomRightRadius !== undefined) css["border-bottom-right-radius"] = node.bottomRightRadius + "px";
        if (node.topLeftRadius !== undefined) css["border-top-left-radius"] = node.topLeftRadius + "px";
        if (node.topRightRadius !== undefined) css["border-top-right-radius"] = node.topRightRadius + "px";

        if (node.paddingLeft !== undefined) css["padding-left"] = node.paddingLeft + "px";
        if (node.paddingRight !== undefined) css["padding-right"] = node.paddingRight + "px";
        if (node.paddingTop !== undefined) css["padding-top"] = node.paddingTop + "px";
        if (node.paddingBottom !== undefined) css["padding-bottom"] = node.paddingBottom + "px";

        if (node.type === "TEXT") {
            css["color"] = css["background-color"];
            delete css["background-color"];
            css["font-family"] = css["font-family"];
            css["font-weight"] = css["font-weight"];
            css["font-size"] = css["font-size"];
            css["line-height"] =
                node.lineHeight.unit === "AUTO"
                    ? "normal"
                    : `${node.lineHeight.value}${node.lineHeight.unit === "PIXELS" ? "px" : "%"}`;
            css["letter-spacing"] =
                node.letterSpacing.unit === "PIXELS"
                    ? node.letterSpacing.value + "px"
                    : `${node.letterSpacing.value / 100}rem`;
            css["text-align"] =
                node.textAlignHorizontal === "LEFT"
                    ? "start"
                    : node.textAlignHorizontal === "RIGHT"
                    ? "end"
                    : node.textAlignHorizontal === "CENTER"
                    ? "center"
                    : "justify";

            if (node.textAutoResize === "WIDTH_AND_HEIGHT") {
                delete css["width"];
                delete css["height"];
            } else if (node.textAutoResize === "HEIGHT") {
                delete css["height"];
            }
        }

        if (node.fontName !== undefined) {
            css["font-family"] = node.fontName.family;
            css["font-weight"] = node.fontWeight;
            css["font-size"] = node.fontSize + "px";
        }

        if (node.layoutGrow === 0) css["flex-grow"] = "0";
        else {
            css["flex-grow"] = "1";
            if (node.parent.layoutMode === "VERTICAL") delete css.height;
            else if (node.parent.layoutMode === "HORIZONTAL") delete css.width;
        }

        if (node.layoutAlign === "STRETCH") {
            if (node.parent.layoutMode === "VERTICAL") delete css.width;
            if (node.parent.layoutMode === "HORIZONTAL") delete css.height;
        }

        if (
            (node.type === "FRAME" ||
                node.type === "COMPONENT" ||
                node.type === "COMPONENT_SET" ||
                node.type === "INSTANCE") &&
            node.layoutMode !== "NONE"
        ) {
            css["display"] = "flex";

            if (node.layoutMode === "VERTICAL") {
                // flex vert
                // flex vert
                css["flex-direction"] = "column";

                if (node.counterAxisSizingMode === "AUTO") {
                    delete css.width;
                    css.display = "inline-flex";
                }

                if (node.primaryAxisSizingMode === "AUTO") delete css.height;

                css["row-gap"] = node.itemSpacing + "px";
            } else if (node.layoutMode === "HORIZONTAL") {
                // flex hor
                if (node.primaryAxisSizingMode === "AUTO") {
                    delete css.width;
                    css.display = "inline-flex";
                }
                if (node.counterAxisSizingMode === "AUTO") delete css.height;

                css["column-gap"] = node.itemSpacing + "px";
            }

            // primary axis
            switch (node.primaryAxisAlignItems) {
                case "CENTER":
                    css["justify-content"] = "center";
                    break;
                case "MIN":
                    css["justify-content"] = "flex-start";
                    break;
                case "MAX":
                    css["justify-content"] = "flex-end";
                    break;
                case "SPACE_BETWEEN":
                    css["justify-content"] = "space-between";
            }

            // cross axis
            switch (node.counterAxisAlignItems) {
                case "CENTER":
                    css["align-items"] = "center";
                    break;
                case "MIN":
                    css["align-items"] = "flex-start";
                    break;
                case "MAX":
                    css["align-items"] = "flex-end";
                    break;
                case "BASELINE":
                    css["align-items"] = "baseline";
            }

            // shadows?
            if ("effects" in node) {
                let shadows = node.effects.filter((n) => n.type === "DROP_SHADOW");
                let cssShadows = [];
                if (shadows.length > 0) {
                    for (let shadow of shadows) {
                        let cssShadow = `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${
                            shadow.spread
                        }px rgba(${shadow.color.r}, ${shadow.color.b}, ${shadow.color.g}, ${
                            Math.round(shadow.color.a * 100) / 100
                        })`;
                        cssShadows.push(cssShadow);
                    }
                    css["box-shadow"] = cssShadows.join(", ");
                }
            }
        }
    }

    // default properties; needs sorting out
    if (!("display" in css)) css.display = "inline-block";

    return css;
};

const RGBtoHSLA = (r: number, g: number, b: number, a: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0;
    const values = [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2,
    ];

    return (
        "hsla(" +
        values[0] +
        ", " +
        Math.round(values[1] * 100) / 100 +
        "%, " +
        Math.round(values[2] * 100) / 100 +
        "%, " +
        a +
        ")"
    );
};

const RGBtoHEX = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const generateHTMLandCSS = async (nodes: Array<figmaNode>) => {
    let data: Array<processedNode> = [];
    for (const node of nodes) {
        const figmaNode = figma.currentPage.findOne((n) => n.id === node.id);

        let processed: processedNode = {
            id: randomString(25),
            _fid: node.id,
            name: node.name,
            export:
                figmaNode.getPluginData("export") !== ""
                    ? JSON.parse(figmaNode.getPluginData("export"))
                    : { tag: "div" },
            css: generateCssObj(node),
            children: [],
            ...(node.type === "TEXT" && { characters: node.characters, segments: node.segments }),
        };

        if (node.type === "TEXT") {
            processed.text = node.characters;
        }

        // images?
        if ("fills" in node && node.fills.length > 0 && node.fills[0].type === "IMAGE") {
            const image = figma.getImageByHash(node.fills[0].imageHash);
            processed.image = await image.getBytesAsync();

            // JPG hex: FFD8FFE000104A46
            // PNG hex: 89504E470D0A1A0A

            let fileType;

            if (
                processed.image[0].toString(16) === "ff" &&
                processed.image[1].toString(16) === "d8" &&
                processed.image[2].toString(16) === "ff"
            ) {
                fileType = "jpg";
            } else if (
                processed.image[0].toString(16) === "89" &&
                processed.image[1].toString(16) === "50" &&
                processed.image[2].toString(16) === "4e"
            ) {
                fileType = "png";
            }

            let fileName = `${randomString(20)}.${fileType}`;

            processed.img = fileName;
        }

        data.push(processed);
    }

    // build out relationships
    for (let node of nodes as any) {
        // children
        if ("children" in node) {
            const parentFigmaNode = data.find((obj) => obj._fid === node.id)!;
            for (const child of node.children) {
                let childFigmaNode: processedNode = data.find((obj) => obj._fid === child.id)!;
                if (childFigmaNode !== undefined) parentFigmaNode.children?.push(childFigmaNode.id);
            }
        }

        // parent
        const parentFigmaNode = data.find((obj) => obj._fid === node.parent.id)!;
        const childFigmaNode = data.find((obj) => obj._fid === node.id)!;
        childFigmaNode.parent = parentFigmaNode !== undefined ? parentFigmaNode.id : false;
    }

    return data;
};
