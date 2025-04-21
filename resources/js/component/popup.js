// const popup = document.getElementById('popupCreate');

// if (popup.scrollHeight > popup.clientHeight) {
//     // console.log("Popup has a vertical scrollbar");
//     popup.style.borderTopRightRadius = '0px';
//     popup.style.borderBottomRightRadius = '0px';
// }

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