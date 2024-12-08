let scrollTimer;

window.addEventListener("scroll", function () {
    // 스크롤이 시작되면 header와 footer를 5초 동안 숨기기
    clearTimeout(scrollTimer); // 이전 타이머 취소
    document.querySelector("header").style.top = "-200px"; // header 숨김
    document.querySelector("footer").style.bottom = "-200px"; // footer 숨김

    // 5초 후에 다시 표시
    scrollTimer = setTimeout(function () {
        document.querySelector("header").style.top = "0"; // header 다시 표시
        document.querySelector("footer").style.bottom = "0"; // footer 다시 표시
    }, 5000); // 10초 후
});