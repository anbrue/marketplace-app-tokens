/**********************************************************/
export function decodeString(input: string) {
  return (
    input
      ?.replaceAll("%7b", "{")
      ?.replaceAll("%7B", "{")
      ?.replaceAll("%7d", "}")
      ?.replaceAll("%7D", "}")
      ?.replaceAll("%7c", "|")
      ?.replaceAll("%7C", "|") ?? ""
  );
}
/**********************************************************/
// Converts {EC7F0EA0-0620-44F8-AC88-D6134FF3D0E0} to  ec7f0ea0062044f8ac88d6134ff3d0e0
export function toSmallId(id: string): string {
  if (!id || id === "") {
    return id;
  }
  if (id && id.includes("{")) {
    id = id.slice(1, id.length - 1);
  }
  // Remove the dashes and convert to lowercase
  return id ? id.replace(/-/g, "").toLowerCase() : "";
}
/**********************************************************/
// Converts ec7f0ea0-0620-44f8-ac88-d6134ff3d0e0 to  ec7f0ea0062044f8ac88d6134ff3d0e0
export function removeDashes(id: string): string {
  // Remove the dashes and convert to lowercase
  return id ? id.replace(/-/g, "") : "";
}
/**********************************************************/
export function processIdForQuery(input: string): string {
  const decodedString = decodeString(input);
  const smallId = toSmallId(decodedString);
  return smallId;
}
/**********************************************************/
export function formatDate(input: string): Date | undefined {
  if (!input) {
    return undefined;
  }

  const formattedDate = input?.replace(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
    "$1-$2-$3T$4:$5:$6Z"
  );
  return new Date(formattedDate);
}
