export const GetTokenFoldersByTemplateQuery = `query TokenFolders($siteRootPath:String!, $language:String!, $template:String!){
  search(
    query: {
      searchStatement: {
        criteria: [
          {
            operator: MUST
            field: "_path"
            criteriaType: CONTAINS
            value: $siteRootPath
          },
          {
            operator: MUST
            field: "_language"
            value: $language
          },
          {
            operator: MUST
            field: "_templateName"
            value: $template
          }
        ]
      }
      paging: { pageSize: 50, pageIndex: 0, skip: 0 }
    }
  ) {
    results {
      itemId
      path
      name
    }
  }
}`;
