/**
 * @typedef {Object} Pet
 * @property {string} name
 * @property {string} img
 * @property {string} type
 * @property {string} breed
 * @property {string} description
 * @property {string} age
 * @property {string[]} inoculations
 * @property {string[]} diseases
 * @property {string[]} parasites
 */

/**
 * @returns {Promise<Pet[]>}
 */
export async function loadPets() {
  try {
    const res = await fetch("./pets.json");
    if (!res.ok) {
      throw new Error(`Loading error: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Unable to load pet data:", error);
    return [];
  }
}
