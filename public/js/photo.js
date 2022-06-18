
function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#preview').attr('src', e.target.result);
            $("#preview").css({ 'display' : '' });
            console.log(e.target.result.data);
            return 
        }

        reader.readAsDataURL(input.files[0]);

    }
}
function photos() {
    var params = {
            // Request parameters
            "visualFeatures": "Categories",
            "details": "{string}",
            "language": "en",
        };
    var file = $("#uploadBtn").val();
    var image = readURL(file);
    var documents =  [
          {
            "language": "en",
            "id": "1",
            "text": image
          }
        ];
    $.ajax({
        url: "https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment?" + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","74f56f5e3fc6468f8064bb28fe902728");
        },
        type: "POST",
        // Request body
          data : JSON.stringify({documents : documents}),
          success: function(data, status)
            {
                document.getElementById('score').innerHTML = '<b>Score</b> '+(data.documents[0].score * 100).toFixed(1);
                console.log(data); // Contains the suite
            },
            error: function(data,error)
            {   document.getElementById('status').innerHTML = data.message;
            }
    });
}
