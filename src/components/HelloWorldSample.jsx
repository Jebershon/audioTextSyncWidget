import { createElement } from "react";
import { AudioTextSync } from "./AudioTextSync";

export function HelloWorldSample({ Base64, JSON, Line, isArabic }) {
    return <AudioTextSync Base64={Base64.value} jsondata={JSON.value} line={Line} isArabic={isArabic.value} />;
}
