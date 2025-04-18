const popup = document.getElementById('popup');

if (popup.scrollHeight > popup.clientHeight) {
    // console.log("Popup has a vertical scrollbar");
    popup.style.borderTopRightRadius = '0px';
    popup.style.borderBottomRightRadius = '0px';
}