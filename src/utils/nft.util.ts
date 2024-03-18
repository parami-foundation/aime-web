export const parseBase64Json = (base64Json: string): any => {
  // Step 1: Extract the base64 part of the string
  const base64Encoded = base64Json.split(",")[1];

  // Step 2: Decode the base64-encoded JSON string
  const jsonString = atob(base64Encoded);

  // Step 3: Parse the JSON string into an object
  try {
    const jsonObj = JSON.parse(jsonString);
    return jsonObj;
  } catch (e) {
    console.error("Parsing error:", e);
    return null;
  }
}