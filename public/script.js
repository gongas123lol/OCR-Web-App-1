function containsLetter(str) {
    return /[a-zA-Z]/.test(str);
}
/**
 * Using jquery, we begin DOM manipulation, listening for events and handlebars template rendering.
 */
$(document).ready(async function () {

    /*
    window.onload = function() {

        window.location.href = '/';
    };

     */


    $(document).on('click', '#helloworld',async function () {
        console.log("nigga")
        await fetch('/hello/world', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"username": "username", "password": "password"})
        });

    });
    $('#formFileSm').change(function(event) {
        // Get the file input element
        var input = event.target;

        // Ensure a file was selected
        if (input.files && input.files[0]) {
            var reader = new FileReader(); // Create a new FileReader object

            // Define the onload event for the FileReader
            reader.onload = function(e) {
                // Set the preview image src attribute to the FileReader result
                $('#preview').attr('src', e.target.result).show(); // Show the preview image
            }

            // Read the selected file as a DataURL
            reader.readAsDataURL(input.files[0]);
        } else {
            // Hide the preview image if no file is selected
            $('#preview').hide();
        }
    });
    $('#uploadButton').click(function() {
        $('#uploadForm').submit();
        textout.innerText = "reading..."
    });
    // Form submission event
    $('#uploadForm').submit(function (event) {
        event.preventDefault();

        // FormData object to send the file data
        const formData = new FormData();
        const fileInput = $('#formFileSm')[0];
        const file = fileInput.files[0];
        formData.append('image', file);

        // AJAX request to the server
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                //console.log(response)
                if(containsLetter(response.message)){
                    textout.innerText = response.message;
                }else{
                    textout.innerText = "couldnt recognize any text in the image."
                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                alert('Failed to upload image: ' + errorThrown);
            }
        });
    });
});


