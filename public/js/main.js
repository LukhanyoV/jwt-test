const $ = document;

$.addEventListener("DOMContentLoaded", () => {
    const flashMsg = $.querySelector(".flash-msg");
    flashMsg && setTimeout(() => {
        flashMsg.remove()
    }, 5000);
});