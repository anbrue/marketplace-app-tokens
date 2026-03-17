// Private
/**********************************************************/
const GETITEM = `
    itemId
    name
    displayName
    path
    language{
        iso 
        name
    }
    updated: field(name: "__Updated"){
        value
    }
    version
    template{name templateId}
    workflow {
        workflow {
            workflowId
            displayName
        }
        workflowState {
            displayName
            stateId
            icon
            final
        }
    }
    customFields: fields(excludeStandardFields: true) {
        nodes {
        name
        value
        templateField {
            name
            type
            typeKey
            templateFieldId
            section {
                name
                itemTemplateSectionId
                }
            }
        }
    }
    finalRenderings: field(name: "__Final Renderings") {
        value
    }
    renderings: field(name: "__Renderings") {
        value
    }`;

// Public
/**********************************************************/
export const GET_ITEM_WORKFLOW_HISTORY_QUERY = `
query GetItemWorkflowHistory($datasource: ID, $language: String) {
  item(
    where: { database: "master", itemId: $datasource, language: $language }
  ) {
    workflow {
      workflow {
        history(item: {language: $language, itemId:$datasource}) {
          nodes {
            oldState {
              displayName
            }
            newState {
              displayName
            }
            user
            date
            comments
          }
        }
      }
    }
  }
}`
/**********************************************************/
export const SEARCH_ITEMS_QUERY = `query Item($itemId: ID!, $language: String!, $excludeTemplate: String!, $excludeFolderTemplate: String!) {
    search(
        query: {
            searchStatement: {
                criteria: [
                {
                    operator: MUST
                    field: "_path"
                    value: $itemId
                },
                {
                    operator:MUST
                    field: "_language"
                    value: $language
                },
                { operator: NOT, criteriaType: CONTAINS,  field: "_templateName", value: $excludeTemplate }
                {
                    operator: NOT
                    criteriaType: CONTAINS
                    field: "_templateName"
                    value: $excludeFolderTemplate
                }
                ]
            }
            paging: { pageSize: 1000, pageIndex: 0, skip: 0 }
            }){
                totalCount
                results {
                    name
                    path
                    itemId
                    innerItem {
` + GETITEM + `
            }
        }
    }
}`;
/**********************************************************/
export const GETITEMBYID_QUERY =
  `query Item($itemId: ID!, $language: String!, $version: Int) {
        item(where: { database: "master", itemId: $itemId, language: $language, version: $version }) {` +
  GETITEM +
  `}
    }`;
/**********************************************************/
export const GETITEMBYPATH_QUERY =
  `query Item($path: String!, $language: String!, $version: Int) {
        item(where: { database: "master", path: $path, language: $language, version: $version }) {` +
  GETITEM +
  `}
    }`;
/**********************************************************/
export const EXECUTE_WORKFLOW_COMMAND_QUERY = `mutation ExecuteWorkflowCommand($id:String!, $itemId:String!, $language:String!, $comment:String!) {
    executeWorkflowCommand(
        input: {
        commandId: $id
        comments: $comment
        item: {
            database: "master"
            itemId: $itemId
            language: $language
        }
        }
    ) {
        completed
        successful
        error
        nextStateId
    }
}`;
/**********************************************************/
export const LOAD_WORKFLOWS_QUERY = `query {
    item(
        where: {
        database: "master"
        itemId: "{05592656-56D7-4D85-AACF-30919EE494F9}"
        }
    ) {
        name

        children {
        nodes {
            name
            createdBy: field(name: "__Created by") {
            value
            }
            updated: field(name: "__Updated") {
            value
            }
            displayName
            description: field(name: "Description") {
            value
            }
            itemId
            initialState: field(name: "Initial State") {
            value
            }
            children {
            nodes {
                name

                itemId
                icon

                isFinal: field(name: "Final") {
                value
                }
                children {
                nodes {
                    nextState: field(name: "Next state") {
                    value
                    }
                    name
                    icon
                    itemId
                }
                }
            }
            }
        }
        }
    }
}`;
