var canvas, context, blob;

$(document).ready(function () {

	canvas = document.getElementById('image');
 	context = canvas.getContext("2d");
 	canvas.width = 500;
 	canvas.height = 500;

	var quotePicked = "Blah.";
	var flagQuotePicked = 0;									//A flag


	//to select a random quote
	$('#btnQuote').click(function (e) {

		jQuery.get('quotes.txt', function(data) {				//quotes.txt ,bris the text file stored locally
	    var arr = data.split('<br><br>');						//separator '<br><br>' has been used in the file between every 2 quotes
	    var idx = Math.floor(arr.length * Math.random());		//this would give a random index
	    
	    quotePicked = arr[idx];
	    alert('Quote picked:' + quotePicked);					
	    
		}, 'text');

		flagQuotePicked = 1;

	});

 	context.font = "28px Helvetica";
 	context.textAlign = "center";
 	context.fillText(quotePicked, canvas.width/2, canvas.height/2);

 	var maxWidth = canvas.width - 40;
 	var lineHeight = 34;

	$('#btnCreateImage').click(function (e) {
	 	if (flagQuotePicked == 0) {
	 		alert ("Find a Quote first");
	 	}
	 	else {

	 		context.clearRect(0, 0, canvas.width, canvas.height);

	 		//textwrapping required
	 		var words = quotePicked.split(" ");
	 		var lines = [];
	 		var currentLine = words[0];
	 		var word = null;

	 		var x = canvas.width/2,							//x-coordinate of where to start the quote on the canvas
	 			y = canvas.height/2.5;						//y-coordinate


	 		for (i=1; i<words.length; i++) {
	 			word = words[i];
	 			var width = context.measureText(currentLine + " " + word).width;
	 			if (width < maxWidth) {
	 				currentLine += " " + word;
	 			}
	 			else {
	 				context.fillText(currentLine, x, y);
	 				y += lineHeight;
	 				lines.push (currentLine);
	 				currentLine = word;
	 			}
	 		}

	 		lines.push(currentLine);
	 		context.fillText(currentLine, x, y);
		}
	 });

	//To post the image
	$('#btnPost').click(function (e) {
		// var canvas = document.getElementById('image');
		var dataURI = canvas.toDataURL('image/png', 0.75);					//Extract base64 encoded image data from canvas (returned as a string "data: ___")
		//console.log (dataURI);
		var imgdata = dataURI.match(/data:(image\/.+);base64,(.+)/);		//to check if we're getting the expected URL

		blob = dataURItoBlob (dataURI);
		console.log (blob);											//returns the size and type


		FB.getLoginStatus(function (response) {
	        console.log(response);
	        if (response.status === "connected") {
	            postImageToFacebook(response.authResponse.accessToken, "Canvas to Facebook", "image/png", blob, window.location.href);
	        } else if (response.status === "not_authorized") {
	            FB.login(function (response) {
	                postImageToFacebook(response.authResponse.accessToken, "Canvas to Facebook", "image/png", blob, window.location.href);
	            }, {scope: "publish_actions"});
	        } else {
	            FB.login(function (response) {
	                postImageToFacebook(response.authResponse.accessToken, "Canvas to Facebook", "image/png", blob, window.location.href);
	            }, {scope: "publish_actions"});
	        }
	    });
	});
 });


//Posting to Social Media
function PostImageToFacebook(authToken) {

	//Using FormData objects to send to Facebook
	var fd = new FormData ();
	fd.append("access_token", authToken);
    fd.append("source", blob);
	fd.append("no_story", true);

	try {
        $.ajax({
            url: "https://graph.facebook.com/me/photos?access_token=" + authToken,
            type: "POST",
            data: fd,
            processData: false,
            contentType: false,
            cache: false,
            success: function (data) {
	            console.log("success: ", data);

	            // Get image source url
	            FB.api(
	                "/" + data.id + "?fields=images",
	                function (response) {
	                    if (response && !response.error) {
	                        //console.log(response.images[0].source);

	                        // Create facebook post using image
	                        FB.api(
	                            "/me/feed",
	                            "POST",
	                            {
	                                "message": "",
	                                "picture": response.images[0].source,
	                                "link": window.location.href,
	                                "name": 'A quote!',
	                                "description": message,
	                                "privacy": {
	                                    value: 'SELF'
	                                }
	                            },
	                            function (response) {
	                                if (response && !response.error) {
	                                    /* handle the result */
	                                    console.log("Posted story to facebook");
	                                    console.log(response);
	                                }
	                            }
	                        );
	                    }
	                }
	            );
	        },
            error: function (shr, status, data) {
                console.log("error " + data + " Status " + shr.status);
            },
            complete: function () {
                console.log("Post to facebook complete");
            }
        });

    } catch (e) {
        console.log(e);
	}
}

//Converting a base64 String into BLOB
function dataURItoBlob (dataURI, mime) {

	var byteString = window.atob (dataURI);							//decodes a base64 encoded string
	var ia = new Uint8Array (byteString.length);					//an array of 8-bit unsigned integers

	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt (i);							//returns the Unicode of the ith character in the string
	}

	var blob = new Blob ([ia], {type: mime});						//contents will contain the concatenation of the array of values given in parameters
	return blob;
}