/** Built-in sheet with an optional browser-stored custom template.
 * Loading template bytes does not require the PDF editing libraries. */
let bundledTemplate: Promise<Uint8Array> | null = null;

export async function loadBundledTemplate(): Promise<Uint8Array> {
  if (!bundledTemplate) {
    const baseURL =
      (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env
        ?.BASE_URL || "/";
    bundledTemplate = fetch(
      `${baseURL}templates/5E_CharacterSheet_Fillable.pdf`,
    )
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            "The built-in PDF template could not be loaded. Reload the app or choose an optional custom template.",
          );
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (String.fromCharCode(...bytes.subarray(0, 5)) !== "%PDF-")
          throw new Error(
            "The built-in PDF template could not be loaded. Reload the app or choose an optional custom template.",
          );
        return bytes;
      })
      .catch((error) => {
        bundledTemplate = null;
        throw error;
      });
  }
  return bundledTemplate;
}

export async function storeSheetTemplate(bytes: Uint8Array) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("dnd-character-sheet-templates", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("templates");
    request.onerror = () =>
      reject(
        request.error || new Error("Could not open local template storage."),
      );
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("templates", "readwrite");
      tx.objectStore("templates").put(bytes, "official-fillable");
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error || new Error("Could not save the PDF template."));
      };
    };
  });
}

async function readStoredTemplate() {
  return new Promise<Uint8Array | null>((resolve, reject) => {
    const request = indexedDB.open("dnd-character-sheet-templates", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("templates");
    request.onerror = () =>
      reject(
        request.error || new Error("Could not open local template storage."),
      );
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("templates", "readonly");
      const get = tx.objectStore("templates").get("official-fillable");
      get.onsuccess = () => {
        db.close();
        resolve(get.result ? new Uint8Array(get.result as ArrayBuffer) : null);
      };
      get.onerror = () => {
        db.close();
        reject(get.error || new Error("Could not read the PDF template."));
      };
    };
  });
}

export async function getSheetTemplate(): Promise<Uint8Array> {
  // Browser storage may be unavailable. The included standard form must still
  // work without a saved upload, an account, or an IndexedDB permission.
  const custom = await readStoredTemplate().catch(() => null);
  return custom || loadBundledTemplate();
}
