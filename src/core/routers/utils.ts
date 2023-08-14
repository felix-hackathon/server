import fs from "fs";
import { getAllFileInDirectory } from "../utils";
import path from "path";
import { fileURLToPath } from "url";

export const getAllFileInModules = () => {
  let allFile: string[] = [];

  const files = fs.readdirSync(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "../../modules")
  );
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.includes(".ts") && !file.includes("deleted")) {
      allFile = [
        ...allFile,
        ...getAllFileInDirectory(
          `${path.join(
            path.dirname(fileURLToPath(import.meta.url)),
            "../../modules/" + file
          )}`
        ),
      ];
    }
  }
  return allFile;
};
