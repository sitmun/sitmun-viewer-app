function creaModal(src) {
    // Get the modal
    var modal = document.getElementById('silmeModal');

    // Get the image and insert it inside the modal - use its "alt" text as a caption
    var modalImg = document.getElementById("modalImage");

    modal.style.display = "block";
    modalImg.src = src;
    $('section').css('position', 'unset');

    $('.tc-ctl-nav-btn').css('display', 'none');
    $('.tc-ctl-sv-btn').css('display', 'none');
    $('.tc-ctl-be-btn').css('display', 'none');
    $('.tc-ctl-fscreen-btn').css('display', 'none');
    $('.tc-ctl-scl').css('display', 'none');
    $('.tc-ctl-attrib').css('display', 'none');
    $('.slide-panel').css('display', 'none');
    $('.tc-ctl-popup.tc-visible').css('display', 'none');





    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("modalClose")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
        $('section').css('position', '');

        $('.tc-ctl-nav-btn').css('display', 'block');
        $('.tc-ctl-sv-btn').css('display', 'block');
        $('.tc-ctl-be-btn').css('display', 'block');
        $('.tc-ctl-fscreen-btn').css('display', 'block');
        $('.tc-ctl-scl').css('display', 'block');
        $('.tc-ctl-attrib').css('display', 'block');
        $('.slide-panel').css('display', 'block');
        $('.tc-ctl-popup.tc-visible').css('display', 'block');
    }
}




function dragElement(elmnt) {
    // test 2 (habilitar         //dragElement(info); dins LayerCatalog.js
    var isDown = false;

    elmnt.addEventListener('mousedown', function (e) {
        if (e.srcElement.classList[0] == "tc-ctl-lcat-title") {
            isDown = true;
            offset = [
                elmnt.offsetLeft - e.clientX,
                elmnt.offsetTop - e.clientY
            ];
        }
    });

    document.addEventListener('mouseup', function () {
        isDown = false;
    }, true);

    document.addEventListener('mousemove', function (event) {
        if (isDown) {
            event.preventDefault();
            mousePosition = {

                x: event.clientX,
                y: event.clientY

            };
            elmnt.style.left = (mousePosition.x + offset[0]) + 'px';
            elmnt.style.top = (mousePosition.y + offset[1]) + 'px';
        }
    }, true);
}