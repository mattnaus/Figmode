import { generateHTMLandCSS } from "./buildhtmlcss";

interface node {
    [key: string]: any;
}

figma.showUI(__html__, { width: 640, height: 700, themeColors: true });

figma.ui.onmessage = (msg) => {
    if (msg.type === "cancel") {
        figma.closePlugin();
    }
};

const getAllPropertyDescriptors = (obj: object): object => {
    if (!obj) {
        return Object.create(null);
    } else {
        const proto = Object.getPrototypeOf(obj);
        return {
            ...getAllPropertyDescriptors(proto),
            ...(<any>Object).getOwnPropertyDescriptors(obj),
        };
    }
};

const traverse = (node: SceneNode) => {
    let nodeObj: node = {};

    for (const [key, value] of (<any>Object).entries(getAllPropertyDescriptors(node))) {
        if (
            key === "constructor" ||
            key === "toString" ||
            key === "toLocaleString" ||
            key === "valueOf" ||
            key === "hasOwnProperty" ||
            key === "isPrototypeOf" ||
            key === "propertyIsEnumerable" ||
            key === "__defineGetter__" ||
            key === "__defineSetter__" ||
            key === "__lookupGetter__" ||
            key === "__lookupSetter__" ||
            key === "__proto__" ||
            key === "cornerRadius" ||
            key === "horizontalPadding"
        ) {
            continue;
        }

        if (
            typeof node[key as keyof typeof node] !== "function" &&
            typeof node[key as keyof typeof node] !== "symbol"
        ) {
            //console.log(selectedNode[key as keyof typeof selectedNode]);
            nodeObj[key] = node[key as keyof typeof node];
        }
    }

    if (node.type === "TEXT") {
        nodeObj.segments = node.getStyledTextSegments([
            "fontSize",
            "fontName",
            "fontWeight",
            "textDecoration",
            "textCase",
            "fills",
        ]);
    }

    if (Object.keys(nodeObj).length > 0 && node.visible) {
        tempNodes.push(nodeObj);
    } else {
        return false;
    }

    if ("children" in node) {
        let kids = node.children.slice();
        for (const child of kids) {
            traverse(child);
        }
    }
};

let tempNodes = [];
let sizes = [];
const screenFrames = [];
const regex = new RegExp("@[0-9]*");

const getGoing = async () => {
    for (let node of figma.currentPage.children) {
        if (node.type === "FRAME" && regex.test(node.name)) {
            //console.log(node.name);
            const size = node.name.match(/@[0-9]*/g)[0];
            sizes.push(size);
            //console.log(size);

            tempNodes = [];
            traverse(node);

            screenFrames[size] = tempNodes;
        }
    }

    // first check; each screensize frame should have the same number of nodes
    let length = screenFrames[Object.keys(screenFrames)[0]].length;

    for (let size in screenFrames) {
        if (screenFrames[size].length !== length) {
            figma.ui.postMessage({ err: `Screensize frame ${size} node tree is not correct.` });
            delete screenFrames[size];
            sizes = sizes.filter((n) => n !== size);
        }
    }

    // check for some individual properties
    for (let [i, node] of screenFrames[Object.keys(screenFrames)[0]].entries()) {
        console.log(node);
    }

    //console.log(screenFrames, sizes);
};

getGoing();
