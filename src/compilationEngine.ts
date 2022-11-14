export class CompilationEngine {
  tokenSteam: Array<string>;
  currentToken: string;
  processedTokens: Array<string>;

  constructor(tokens: Array<string>) {
    this.tokenSteam = tokens;
    this.currentToken = "";
    this.processedTokens = [];
    this.advance();
    this.compileClass();
  }

  private advance() {
    this.currentToken = this.tokenSteam.shift() ?? "";
  }

  private currentTokenValue() {
    return this.currentToken.replace(/<\/{0,1}[a-z]+>/gi, "").trim();
  }

  private process(expected?: string) {
    const value = this.currentTokenValue();
    if (expected && value !== expected) {
      console.log(this.tokenSteam);
      console.dir(this.processedTokens, { maxArrayLength: null });
      console.log("expected", expected);
      console.log("value is", value);
      throw new Error(`Syntax error`);
    }
    this.processedTokens.push(this.currentToken);
    this.advance();
  }

  private handleStatements() {
    this.processedTokens.push("<statements>");
    while (this.currentTokenValue() !== "}") {
      switch (this.currentTokenValue()) {
        case "let": {
          this.compileLetStatement();
          break;
        }
        case "if": {
          this.compileIfStatement();
          break;
        }
        case "while": {
          this.compileWhileStatement();
          break;
        }
        case "do": {
          this.compileDoStatement();
          break;
        }
        case "return": {
          this.compileReturnStatement();
          break;
        }
        default:
          break;
      }
    }
    this.processedTokens.push("</statements>");
  }

  compileClass() {
    this.processedTokens.push("<class>");
    this.process("class");
    this.process();
    this.process("{");

    while (
      this.currentTokenValue() === "static" ||
      this.currentTokenValue() === "field"
    ) {
      this.compileClassVarDec();
    }

    while (this.currentToken && this.tokenSteam.length !== 0) {
      this.compileSubroutineDec();
    }
    this.process("}");
    this.processedTokens.push("</class>");
  }

  compileClassVarDec() {
    this.processedTokens.push("<classVarDec>");
    // (static|field)
    this.process();
    // type
    this.process();
    // varName
    this.process();
    while (this.currentTokenValue() === ",") {
      this.process(",");
      this.process();
    }
    this.process(";");
    this.processedTokens.push("</classVarDec>");
  }

  compileSubroutineDec() {
    this.processedTokens.push("<subroutineDec>");
    // constructor|function|mehod
    this.process();
    // void | type
    this.process();
    // subroutine name
    this.process();
    this.process("(");

    this.compileParameterList();

    this.process(")");

    this.compileSubroutineBody();

    this.processedTokens.push("</subroutineDec>");
  }

  compileParameterList() {
    this.processedTokens.push("<parameterList>");
    if (this.currentTokenValue() !== ")") {
      // type
      this.process();
      // name
      this.process();
    }
    while (this.currentTokenValue() === ",") {
      this.process(",");
      // type
      this.process();
      // name
      this.process();
    }

    this.processedTokens.push("</parameterList>");
  }

  compileVarDec() {
    while (this.currentTokenValue() === "var") {
      this.processedTokens.push("<varDec>");
      this.process("var");
      // type
      this.process();
      // varName
      this.process();
      while (this.currentTokenValue() === ",") {
        this.process(",");
        //varnName
        this.process();
      }
      this.process(";");
      this.processedTokens.push("</varDec>");
    }
  }

  compileSubroutineBody() {
    this.processedTokens.push("<subroutineBody>");
    this.process("{");
    this.compileVarDec();
    this.handleStatements();
    this.process("}");
    this.processedTokens.push("</subroutineBody>");
  }

  compileLetStatement() {
    this.processedTokens.push("<letStatement>");
    this.process("let");
    //varname
    this.process();
    // [expression]
    if (this.currentTokenValue() === "[") {
      this.process("[");
      this.compileExpression();
      this.process("]");
    }
    this.process("=");
    this.compileExpression();
    this.process(";");
    this.processedTokens.push("</letStatement>");
  }

  compileIfStatement() {
    this.processedTokens.push("<ifStatement>");
    this.process("if");
    this.process("(");
    this.compileExpression();
    this.process(")");
    this.process("{");
    this.handleStatements();
    this.process("}");
    if (this.currentTokenValue() === "else") {
      this.process("else");
      this.process("{");
      this.handleStatements();
      this.process("}");
    }
    this.processedTokens.push("</ifStatement>");
  }

  compileWhileStatement() {
    this.processedTokens.push("<whileStatement>");
    this.process("while");
    this.process("(");
    this.compileExpression();
    this.process(")");
    this.process("{");
    this.handleStatements();
    this.process("}");
    this.processedTokens.push("</whileStatement>");
  }

  compileDoStatement() {
    this.processedTokens.push("<doStatement>");
    this.process("do");
    this.compileSubroutineCall();
    this.process(";");
    this.processedTokens.push("</doStatement>");
  }

  compileSubroutineCall() {
    //subroutine name | (className|varName)
    this.process();
    if (this.currentTokenValue() === "(") {
      this.process("(");
      this.compileExpressionList();
      this.process(")");
    }
    if (this.currentTokenValue() === ".") {
      this.process(".");
      // subroutine name;
      this.process();
      this.process("(");
      this.compileExpressionList();
      this.process(")");
    }
  }

  compileReturnStatement() {
    this.processedTokens.push("<returnStatement>");
    this.process("return");
    if (this.currentTokenValue() !== ";") {
      this.compileExpression();
    }
    this.process(";");
    this.processedTokens.push("</returnStatement>");
  }

  // possiblely empty
  compileExpressionList() {
    this.processedTokens.push("<expressionList>");
    while (this.currentTokenValue() !== ")") {
      this.compileExpression();
      if (this.currentTokenValue() === ",") {
        this.process(",");
      }
    }
    this.processedTokens.push("</expressionList>");
  }

  compileExpression() {
    this.processedTokens.push("<expression>");
    this.compileTerm();
    while (
      ["+", "-", "*", "/", "&amp;", "|", "&lt;", "&gt;", "="].includes(
        this.currentTokenValue()
      )
    ) {
      // op
      this.process();
      this.compileTerm();
    }
    this.processedTokens.push("</expression>");
  }

  compileTerm() {
    this.processedTokens.push("<term>");
    switch (this.currentTokenValue()) {
      // (expression)
      case "(": {
        this.process("(");
        this.compileExpression();
        this.process(")");
        break;
      }
      // (unaryOp term)
      case "-":
      case "~": {
        this.process();
        this.compileTerm();
        break;
      }
      // init/string/keyword/varName/varName[expression]
      default: {
        this.process();
        if (this.currentTokenValue() === "[") {
          this.process("[");
          this.compileExpression();
          this.process("]");
        }
        if (this.currentTokenValue() === "(") {
          this.process("(");
          this.compileExpressionList();
          this.process(")");
        }
        if (this.currentTokenValue() === ".") {
          this.process(".");
          // subroutine name
          this.process();
          this.process("(");
          this.compileExpressionList();
          this.process(")");
        }
        break;
      }
    }
    this.processedTokens.push("</term>");
  }
}
