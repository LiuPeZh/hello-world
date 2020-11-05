enum TokenType {
  VARIABLE,
  NUMBER,
  OPERATOR,
  DELIMITER,
}
class Token {
  public type: TokenType
  public val: string | number
}