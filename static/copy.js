class CopyButton {
  static #CONFIRMATION_DURATION_MS = 1500;
  static #IDLE_LABEL = "Copy";
  static #TURN_DURATION_MS = 180;
  static #TURN_OVER = [
    { transform: "rotateX(90deg)", opacity: 0 },
    { transform: "none", opacity: 1 },
  ];

  #codeBlock;
  #element;
  #resetTimer;

  constructor(codeBlock) {
    this.#codeBlock = codeBlock;
    this.#element = this.#createElement();
  }

  attach() {
    this.#keepWordsWhole();
    const frame = document.createElement("div");
    frame.className = "copyable";
    this.#codeBlock.replaceWith(frame);
    frame.append(this.#codeBlock, this.#element);
  }

  #keepWordsWhole() {
    const code = this.#codeBlock.firstElementChild;
    const pieces = code.textContent.split(/(\s+)/);
    code.replaceChildren(
      ...pieces.map((piece) => (piece.trim() ? this.#wholeWord(piece) : piece)),
    );
  }

  #wholeWord(text) {
    const word = document.createElement("span");
    word.className = "word";
    word.textContent = text;
    return word;
  }

  #createElement() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button copy-button";
    button.textContent = CopyButton.#IDLE_LABEL;
    button.setAttribute("aria-live", "polite");
    button.addEventListener("click", () => this.#copy());
    return button;
  }

  async #copy() {
    try {
      await navigator.clipboard.writeText(this.#codeBlock.textContent.trim());
      this.#confirm("Copied");
    } catch {
      this.#confirm("Copy failed");
    }
  }

  #confirm(label) {
    this.#showLabel(label);
    clearTimeout(this.#resetTimer);
    this.#resetTimer = setTimeout(
      () => this.#showLabel(CopyButton.#IDLE_LABEL),
      CopyButton.#CONFIRMATION_DURATION_MS,
    );
  }

  #showLabel(label) {
    this.#element.textContent = label;
    if (CopyButton.#motionAllowed()) this.#turnOver();
  }

  #turnOver() {
    this.#element.animate(CopyButton.#TURN_OVER, {
      duration: CopyButton.#TURN_DURATION_MS,
      easing: getComputedStyle(this.#element).getPropertyValue("--sleight").trim(),
    });
  }

  static #motionAllowed() {
    return matchMedia("(prefers-reduced-motion: no-preference)").matches;
  }
}

class CodeBlocks {
  static addCopyButtons() {
    if (!navigator.clipboard) return;
    [...document.querySelectorAll(".prose pre")]
      .filter(CodeBlocks.#isSingleCommand)
      .forEach((codeBlock) => new CopyButton(codeBlock).attach());
  }

  static #isSingleCommand(codeBlock) {
    return !codeBlock.textContent.trim().includes("\n");
  }
}

CodeBlocks.addCopyButtons();
