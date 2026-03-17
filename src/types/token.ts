/**********************************************************/
export interface Token {
  id: string;
  key: string;
  value: string;
  templateId?: string;
  valueFieldName?: string;
  description? : string;
}

/**********************************************************/
export interface TokenCategory {
  siteId: string;
  contentTokensFolderId: string;
  canCreateToken: boolean;
  title: string;
  tokens: Token[];
  color: string;
  description: string;
}
/**********************************************************/