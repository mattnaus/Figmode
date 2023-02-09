figma.showUI(__html__, { width: 640, height: 700, themeColors: true });

figma.ui.onmessage = (msg) => {
    if (msg.type === "cancel") {
        figma.closePlugin();
    }
};
