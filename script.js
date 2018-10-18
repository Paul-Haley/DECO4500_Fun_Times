document.addEventListener("DOMContentLoaded", function() {
    console.log("page loaded");

    // Setup Leap loop with frame callback function
    var controllerOptions = {enableGestures: true};
    var previousSwipeDirection = "none";

    Leap.loop(controllerOptions, function(frame) {

        if (frame.gestures.length > 0) {

            for (var i = 0; i < frame.gestures.length; i++) {
                var gesture = frame.gestures[i];
                if (gesture.type === "swipe") {
                    //console.log(gesture.direction);

                    // Classify swipe as either horizontal or vertical
                    // https://stackoverflow.com/questions/18018642/detecting-swipe-gesture-direction-with-leap-motion
                    var isHorizontal = Math.abs(gesture.direction[0]) * 0.4 > Math.abs(gesture.direction[1]);

                    //Classify as right-left or up-down
                    var swipeDirection = "other";
                    if (isHorizontal) {
                        if (gesture.direction[0] > 0) {
                            swipeDirection = "right";
                        } else {
                            swipeDirection = "left";
                        }
                    } else {
                        if (gesture.direction[1] < 0) {
                            swipeDirection = "inward";
                        }
                    }

                    // check if different gesture detected
                    if (previousSwipeDirection !== swipeDirection) {
                        document.getElementById("action").innerText = swipeDirection;
                        console.log(swipeDirection);
                        previousSwipeDirection = swipeDirection;
                    }
                }
            }
        } else {
            previousSwipeDirection = "none";
            //console.log("no gesture");
        }
    });
});