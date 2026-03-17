/**********************************************************/
export interface Item {
  id: string;
  updated: Date;
  name: string;
  displayName: string;
  fields: (Field & ResolvedField)[];
  sharedrenderings: string;
  finalRenderings: string;
  version: number;
  workflow: Workflow;
  path: string;
  langauge: string;
  template: Template;
  dependencies: Dependencies;
}
/**********************************************************/
export interface Template {
  name: string;
  id: string;
}
/**********************************************************/
export interface Field {
  name: string;
  value: string;
  templateField: TemplateField;
}
/**********************************************************/
export interface TemplateField {
  name: string;
  type: string;
  typekey: string;
  templateFieldId: string;
  templateSectionId: string;
}
/**********************************************************/
export interface Workflow {
  workflowState: WorkflowState;
  workflow: WorkflowDetails;
}
/**********************************************************/
export interface WorkflowDetails {
  workflowId: string;
  displayName: string;
}
/**********************************************************/
export interface WorkflowState {
  final: boolean;
  id: string;
  displayName: string;
}
/**********************************************************/
export interface Action {
  id: string;
  name: string;
  nextState: string;
  icon: string;
}
/**********************************************************/
export interface State {
  id: string;
  name: string;
  isFinal: boolean;
  description: string;
  actions: Action[];
  icon: string;
}
/**********************************************************/
export interface WorkflowItem {
  id: string;
  name: string;
  InitialState: string;
  CreatedBy: string;
  LastUpdate: string;
  states: State[];
}
/**********************************************************/
export interface ItemWorkflowHistory {
  oldState: WorkflowItemHistoryState;
  newState: WorkflowItemHistoryState;
  user: string;
  date: Date;
  comments: string[];
}
/**********************************************************/
export interface WorkflowItemHistoryState {
  displayName: string;
  stateId: string;
  icon: string;
  final: boolean;
}
/**********************************************************/
export interface ResolvedField {
  resolvedItems: (Item | string)[];
}
/**********************************************************/
export interface Dependencies {
  healthy: boolean;
  hasDependencies: boolean;
  allDependencies: Dependency[];
}
/**********************************************************/
export interface Dependency {
  healthy: boolean | undefined;
  id: string;
  name: string;
  type: ReferenceType;
  fieldType: string;
  targetItem?: Item | undefined;
  targetUrl?: string | undefined;
  linkType: "internal" | "external";
}
/**********************************************************/
export enum ReferenceType {
  Shared = "sharedLayout",
  Final = "finalLayout",
  Field = "field",
}
/**********************************************************/
export enum HealthStatus {
  Healthy = "Healthy",
  Warning = "Warning",
  Error = "Error",
}
/**********************************************************/
