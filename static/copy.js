class CopyButton {
  static #CONFIRMATION_DURATION_MS = 1500;
  static #IDLE_LABEL = "Copy";

  #codeBlock;
  #element;
  #resetTimer;

  constructor(codeBlock) {
    this.#codeBlock = codeBlock;
    this.#element = this.#createElement();
  }

  attach() {
    const frame = document.createElement("div");
    frame.className = "copyable";
    this.#codeBlock.replaceWith(frame);
    frame.append(this.#codeBlock, this.#element);
  }

  #createElement() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-button";
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
    this.#element.textContent = label;
    clearTimeout(this.#resetTimer);
    this.#resetTimer = setTimeout(
      () => { this.#element.textContent = CopyButton.#IDLE_LABEL; },
      CopyButton.#CONFIRMATION_DURATION_MS,
    );
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
