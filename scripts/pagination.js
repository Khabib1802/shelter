import { loadPets } from "./api.js";
import { buildExtendedArray } from "./utils.js";

/**
 * @typedef {Object} State
 * @property {number} currentPage
 * @property {number} cardsPerPage
 * @property {number} totalPages
 * @property {boolean} isAnimating
 * @property {import("./api.js").Pet[]} fullList
 */

const EXTENDED_PETS = 48;

const BREAKPOINTS = {
  desktop: "(min-width: 851px)",
  tablet: "(min-width: 601px) and (max-width: 850px)",
};

/**
 * @returns {number}
 */
const getCardsPerPage = () => {
  if (window.matchMedia(BREAKPOINTS.desktop).matches) return 8;
  if (window.matchMedia(BREAKPOINTS.tablet).matches) return 6;
  return 3;
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
const renderRow = (rowElement, pets) => {
  rowElement.replaceChildren();

  pets.forEach((pet) => {
    const card = createCardElement(pet);
    rowElement.append(card);
  });
};

/**
 * @param {Object} elements
 * @param {HTMLButtonElement} elements.first
 * @param {HTMLButtonElement} elements.prev
 * @param {HTMLButtonElement} elements.current
 * @param {HTMLButtonElement} elements.next
 * @param {HTMLButtonElement} elements.last
 * @param {State} state
 */
const renderNav = (elements, state) => {
  const { first, prev, current, next, last } = elements;
  const isFirstPage = state.currentPage === 1;
  const isLastPage = state.currentPage === state.totalPages;

  current.textContent = String(state.currentPage);

  [first, prev].forEach((button) => {
    button.classList.toggle("disabled-btn", isFirstPage);
  });

  [next, last].forEach((button) => {
    button.classList.toggle("disabled-btn", isLastPage);
  });
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

const initPagination = async () => {
  const container = document.querySelector(
    ".friends-full__slider .slider__cards",
  );
  const row = document.querySelector(".slider__row");
  const nav = document.querySelector(".friends-full__nav");

  if (!container || !row || !nav) return;

  const [buttonFirst, buttonPrev, buttonCurrent, buttonNext, buttonLast] =
    nav.querySelectorAll(".slider__btn");
  if (
    !buttonFirst ||
    !buttonPrev ||
    !buttonCurrent ||
    !buttonNext ||
    !buttonLast
  )
    return;

  const pets = await loadPets();
  if (pets.length === 0) return;

  const wrapper = createSliderWrapper(container, row);

  const state = {
    currentPage: 1,
    cardsPerPage: getCardsPerPage(),
    totalPages: 0,
    fullList: buildExtendedArray(pets, EXTENDED_PETS),
    isAnimating: false,
  };

  const navElements = {
    first: buttonFirst,
    prev: buttonPrev,
    current: buttonCurrent,
    next: buttonNext,
    last: buttonLast,
  };

  const getTotalPages = () =>
    Math.ceil(state.fullList.length / state.cardsPerPage);
  state.totalPages = getTotalPages();

  /**
   * @param {number} page
   * @returns {import("./api.js").Pet[]}
   */
  const getPageItems = (page) => {
    const start = (page - 1) * state.cardsPerPage;
    return state.fullList.slice(start, start + state.cardsPerPage);
  };

  renderRow(row, getPageItems(state.currentPage));
  renderNav(navElements, state);

  const onAnimationEnd = () => {
    state.isAnimating = false;
  };

  /**
   * @param {number} targetPage
   */
  const goToPage = (targetPage) => {
    if (state.isAnimating) return;

    const nextPage = Math.min(Math.max(targetPage, 1), state.totalPages);
    if (nextPage === state.currentPage) return;

    const direction = nextPage > state.currentPage ? "next" : "prev";
    state.isAnimating = true;

    const newRow = document.createElement("div");
    newRow.className = "slider__row slider__row--grid";
    renderRow(newRow, getPageItems(nextPage));

    const animate = direction === "next" ? animateSlideNext : animateSlidePrev;

    animate(wrapper, row, newRow, () => {
      state.currentPage = nextPage;
      renderNav(navElements, state);
      onAnimationEnd();
    });
  };

  buttonFirst.addEventListener("click", () => goToPage(1));
  buttonPrev.addEventListener("click", () => goToPage(state.currentPage - 1));
  buttonNext.addEventListener("click", () => goToPage(state.currentPage + 1));
  buttonLast.addEventListener("click", () => goToPage(state.totalPages));

  const resizeObserver = new ResizeObserver(() => {
    const newCardsPerPage = getCardsPerPage();
    if (newCardsPerPage === state.cardsPerPage) return;

    state.cardsPerPage = newCardsPerPage;
    state.currentPage = 1;
    state.totalPages = getTotalPages();

    renderRow(row, getPageItems(state.currentPage));
    renderNav(navElements, state);
  });

  resizeObserver.observe(container);
};

export default initPagination;
