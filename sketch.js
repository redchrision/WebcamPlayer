// ********************************
// WEBCAM PIANO *
// ********************************

var video;
var prevImg; //Step 1: Renaming the backImg to prevImg
var diffImg;
var currImg;
var thresholdSlider;
var threshold;

var grid; // Step 3: Creates a global variable called grid

function setup() {
    createCanvas(640 * 2, 480);
    pixelDensity(1);
    video = createCapture(VIDEO);
    video.hide();

    thresholdSlider = createSlider(0, 255, 50);
    thresholdSlider.position(20, 20);

    grid = new Grid(640,480); // Step 3: Initialises the global variable grid in the bottom of the setup() function
}

function draw() {
    background(0);
    image(video, 0, 0);

    currImg = createImage(video.width, video.height);
    currImg.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);

    // Step 5: Right before using the blur filter on the currImg, uses the resize command to scale it down to a quarter of the size it was
    currImg.resize(currImg.width / 4, currImg.height / 4);

    // Step 4: Running the blur filter on the currImg at the top of the draw() function, right after we have copied the contents of the video into it
    // Step 4: Uses the BLUR filter with 3 iterations
    currImg.filter(BLUR, 3);

    diffImg = createImage(video.width, video.height);

    // Step 5: Uses the resize command to scale diffImg down
    diffImg.resize(diffImg.width / 4, diffImg.height / 4);

    diffImg.loadPixels();

    threshold = thresholdSlider.value();

    if (typeof prevImg !== 'undefined') {
        prevImg.loadPixels();
        currImg.loadPixels();
        for (var x = 0; x < currImg.width; x += 1) {
            for (var y = 0; y < currImg.height; y += 1) {
                var index = (x + (y * currImg.width)) * 4;
                var redSource = currImg.pixels[index + 0];
                var greenSource = currImg.pixels[index + 1];
                var blueSource = currImg.pixels[index + 2];

                var redBack = prevImg.pixels[index + 0];
                var greenBack = prevImg.pixels[index + 1];
                var blueBack = prevImg.pixels[index + 2];

                var d = dist(redSource, greenSource, blueSource, redBack, greenBack, blueBack);

                if (d > threshold) {
                    diffImg.pixels[index + 0] = 0;
                    diffImg.pixels[index + 1] = 0;
                    diffImg.pixels[index + 2] = 0;
                    diffImg.pixels[index + 3] = 255;
                } else {
                    diffImg.pixels[index + 0] = 255;
                    diffImg.pixels[index + 1] = 255;
                    diffImg.pixels[index + 2] = 255;
                    diffImg.pixels[index + 3] = 255;
                }
            }
        }
    }

    diffImg.updatePixels();
    image(diffImg, 640, 0);

    noFill();
    stroke(255);
    text(threshold, 160, 35);

    // Step 2: Moves the code updating the prevImg from the keyPressed() function to the end of the draw() loop
    prevImg = createImage(currImg.width, currImg.height);
    prevImg.copy(currImg, 0, 0, currImg.width, currImg.height, 0, 0, currImg.width, currImg.height);
    //console.log("saved new background");

    // Step 3: Adding the line at the bottom of the draw() function
    grid.run(diffImg); 
}

function keyPressed() {
    userStartAudio(); // Step 6: When the key is pressed, userStartAudio() is activated and we run the core p5.js sound library to play sounds depending on which “note” in the grid is activated
}

// faster method for calculating color similarity which does not calculate root.
// Only needed if dist() runs slow
function distSquared(x1, y1, z1, x2, y2, z2){
  var d = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) + (z2-z1)*(z2-z1);
  return d;
}
