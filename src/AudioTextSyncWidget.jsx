import { createElement } from "react";

import { HelloWorldSample } from "./components/HelloWorldSample";
import "./ui/AudioTextSyncWidget.css";

export function AudioTextSyncWidget({ Base64, JSON, Line, isArabic }) {
    return <HelloWorldSample Base64={Base64} JSON={JSON} Line={Line} isArabic={isArabic} />;
}
