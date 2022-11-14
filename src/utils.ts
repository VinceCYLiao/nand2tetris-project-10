import fs from "fs";

export const readFile = (path: string) => fs.readFileSync(path, "utf-8");

const commentPattern =
  /^\/\/.*$|^\/\*\*.*\*\/$| \/\/.*$|^\/\*\*.*$|^\*.*$|^\*\//;

export const stripCommentAndWhiteSpace = (str: string) =>
  str.trim().replace(commentPattern, "");

export const getFormattedFileStringArray = (path: string) => {
  const rawStr = readFile(path);
  const rawStrArray = rawStr.split(/\r\n|\r|\n/);
  const formattedStrArray = rawStrArray
    .map((raw) => stripCommentAndWhiteSpace(raw))
    .filter((line) => line !== "");
  return formattedStrArray;
};
