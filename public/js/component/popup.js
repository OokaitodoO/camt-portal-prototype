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


export default toggleScrollbar;