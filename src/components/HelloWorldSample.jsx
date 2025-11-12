import { createElement } from "react";
import { AudioTextSync } from "./AudioTextSync";

export function HelloWorldSample({ Base64, JSON, Line }) {
    return <AudioTextSync Base64={Base64.value} jsondata={JSON.value} line={Line} />;
}
