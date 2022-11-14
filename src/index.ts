import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "fs";
import { CompilationEngine } from "./compilationEngine";
import { JackTokenizer, TokenType } from "./jackTokenizer";

const filesToHandle = [];

let pathArg = process.argv[2];

let writePath = pathArg + "out/";

if (existsSync(pathArg) && lstatSync(pathArg).isDirectory()) {
  const files = readdirSync(pathArg);

  //suffix pathArg
  if (pathArg[pathArg.length - 1] !== "/") {
    pathArg += "/";
  }

  files.forEach((file) => {
    if (file.includes(".jack")) {
      filesToHandle.push(pathArg + file);
    }
  });
} else {
  filesToHandle.push(pathArg);
  writePath = writePath
    .split("/")
    .filter((string) => !string.includes(".jack"))
    .join("/");
}

// if out does not exist, create it
if (!existsSync(writePath)) {
  mkdirSync(writePath, { recursive: true });
}

for (const file of filesToHandle) {
  const tokenized: Array<string> = [];
  const pushToTokenized = (token: string) => tokenized.push(token);

  const t = new JackTokenizer(file);

  while (t.hasMoreTokens()) {
    t.advance();
    switch (t.tokenType()) {
      case TokenType.KEYWORD: {
        pushToTokenized(t.keyword());
        break;
      }
      case TokenType.SYMBOL: {
        pushToTokenized(t.symbol());
        break;
      }
      case TokenType.IDENTIFIER: {
        pushToTokenized(t.identifier());
        break;
      }
      case TokenType.INT_CONST: {
        pushToTokenized(t.intVal());
        break;
      }
      case TokenType.STRING_CONST: {
        pushToTokenized(t.stringVal());
        break;
      }
      default:
        break;
    }
  }

  let c = new CompilationEngine(tokenized);

  const data = `${c.processedTokens.join("\r\n")}`;

  writeFileSync(
    writePath + file.split("/").pop()?.replace(".jack", ".xml"),
    data
  );
}
