import { fstat, writeFileSync } from "fs";
import { getFormattedFileStringArray } from "./utils";

export enum TokenType {
  KEYWORD,
  SYMBOL,
  IDENTIFIER,
  INT_CONST,
  STRING_CONST,
}

enum KeyWord {
  CLASS,
  METHOD,
  FUNCTION,
  CONSTRUCTOR,
  INT,
  BOOLEAN,
  CHAR,
  VOID,
  VAR,
  STATIC,
  FIELD,
  LET,
  DO,
  IF,
  ELSE,
  WHILE,
  RETURN,
  TRUE,
  FALSE,
  NULL,
  THIS,
}

// const tokenTypeValues = Object.values(TokenType);
const keywordValues = Object.values(KeyWord).map((value) =>
  (value as string).toLowerCase ? (value as string).toLowerCase() : ""
);
const isKeyword = (str: string) => keywordValues.includes(str);
const isIntConst = (str: string) => /^[0-9]+$/.test(str);
const isStringConst = (str: string) => /^".*"$/.test(str);
const isIdentifier = (str: string) => /^(?![0-9])\w+$/.test(str);

export class JackTokenizer {
  fileString: Array<string>;
  tokenStream: Array<string>;
  currentToken: string;
  filePath: string;

  constructor(path: string) {
    this.fileString = getFormattedFileStringArray(path);
    this.tokenStream = [];
    this.currentToken = "";
    this.filePath = path;
    this.initializer();
  }

  // transform file string into token stream;
  initializer() {
    const isCharOrDigit = /^[a-zA-Z0-9]$/;
    const fileString = this.fileString.join(" ");

    let str = "";
    let handlingStringConstant: boolean = false;

    for (let i = 0; i < fileString.length; i++) {
      let currentChar = fileString[i];

      // handle string constant
      if (handlingStringConstant === true) {
        str += currentChar;

        if (currentChar === '"') {
          handlingStringConstant = false;
          this.tokenStream.push(str);
          str = "";
        }
        continue;
      }

      if (isCharOrDigit.test(currentChar)) {
        // if is last char
        str += currentChar;
        //is last char
        if (i === fileString.length - 1) {
          this.tokenStream.push(str);
        }
      } else {
        if (str.length > 0) {
          this.tokenStream.push(str);
          str = "";
        }
        if (currentChar === '"') {
          str += currentChar;
          handlingStringConstant = true;
          continue;
        }
        //is space
        if (/\s/.test(currentChar)) {
          continue;
        }
        this.tokenStream.push(currentChar);
      }
    }
  }

  hasMoreTokens() {
    return this.tokenStream.length !== 0;
  }

  advance() {
    this.currentToken = this.tokenStream.shift() ?? "";
    return;
  }

  tokenType() {
    if (isKeyword(this.currentToken)) {
      return TokenType.KEYWORD;
    }
    if (isIntConst(this.currentToken)) {
      return TokenType.INT_CONST;
    }
    if (isStringConst(this.currentToken)) {
      return TokenType.STRING_CONST;
    }
    if (isIdentifier(this.currentToken)) {
      return TokenType.IDENTIFIER;
    }
    return TokenType.SYMBOL;
  }

  keyword() {
    // return this.currentToken;
    return `<keyword> ${this.currentToken} </keyword>`;
  }
  symbol() {
    let value = this.currentToken;
    switch (value) {
      case "<": {
        value = "&lt;";
        break;
      }
      case ">": {
        value = "&gt;";
        break;
      }
      case '"': {
        value = "&quot;";
        break;
      }
      case "&": {
        value = "&amp;";
        break;
      }
      default:
        break;
    }
    return `<symbol> ${value} </symbol>`;
    // return value;
  }
  identifier() {
    return `<identifier> ${this.currentToken} </identifier>`;
    // return this.currentToken;
  }
  intVal() {
    return `<integerConstant> ${this.currentToken} </integerConstant>`;
    // return this.currentToken;
  }
  stringVal() {
    // return this.currentToken.replace(/"/g, "");
    return `<stringConstant> ${this.currentToken.replace(
      /"/g,
      ""
    )} </stringConstant>`;
  }
}
