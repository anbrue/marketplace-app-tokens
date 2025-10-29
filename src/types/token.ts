/**********************************************************/
export interface Token {
  key: string;
  value: string;
  description? : string;
}

/**********************************************************/
export interface TokenCategory {
  title: string;
  tokens: Token[];
  color: string;
  description: string;
}
/**********************************************************/