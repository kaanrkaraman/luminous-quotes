import { toPng } from "html-to-image";

export async function downloadQuoteAsImage(element: HTMLElement, filename = "quote") {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      cacheBust: true,
    });

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to export image:", error);
    throw error;
  }
}
