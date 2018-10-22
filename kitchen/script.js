document.addEventListener("DOMContentLoaded", function() {
    console.log("page loaded");

    // Express HTTP Server
    const express = require('express')();
    const port = 80;
    express.listen(port);
    // send all orders
    express.get('/', (req, res) => res.json(orders));

    // Setup Leap loop with frame callback function
    const controllerOptions = { enableGestures: true };
    let previousSwipeDirection = "none";

    Leap.loop(controllerOptions, function(frame) {

        if (frame.gestures.length > 0) {

            for (let i = 0; i < frame.gestures.length; i++) {
                const gesture = frame.gestures[i];
                if (gesture.type === "swipe") {
                    //console.log(gesture.direction);

                    // Classify swipe as either horizontal or vertical
                    // https://stackoverflow.com/questions/18018642/detecting-swipe-gesture-direction-with-leap-motion
                    const isHorizontal = Math.abs(gesture.direction[0]) * 0.4 > Math.abs(gesture.direction[1]);

                    //Classify as right-left or up-down
                    let swipeDirection = "other";
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

                        swiped(swipeDirection);
                    }
                }
            }
        } else {
            previousSwipeDirection = "none";
            //console.log("no gesture");
        }
    });
});

/*
This method needs to be 'aware' of who the operator is so that it knows what item they have
 */
function swiped(direction) {
    if (direction === "right") {
        // TODO: check user has no items at this stage
        document.getElementById("in-progress").insertAdjacentElement("afterbegin", document.getElementById("todo").firstElementChild);
    } else if (direction === "left") {
        // TODO: check user has item in progress
        document.getElementById("todo").insertAdjacentElement("afterbegin", document.getElementById("in-progress").firstElementChild);
    } else if (direction === "inwards") {
        // TODO: update display
        // TODO: error handling (undo hand action)
        if (!kitchenState.doing[chef].item) {
            let countDone = kitchenState.doing[chef]
            kitchenState.done[chef] = kitchenState.doing[chef];
            kitchenState.doing[chef] = noItem;

            let i = 0;
            while (countDone > 0 && i < orders.length) {
                for (let j = 0; i < orders[i].order_items.length; ++i) {
                    if (orders[i].order_items[j].state === "doing" && orders[i].order_items[j].item === kitchenState.done[chef].item) {
                        // item in progress found and adjusting quantity
                        // FIXME: This assumes that order quantities are not split, e.g. 4 parmis become two tasks of 2
                        countDone -= orders[i].order_items[j].qty;
                        orders[i].order_items[j].state = "done";
                        if (countDone <= 0) break;
                    }
                }
            }
        }
    }
}


let chef = "awais";

const noItem = {
    "item": null,
    "qty": 0
}

let orders = [{

        "order_id": 1,
        "order_items": [{
                "item": "salad",
                "qty": 5,
                "state": "todo"
            },
            {
                "item": "steak",
                "qty": 5,
                "state": "done"
            }
        ]
    },
    {
        "order_id": 2,
        "order_items": [{
                "item": "chips",
                "qty": 5,
                "state": "todo"
            },
            {
                "item": "steak",
                "qty": 10,
                "state": "doing"
            }
        ]
    }
];

let kitchenState = {
    "todo": [],
    "doing": {
        "awais": {
            "item": null,
            "qty": 0
        },
        "ben": {
            "item": null,
            "qty": 0
        }
    },
    "done": {
        "awais": {
            "item": null,
            "qty": 0
        },
        "ben": {
            "item": null,
            "qty": 0
        }
    }
};