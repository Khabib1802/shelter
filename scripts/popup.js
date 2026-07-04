import { loadPets } from "./api.js";

/**
 * @param {import("./api").Pet[]} pets
 * @returns {Map<string, import("./api").Pet>}
 */
const getPetsMap = (pets) => {
  const map = new Map();

  pets.forEach((pet) => map.set(pet.name, pet));

  return map;
};

/**
 * @param {string[]} array
 * @returns {string}
 */
const formatList = (array) => (array.length === 0 ? "none" : array.join(", "));

/**
 * @param {HTMLDivElement} popup
 * @param {import("./api").Pet} pet
 */
const fillPopup = (popup, pet) => {
  const img = popup.querySelector(".pet-popup__img");
  const name = popup.querySelector(".pet-popup__name");
  const type = popup.querySelector(".pet-popup__type");
  const description = popup.querySelector(".pet-popup__description");
  const age = popup.querySelector(".pet-popup__age");
  const inoculations = popup.querySelector(".pet-popup__inoculations");
  const diseases = popup.querySelector(".pet-popup__diseases");
  const parasites = popup.querySelector(".pet-popup__parasites");

  img.src = pet.img;
  img.alt = pet.type;
  name.textContent = pet.name;
  type.textContent = `${pet.type} - ${pet.breed}`;
  description.textContent = pet.description;
  age.textContent = pet.age;
  inoculations.textContent = formatList(pet.inoculations);
  diseases.textContent = formatList(pet.diseases);
  parasites.textContent = formatList(pet.parasites);
};

const initPopup = async () => {
  const popup = document.querySelector(".pet-popup");
  const closePopupButton = document.querySelector(".pet-popup__close");
  const overlay = document.querySelector(".overlay");

  if (!popup || !overlay) return;

  const pets = await loadPets();
  if (pets.length === 0) return;

  const petsMap = getPetsMap(pets);

  const openPopup = (pet) => {
    fillPopup(popup, pet);
    document.body.classList.add("is-popup-open");
    popup.removeAttribute("inert");
  };

  const closePopup = () => {
    document.body.classList.remove("is-popup-open");
    popup.setAttribute("inert", "");
  };

  document.addEventListener("click", (event) => {
    const card = event.target.closest(".slider__card");
    if (!card) return;

    event.preventDefault();

    const pet = petsMap.get(card.dataset.name);

    if (pet) {
      openPopup(pet);
    }
  });

  popup.addEventListener("click", (event) => {
    if (event.target === popup) closePopup();
  });

  closePopupButton.addEventListener("click", closePopup);

  document.addEventListener("keydown", (event) => {
    if (
      event.code == "Escape" &&
      document.body.classList.contains("is-popup-open")
    )
      closePopup();
  });
};

export default initPopup;
