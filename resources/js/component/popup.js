function toggleScrollbar(popup) {
    if (popup.scrollHeight > popup.clientHeight) {
        popup.style.borderTopRightRadius = '0px';
        popup.style.borderBottomRightRadius = '0px';
    }
    else {
        popup.style.borderTopRightRadius = '32px';
        popup.style.borderBottomRightRadius = '32px';
    }
}

// Function to toggle body scroll
function toggleBodyScroll(disable) {
    document.body.classList.toggle('popup-open', disable);
}



export default toggleScrollbar;