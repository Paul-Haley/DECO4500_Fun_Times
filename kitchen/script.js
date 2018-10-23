document.addEventListener("DOMContentLoaded", function() {
    console.log("page loaded");

    document.getElementById("chef").onchange  = function() {
        chef = document.getElementById("chef").value;
        console.log(chef);
    }

    render();

    // setup the grid stack
    // $(function () {
    //     $('.grid-stack').gridstack();
    // });

    // Express HTTP Server
    const express = require('express');
    const app = express();
    app.use(express.json());

    const port = 80;
    app.listen(port);

    // send all orders
    app.get('/', (req, res) => res.json(orders));

    // Accept new orders
    app.post('/ordering', (req, res) => {
        let newOrder = req.body;
        for (let i = 0; i < newOrder.order_items.length; i++) {
            newOrder.order_items[i].state = "todo";
        }

        // Append new order to orders object
        newOrder.order_id = nextOrderId++;
        orders.push(newOrder);

        // Update the kitchen status (new todos, merge existing)
        for (let i = 0; i < newOrder.order_items.length; i++) {
            let combo = false;
            for (let j = 0; j < kitchenState.todo.length && newOrder.order_id - kitchenState.todo[j].ids[0] <= 1; j++) { //This 1 is how many dockets to look ahead.
                if (kitchenState.todo[j].item === newOrder.order_items[i].item) {
                    combo = true;
                    kitchenState.todo[j].qty += newOrder.order_items[i].qty;
                    kitchenState.todo[j].ids.push(newOrder.order_id);
                    break;
                }
            }
            if (!combo) {
                kitchenState.todo.unshift(newOrder.order_items[i]);
                kitchenState.todo[0].ids = [newOrder.order_id];
            }
        }

        render();
        res.send("Yummy!");
    });

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

let lastGestureTime = new Date();

/*
This method needs to be 'aware' of who the operator is so that it knows what item they have
 */
function swiped(direction) {
    const now = new Date();
    if (now - lastGestureTime > 500) {
        lastGestureTime = now;
    } else { //bouncing...
        return;
    }

    if (direction === "right") { // Taking item
        if (kitchenState.doing[chef].item) {
            // TODO: already have item, remind them
            return;
        } else if (kitchenState.todo.length === 0) {
            return;
        }

        // shift makes array function as queue in O(n) time
        let orderItem = kitchenState.todo.pop();
        kitchenState.doing[chef] = orderItem;
        updateOrders(orderItem, "doing");

    } else if (direction === "left") { // Reject item/undo complete
        if (!kitchenState.doing[chef].item) {
            // TODO: don't have item, remind them
            return;
        }

        let orderItem = kitchenState.doing[chef];
        kitchenState.todo.push(orderItem); // it is possible to make items out of order here, avoid

        //Insertion sort based of dockets (ids) of each orderItem
        // let priority = Number.MAX_SAFE_INTEGER; // find priority of item based off oldest docket
        // for (let i = 0; i < orderItem.ids.length; i++) {
        //     priority = Math.min(priority, orderItem.ids[i]);
        // }
        //
        // console.log(priority);
        // console.log(kitchenState.todo);
        // if (kitchenState.todo.length > 0) {
        //     // effectively an insertion sort on a sorted queue/array
        //     for (let i = kitchenState.todo.length - 1; i >= 0; i--) {
        //         for (let j = 0; j < kitchenState.todo[i].ids.length; j++) {
        //             if (kitchenState.todo[i].ids[j] >= priority) {
        //                 kitchenState.todo.splice(i + 1, 0, orderItem);
        //             }
        //         }
        //     }
        // } else { // special case with no items, trivially sorted
        //     kitchenState.todo.push(orderItem);
        // }

        kitchenState.doing[chef] = noItem;
        updateOrders(orderItem, "todo");

    } else if (direction === "inward") { // complete doing item
        // TODO: error handling (undo hand action)
        if (!kitchenState.doing[chef].item) {
            // TODO: No doing item, remind them
            return;
        }

        //let countDone = kitchenState.doing[chef]
        let orderItem = kitchenState.doing[chef];
        kitchenState.done[chef] = orderItem;
        kitchenState.doing[chef] = noItem;
        updateOrders(orderItem, "done");



        // let i = orders.length - 1;
        // while (countDone > 0 && i >= 0) {
        //     for (let j = 0; i < orders[i].order_items.length; ++i) {
        //         if (orders[i].order_items[j].state === "doing" && orders[i].order_items[j].item === kitchenState.done[chef].item) {
        //             // item in progress found and adjusting quantity
        //             // FIXME: This assumes that order quantities are not split, e.g. 4 parmis become two tasks of 2
        //             countDone -= orders[i].order_items[j].qty;
        //             orders[i].order_items[j].state = "done";
        //             if (countDone <= 0) break;
        //         }
        //     }
        // }
    } else {
        return; // skip render for unknown gesture
    }

    render();
}

// Only updates the orders object, not kitchen state
function updateOrders(orderItem, to) {
    for (let i = 0; i < orderItem.ids.length; i++) {
        const orderId = orderItem.ids[i] - 1;
        for (let j = 0; j < orders[orderId].order_items.length; j++) {// MATLAB indexing
            if (orders[orderId].order_items[j].item === orderItem.item) {
                orders[orderId].order_items[j].state = to;
            }
        }
    }
}

// Updates both visible lists through a complete refresh
function render() {
    // clear, might be smoother to clear 1 by 1
    document.getElementById("todo").innerHTML = "";
    document.getElementById("doing").innerHTML = "";

    //for (let i = kitchenState.todo.length - 1; i >= 0; i--) {
    for (let i in kitchenState.todo) {
        document.getElementById("todo").insertAdjacentHTML("afterbegin", "<li class='order-item'>" + kitchenState.todo[i].item + " X " + kitchenState.todo[i].qty + "</li>");
    }

    for (let i in kitchenState.doing) {
        if (kitchenState.doing[i].item) {
            document.getElementById("doing").insertAdjacentHTML("afterbegin", "<li class='order-item'>" + kitchenState.doing[i].item + " X " + kitchenState.doing[i].qty + "<ul><li>" + i + "</li></ul></li>");
        }
    }
}

let nextOrderId = 3;

// Awais is our primary chef, Ben can join in too! Fun Times!
let chef = "awais";

const noItem = {
    "item": null,
    "qty": 0,
    "ids": []
}

// Indexes are MATLAB crap, thanks Todd
let orders = [{

        "order_id": 1,
        "order_items": [{
                "item": "salad",
                "qty": 5,
                "state": "done"
            },
            {
                "item": "steak",
                "qty": 2,
                "state": "doing"
            }
        ]
    },
    {
        "order_id": 2,
        "order_items": [{
                "item": "chips",
                "qty": 4,
                "state": "todo"
            },
            {
                "item": "steak",
                "qty": 3,
                "state": "doing"
            }
        ]
    }
];

let kitchenState = {
    "todo": [
        {
            "item": "chips",
            "qty": 4,
            "ids": [2]
        }
    ],
    "doing": {
        "awais": {
            "item": "steak",
            "qty": 5,
            "ids": [1,2]
        },
        "ben": {
            "item": null,
            "qty": 0,
            "ids": []
        }
    },
    "done": {
        "awais": {
            "item": null,
            "qty": 0,
            "ids": []
        },
        "ben": {
            "item": "salad",
            "qty": 5,
            "ids": [1]
        }
    }
};