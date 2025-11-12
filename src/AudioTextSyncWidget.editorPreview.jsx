import { createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

export function preview({ Base64, JSON, Line }) {
    return <HelloWorldSample Base64={Base64} JSON={JSON} Line={Line} />;
}

export function getPreviewCss() {
    return require("./ui/AudioTextSyncWidget.css");
}
