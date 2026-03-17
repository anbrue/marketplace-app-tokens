export const ResolveContentTokenTemplateQuery = `query ResolveContentTokenTemplate($templateName:String!){
  search(
    query: {
      searchStatement: {
        criteria: [
          {
            operator: MUST
            field: "_name"
            criteriaType: CONTAINS
            value: $templateName
          },
          {
            operator: MUST
            field: "_templateName"
            value: "Template"
          }
        ]
      }
      paging: { pageSize: 10, pageIndex: 0, skip: 0 }
    }
  ) {
    results {
      itemId
      name
      path
    }
  }
}`;

export const CreateTokenMutation = `mutation CreateToken($parent:ID!, $name:String!, $template:ID!, $language:String!, $key:String!, $value:String!, $valueFieldName:String!){
  createItem(
    parent: $parent
    name: $name
    template: $template
    language: $language
    fields: [
      { name: "Key", value: $key }
      { name: $valueFieldName, value: $value }
    ]
  ) {
    item {
      itemId
      name
      path
    }
  }
}`;

export const CreateTokenMutationInput = `mutation CreateTokenInput($parent:ID!, $name:String!, $template:ID!, $language:String!, $key:String!, $value:String!, $valueFieldName:String!){
  createItem(
    input: {
      parent: $parent
      name: $name
      templateId: $template
      language: $language
      fields: [
        { name: "Key", value: $key }
        { name: $valueFieldName, value: $value }
      ]
    }
  ) {
    item {
      itemId
      name
      path
    }
  }
}`;

export const CreateTokenMutationInputParentObject = `mutation CreateTokenInputParentObject($parent:ID!, $name:String!, $template:ID!, $language:String!, $key:String!, $value:String!, $valueFieldName:String!){
  createItem(
    input: {
      parent: { itemId: $parent }
      name: $name
      templateId: $template
      language: $language
      fields: [
        { name: "Key", value: $key }
        { name: $valueFieldName, value: $value }
      ]
    }
  ) {
    item {
      itemId
      name
      path
    }
  }
}`;

export const CreateTokenMutationInputTemplateObject = `mutation CreateTokenInputTemplateObject($parent:ID!, $name:String!, $template:ID!, $language:String!, $key:String!, $value:String!, $valueFieldName:String!){
  createItem(
    input: {
      parent: $parent
      name: $name
      templateId: { itemId: $template }
      language: $language
      fields: [
        { name: "Key", value: $key }
        { name: $valueFieldName, value: $value }
      ]
    }
  ) {
    item {
      itemId
      name
      path
    }
  }
}`;

export const CreateTokenMutationInputParentAndTemplateObjects = `mutation CreateTokenInputParentAndTemplateObjects($parent:ID!, $name:String!, $template:ID!, $language:String!, $key:String!, $value:String!, $valueFieldName:String!){
  createItem(
    input: {
      parent: { itemId: $parent }
      name: $name
      templateId: { itemId: $template }
      language: $language
      fields: [
        { name: "Key", value: $key }
        { name: $valueFieldName, value: $value }
      ]
    }
  ) {
    item {
      itemId
      name
      path
    }
  }
}`;
