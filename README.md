# post-a-quote
A simple application to post a quote (a new one each time the API is run) on a favorite social media platform, here: Facebook.
A text file 'quotes.txt' acts as an aiding file, which consists of many quotes separated by a specific separator. Now, each time that this API is run and the button to 'Select a Quote' is run, a random function selects one of the many quotes.
Then, html5's canvas is used to draw the quote and have an 'Image with the Quote'. Care is taken to wrap the text and fit it in the limited width of the canvas.
Next, the image is posted to Facebook after several conversions between formats with proper parameters.
