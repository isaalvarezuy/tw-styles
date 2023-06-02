// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === "generate-colors") {
    generateColorsFromStyles();
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  /* figma.closePlugin(); */
};

const generateColorsFromStyles = () => {
  const colors = [];
  const fillStyles = figma.getLocalPaintStyles();

  const solidFillStyles: PaintStyle[] = fillStyles.filter(
    (colorStyle) => colorStyle.paints[0].type === "SOLID"
  );
  for (const style of solidFillStyles) {
    const color = style.paints[0].color;
    colors.push({ name: style.name, color: rgbToHex(color) });
  }

  const tailwindColors = generateTailwindColors(colors);
  console.log(tailwindColors);

  figma.ui.postMessage({ type: "tailwind-colors", colors: tailwindColors });
  console.log("message sent");
};

const rgbToHex = (rgbColor: RGB) => {
  const red = Math.round(rgbColor.r * 255);
  const green = Math.round(rgbColor.g * 255);
  const blue = Math.round(rgbColor.b * 255);

  const rHex = red.toString(16).padStart(2, "0");
  const gHex = green.toString(16).padStart(2, "0");
  const bHex = blue.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
};

const generateTailwindColors = (colors) => {
  const tailwindColors = {};

  colors.forEach((color) => {
    const [prefix, variant] = color.name.split("/");
    console.log(prefix, variant);
    const name = color.name.replace("/", "-");
    if (variant) {
      tailwindColors[prefix] = {
        ...tailwindColors[prefix],
        [variant]: color.color,
      };
    } else {
      tailwindColors[prefix] = color.color;
    }
  });

  return {
    theme: {
      extend: {
        colors: tailwindColors,
      },
    },
  };
};
