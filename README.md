# DECO4500_Fun_Times
Making the diner parallel and hands fee.

Groups nearby items based off simple algorithm. Gesture control to avoid paper dockets and related hygiene issues.  

For kitchen system use the following controls:
* Swipe right (right to left) to take top todo item
    * right arrow key
* Swipe left (left to right) to undo last action
    * left arrow key
* Swipe inwards (outwards from your body) to mark order as complete
    * up arrow key

JSON structures:
```
Full system state: [
    {
        "order_id": 1,
        "order_items": [
            {
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
        "order_items": {
            {
                "item": "chips",
                "qty": 5,
                "state": "todo"
            },
            {
                "item": "steak",
                "qty": 10,
                "state": "doing"
            }
        }
    }
]

```

```
Kitchen State:
{
    "todo": [
        {
            "item": "chips",
            "qty": 5
        },
        {
            "item": "steak",
            "qty": 10
        }
    ],
    "doing": {
        "awais": {
            "item": "chips",
            "qty": 5
        },
        "ben": {
            "item": "salad",
            "qty": 5
        }
    },
    "done": {
        "awais": {
           "item": "steak",
            "qty": 3
        },
        "ben": {
            "item": "salad",
            "qty": 1
        }
    }
}
```

```
Server State:
{
    orders: [
        {
            order_id: 1,
            is_served: True
        },
        {
            order_id: 2,
            is_served: False
        },
    ]
}
```