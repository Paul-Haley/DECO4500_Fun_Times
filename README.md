# DECO4500_Fun_Times
Making the diner parallel



JSON structures:
```
Full system state:
{
    orders: [
        {
            order_id: 2,
            order_items: {
                {
                    "name": "chips",
                    "quantity": 5,
                    "state": "todo"
                },
                {
                    "name": "steak",
                    "quantity": 10,
                    "state": "doing"
                }
            }
        },
        {
            order_id: 1,
            order_items: [
                {
                    "name": "salad",
                    "quantity": 5,
                    "state": "todo"
                },
                {
                    "name": "steak",
                    "quantity": 5,
                    "state": "done"
                }
            ]
        }
    ]
}
```

```
Kitchen State:
{
    todo: {
        "chips": 5,
        "steak": 10
    },
    doing: {
        "ben": {
            "salad": 5
        },
        "awais": {
            "chips": 5
        }
    },
    done: {
        "ben": {
            "steak": 3
        },
        "awais": {
            "salad": 1
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