export const GetTokensQuery = `query Tokens($itemId:String!, $language:String!, $template:String!){
  search(
    query: {
      searchStatement: {
        criteria: [
          {
            operator: MUST
            field:"_path"
            criteriaType: CONTAINS
            value: $itemId
          },
          {
            operator:MUST
            field:"_language"
            value:$language
          }, 
          {
            operator:MUST
         		field: "_templateName"
            value:$template
          }
        ]
      }
      paging: {pageSize: 1000, pageIndex: 0, skip: 0}
    }
  )
  {
    totalCount
    results{
      name
      path
      itemId
      innerItem {
        key:field(name: "Key"){value}
        phrase: field(name: "Phrase") {value}
      }
    }
  }
}`;