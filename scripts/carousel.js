import { loadPets } from "./api.js";
import { shuffleArray } from "./utils.js";

const BREAKPOINTS = {
  desktop: "(min-width: 851px)",
  tablet: "(min-width: 601px) and (max-width: 850px)",
};

/**
 * @returns {number}
 */
const getRowSize = () => {
  if (window.matchMedia(BREAKPOINTS.desktop).matches) return 3;
  if (window.matchMedia(BREAKPOINTS.tablet).matches) return 2;
  return 1;
};

/**
 * @param {import("./api.js").Pet[]} allPets
 * @param {import("./api.js").Pet[]} currentPets
 * @param {number} size
 * @returns {import("./api.js").Pet[]}
 */
const generateNextRow = (allPets, currentPets, size) => {
  const filteredPets = allPets.filter((pet) => !currentPets.includes(pet));
  const shuffledPets = shuffleArray(filteredPets);
  const slicedPets = shuffledPets.slice(0, size);
  return slicedPets;
};

/**
 * @param {import("./api.js").Pet} pet
 * @returns {HTMLAnchorElement}
 */
const createCardElement = (pet) => {
  const card = document.createElement("a");
  const imgWrapper = document.createElement("div");
  const img = document.createElement("img");
  const name = document.createElement("div");
  const link = document.createElement("div");

  card.href = "#";
  card.className = "slider__card";
  card.dataset.name = pet.name;

  imgWrapper.className = "slider__img";
  img.src = pet.img;
  img.alt = pet.type;

  name.className = "slider__name";
  name.textContent = pet.name;

  link.className = "slider__link link";
  link.textContent = "Learn more";

  imgWrapper.append(img);
  card.append(imgWrapper, name, link);

  return card;
};

/**
 * @param {HTMLDivElement} rowElement
 * @param {import("./api.js").Pet[]} pets
 */
const renderInitialRow = (rowElement, pets) => {
  rowElement.replaceChildren();

  pets.forEach((pet) => {
    const cardElement = createCardElement(pet);
    rowElement.append(cardElement);
  });
};

/**
 * @param {HTMLDivElement} container
 * @param {HTMLDivElement} row
 * @returns {HTMLDivElement}
 */
const createSliderWrapper = (container, row) => {
  let wrapper = container.querySelector(".slider__wrapper");

  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.className = "slider__wrapper";

    container.append(wrapper);
    wrapper.append(row);
  }

  return wrapper;
};

/**
 * @param {HTMLDivElement} wrapper
 * @param {HTMLDivElement} row
 * @param {HTMLDivElement} newRow
 * @param {Function} onAnimationEnd
 */
const animateSlideNext = (wrapper, row, newRow, onAnimationEnd) => {
  wrapper.append(newRow);
  wrapper.classList.add("slider__wrapper--slide-next");

  const handleTransitionEnd = () => {
    wrapper.classList.add("slider__wrapper--no-transition");
    wrapper.classList.remove("slider__wrapper--slide-next");
    wrapper.offsetHeight;
    wrapper.classList.remove("slider__wrapper--no-transition");

    row.replaceChildren(...newRow.children);
    newRow.remove();

    wrapper.removeEventListener("transitionend", handleTransitionEnd);
    onAnimationEnd();
  };

  wrapper.addEventListener("transitionend", handleTransitionEnd);
};

/**
 * @param {HTMLDivElement} wrapper
 * @param {HTMLDivElement} row
 * @param {HTMLDivElement} newRow
 * @param {Function} onAnimationEnd
 */
const animateSlidePrev = (wrapper, row, newRow, onAnimationEnd) => {
  wrapper.prepend(newRow);

  wrapper.classList.add("slider__wrapper--no-transition");
  wrapper.classList.add("slider__wrapper--slide-prev");

  wrapper.offsetHeight;

  wrapper.classList.remove("slider__wrapper--no-transition");
  wrapper.classList.remove("slider__wrapper--slide-prev");

  const handleTransitionEnd = () => {
    row.replaceChildren(...newRow.children);
    newRow.remove();

    wrapper.removeEventListener("transitionend", handleTransitionEnd);
    onAnimationEnd();
  };

  wrapper.addEventListener("transitionend", handleTransitionEnd);
};

/**
 * @param {HTMLDivElement} row
 * @param {import("./api.js").Pet[]} pets
 * @param {Object} state
 */
const resizeSlider = (row, pets, state) => {
  const newSize = getRowSize();

  if (newSize === state.size) return;

  state.size = newSize;

  state.currentPets = shuffleArray(pets).slice(0, state.size);

  renderInitialRow(row, state.currentPets);
};

export const initCarousel = async () => {
  const container = document.querySelector(".slider__cards");
  const row = document.querySelector(".slider__row");
  const buttonNext = document.querySelector(".slider__btn.next");
  const buttonPrev = document.querySelector(".slider__btn.prev");

  if (!container || !row || !buttonNext || !buttonPrev) return;

  const pets = await loadPets();
  if (pets.length === 0) return;

  const wrapper = createSliderWrapper(container, row);

  const state = {
    size: getRowSize(),
    currentPets: shuffleArray(pets).slice(0, getRowSize()),
    isAnimating: false,
  };

  renderInitialRow(row, state.currentPets);

  const onAnimationEnd = () => {
    state.isAnimating = false;
  };

  /**
   * @param {'next' | 'prev'} direction
   */
  const handleSliderMove = (direction) => {
    if (state.isAnimating) return;
    state.isAnimating = true;

    const nextPets = generateNextRow(pets, state.currentPets, state.size);

    const newRow = document.createElement("div");
    newRow.className = "slider__row";
    renderInitialRow(newRow, nextPets);

    const animate = direction === "next" ? animateSlideNext : animateSlidePrev;

    animate(wrapper, row, newRow, () => {
      state.currentPets = nextPets;
      onAnimationEnd();
    });
  };

  const resizeObserver = new ResizeObserver(() => {
    resizeSlider(row, pets, state);
  });
  resizeObserver.observe(container);

  buttonNext.addEventListener("click", () => handleSliderMove("next"));
  buttonPrev.addEventListener("click", () => handleSliderMove("prev"));
};

export default initCarousel;
