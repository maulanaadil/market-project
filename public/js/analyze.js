
function check() {
    var params = {
        // Request parameters
    };
    var text = $("#tweet").val();
    var documents =  [
          {
            "language": "en",
            "id": "1",
            "text": text
          }
        ];
    $.ajax({
        url: "https://southeastasia.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment?" + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","971894d1784f435ebf24a11004f9483c");
        },
        type: "POST",
        // Request body
          data : JSON.stringify({documents : documents}),
          success: function(data, status)
            {
                // document.getElementById('twit').innerHTML = 'Tweet Score '+ (data.documents[0].score * 100).toFixed(1) +'/100';
                var count = (data.documents[0].score * 100).toFixed(1);
                if(count >= 80){
                    document.getElementById('twit-bold').innerHTML = 'Score '+count+'/100 '+'(Very Good Tweet)';
                }else if((count < 80) && (count >= 60 )){
                    document.getElementById('twit-bold').innerHTML = 'Score '+count+'/100 '+'(Good Tweet)';
                }else if((count < 60) && (count >= 40 )){
                    document.getElementById('twit-bold').innerHTML = 'Score '+count+'/100 '+'(Fair Tweet)';
                }else{
                    document.getElementById('twit-bold').innerHTML = 'Score '+count+'/100 '+'(Poor Tweet)';
                }

               document.getElementById('twit').style.display = '';
                console.log(data); // Contains the suite
            },
            error: function(data,error)
            {   document.getElementById('twit').innerHTML = data.message;
            }
    });
}
