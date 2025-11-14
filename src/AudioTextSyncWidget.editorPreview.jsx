import { createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

export function preview({ Base64, JSON, Line, isArabic }) {
    return <HelloWorldSample Base64={Base64} JSON={JSON} Line={Line} isArabic={isArabic} />;
}

export function getPreviewCss() {
    return require("./ui/AudioTextSyncWidget.css");
}
