figma.showUI(__html__);

figma.ui.onmessage = (msg) => {
  if (msg.type === "generate-colors") {
    generateColorsFromStyles();
  }
};

const generateColorsFromStyles = () => {
  const colors = [];
  const fillStyles = figma.getLocalPaintStyles();

  const solidFillStyles: PaintStyle[] = fillStyles.filter(
    (colorStyle) => colorStyle.paints[0].type === "SOLID"
  );

  for (let i = 0; i < solidFillStyles.length; i++) {
    const currentSolidStyle = solidFillStyles[i].paints[0] as SolidPaint;
    const color = currentSolidStyle.color;
    colors.push({ name: solidFillStyles[i].name, color: rgbToHex(color) });
  }

  const tailwindColors = generateTailwindColors(colors);

  figma.ui.postMessage({ type: "tailwind-colors", colors: tailwindColors });
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

const generateTailwindColors = (colors: { name: string; color: string }[]) => {
  const tailwindColors: { [key: string]: string | { [key: string]: string } } =
    {};

  colors.forEach((color) => {
    const [prefix, variant] = color.name.split("/");
    if (variant) {
      tailwindColors[prefix.toLowerCase()] = {
        ...(tailwindColors[prefix.toLowerCase()] as Record<string, string>),
        [variant]: color.color,
      };
    } else {
      tailwindColors[prefix.toLowerCase()] = color.color;
    }
  });

  return {
    colors: tailwindColors,
  };
};
