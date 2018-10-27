let orders = [];
let servedOrders = [];

document.addEventListener("DOMContentLoaded", function() {
    const request = require('request');
    const _ = require('lodash')();

    // reloadPage();
    setInterval(function() {
        request('http://192.168.0.9/', (error, response, body) => {
            if (!error && response.statusCode === 200) {
                document.getElementById('order-right-items').innerHTML = '';
                document.getElementById('order-left-items').innerHTML = '';

                bodyJson = JSON.parse(body)
                orders = bodyJson;
                reloadPage();
            } else {
                console.log("I am broke");
            }
        });
    }, 5000);

    function reloadPage() {
        let order_ids = [];
        console.log(servedOrders);
        orders.forEach(order => {
            if (!containsObjectWithOrderId(servedOrders, order.order_id)) {
                servedOrders.push({ 'order_id': order.order_id, 'served': false });
            };
            if (!servedOrders.find(x => x.order_id === order.order_id).served === true) {
                order_ids.push(order.order_id);
            }
        });

        let rightOrderNumber = Math.min.apply(null, order_ids);
        let rightOrder = orders.find(x => x.order_id === rightOrderNumber);

        let leftOrderNumber = Math.min.apply(null, order_ids.filter(n => n != rightOrderNumber));
        let leftOrder = orders.find(x => x.order_id === leftOrderNumber);

        document.getElementById('order-right-number').innerHTML = rightOrderNumber;
        document.getElementById('order-left-number').innerHTML = leftOrderNumber;

        let rightOrderUl = document.getElementById('order-right-items');
        let rightOrderComplete = true;
        rightOrder.order_items.forEach(item => {
            createListItem(item, rightOrderUl);
            if (item.state !== "done") {
                rightOrderComplete = false;
            };
        });

        let leftOrderUl = document.getElementById('order-left-items');
        let leftOrderComplete = true;
        leftOrder.order_items.forEach(item => {
            createListItem(item, leftOrderUl);
            if (item.state !== "done") {
                leftOrderComplete = false;
            };
        });

        if (rightOrderComplete && !document.getElementById('order-right-serve-button')) {
            addRightServedButton();
        };
        if (leftOrderComplete && !document.getElementById('order-left-serve-button')) {
            addLeftServedButton();
        };
    };

    function createListItem(item, ul) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(item.item + ' x ' + item.qty + ' (' + item.state + ')'));
        ul.appendChild(li);
    };

    function addRightServedButton() {
        let button = document.createElement('button');
        button.setAttribute('id', 'order-right-serve-button');
        button.setAttribute('onclick', 'rightServedCallback()');
        button.appendChild(document.createTextNode('Serve Me!'));
        document.getElementById('order-right').appendChild(button);
    };

    function addLeftServedButton() {
        let button = document.createElement('button');
        button.setAttribute('id', 'order-left-serve-button');
        button.setAttribute('onclick', 'leftServedCallback()');
        button.appendChild(document.createTextNode('Serve Me!'));
        document.getElementById('order-left').appendChild(button);
    };
});

function containsObjectWithOrderId(list, key) {
    console.log(list)
    for (let i = 0; i < list.length; i++) {
        if (list[i].order_id === key) {
            return true;
        }
    }
    return false;
};

function rightServedCallback() {
    let value = parseInt(document.getElementById('order-right-number').innerHTML);
    servedOrders.find(x => x.order_id === value).served = true;
    delete value;
    document.getElementById('order-right-serve-button').remove()
};

function leftServedCallback() {
    let value = parseInt(document.getElementById('order-left-number').innerHTML);
    servedOrders.find(x => x.order_id === value).served = true;
    delete value;
    document.getElementById('order-left-serve-button').remove()
};

// orders = [{
//         "order_id": 1,
//         "order_items": [{
//                 "item": "salad",
//                 "qty": 5,
//                 "state": "done"
//             },
//             {
//                 "item": "steak",
//                 "qty": 2,
//                 "state": "done"
//             }
//         ]
//     },
//     {
//         "order_id": 2,
//         "order_items": [{
//                 "item": "chips",
//                 "qty": 4,
//                 "state": "todo"
//             },
//             {
//                 "item": "steak",
//                 "qty": 3,
//                 "state": "doing"
//             }
//         ]
//     }
// ];

// servedOrders = [
//     // {
//     //     "order_id": 1,
//     //     "served": false
//     // },
//     // {
//     //     "order_id": 2,
//     //     "served": false
//     // }
// ];