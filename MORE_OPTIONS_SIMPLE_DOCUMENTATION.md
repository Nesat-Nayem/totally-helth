# More Options - Simple Integration Documentation

## Overview
The `moreOptions` field has been added to order items as an optional field. This allows each order item to have additional options like "Extra Cheese", "Less Salt", etc. The field is integrated into the existing order creation and update endpoints.

## Database Schema Changes

### Order Item Structure
Each order item now includes an optional `moreOptions` array:

```typescript
interface IOrderItem {
  productId?: string;
  title: string;
  price: number;
  qty: number;
  moreOptions?: Array<{
    name: string;
  }>;
}
```

## API Integration

### 1. Create Order with More Options
**POST** `/api/orders`

Include `moreOptions` in the items array when creating an order:

#### Example Request
```json
{
  "date": "2024-01-15",
  "customer": {
    "name": "John Doe",
    "phone": "1234567890"
  },
  "items": [
    {
      "productId": "64a1b2c3d4e5f6789012348",
      "title": "Cheese Burger",
      "price": 330,
      "qty": 1,
      "moreOptions": [
        { "name": "Extra Cheese" },
        { "name": "Less Salt" }
      ]
    },
    {
      "productId": "64a1b2c3d4e5f6789012349",
      "title": "Veg Pizza",
      "price": 250,
      "qty": 2,
      "moreOptions": [
        { "name": "Extra Spicy" }
      ]
    }
  ],
  "subTotal": 830,
  "total": 830,
  "orderType": "DineIn",
  "salesType": "restaurant"
}
```

#### Example Response
```json
{
  "message": "Order created",
  "data": {
    "_id": "64a1b2c3d4e5f6789012347",
    "items": [
      {
        "productId": "64a1b2c3d4e5f6789012348",
        "title": "Cheese Burger",
        "price": 330,
        "qty": 1,
        "moreOptions": [
          { "name": "Extra Cheese" },
          { "name": "Less Salt" }
        ]
      },
      {
        "productId": "64a1b2c3d4e5f6789012349",
        "title": "Veg Pizza",
        "price": 250,
        "qty": 2,
        "moreOptions": [
          { "name": "Extra Spicy" }
        ]
      }
    ],
    "subTotal": 830,
    "total": 830,
    "status": "paid"
  }
}
```

### 2. Update Order with More Options
**PUT** `/api/orders/:id`

Update an existing order by including `moreOptions` in the items:

#### Example Request
```json
{
  "items": [
    {
      "productId": "64a1b2c3d4e5f6789012348",
      "title": "Cheese Burger",
      "price": 330,
      "qty": 1,
      "moreOptions": [
        { "name": "Extra Cheese" },
        { "name": "No Onions" }
      ]
    }
  ]
}
```

### 3. Get Order with More Options
**GET** `/api/orders/:id`

The response will include the `moreOptions` for each item:

#### Example Response
```json
{
  "data": {
    "_id": "64a1b2c3d4e5f6789012347",
    "items": [
      {
        "productId": "64a1b2c3d4e5f6789012348",
        "title": "Cheese Burger",
        "price": 330,
        "qty": 1,
        "moreOptions": [
          { "name": "Extra Cheese" },
          { "name": "Less Salt" }
        ]
      }
    ],
    "subTotal": 330,
    "total": 330
  }
}
```

## Frontend Implementation

### 1. Order Creation Form
```jsx
const OrderForm = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [moreOptions, setMoreOptions] = useState({});

  const addMoreOption = (itemIndex, optionName) => {
    const newOptions = [...(moreOptions[itemIndex] || [])];
    if (!newOptions.some(opt => opt.name === optionName)) {
      newOptions.push({ name: optionName });
      setMoreOptions({
        ...moreOptions,
        [itemIndex]: newOptions
      });
    }
  };

  const removeMoreOption = (itemIndex, optionName) => {
    const newOptions = (moreOptions[itemIndex] || []).filter(
      opt => opt.name !== optionName
    );
    setMoreOptions({
      ...moreOptions,
      [itemIndex]: newOptions
    });
  };

  const handleSubmit = async () => {
    const orderData = {
      date: new Date().toISOString(),
      items: orderItems.map((item, index) => ({
        ...item,
        moreOptions: moreOptions[index] || []
      })),
      subTotal: calculateSubTotal(),
      total: calculateTotal(),
      orderType: "DineIn",
      salesType: "restaurant"
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        console.log('Order created successfully');
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Order form fields */}
      {orderItems.map((item, index) => (
        <div key={index}>
          <h4>{item.title}</h4>
          <p>Price: AED {item.price}</p>
          <p>Quantity: {item.qty}</p>
          
          {/* More Options Section */}
          <div>
            <h5>More Options:</h5>
            {(moreOptions[index] || []).map((option, optIndex) => (
              <div key={optIndex}>
                {option.name}
                <button 
                  type="button"
                  onClick={() => removeMoreOption(index, option.name)}
                >
                  Remove
                </button>
              </div>
            ))}
            
            <input
              type="text"
              placeholder="Add option (e.g., Extra Cheese)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMoreOption(index, e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      ))}
      
      <button type="submit">Create Order</button>
    </form>
  );
};
```

### 2. Order List Display
```jsx
const OrderItemRow = ({ item, itemIndex }) => {
  return (
    <tr>
      <td>
        <img src={item.image} alt={item.title} />
      </td>
      <td>
        <div>
          <strong>{item.title}</strong>
          {item.moreOptions && item.moreOptions.length > 0 && (
            <div style={{ fontSize: '0.8em', color: '#666', marginTop: '4px' }}>
              Options: {item.moreOptions.map(opt => opt.name).join(', ')}
            </div>
          )}
        </div>
      </td>
      <td>
        <button onClick={() => decrementQty(itemIndex)}>-</button>
        {item.qty}
        <button onClick={() => incrementQty(itemIndex)}>+</button>
      </td>
      <td>AED {item.subTotal}</td>
      <td>
        <button 
          onClick={() => openMoreOptionsModal(itemIndex)}
          className="more-options-btn"
        >
          More Options
        </button>
        <button 
          onClick={() => deleteItem(itemIndex)}
          className="delete-btn"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};
```

### 3. More Options Modal
```jsx
const MoreOptionsModal = ({ 
  isOpen, 
  onClose, 
  itemIndex, 
  currentOptions = [],
  onSaveOptions 
}) => {
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (newOption.trim() && !currentOptions.some(opt => opt.name === newOption.trim())) {
      onSaveOptions([...currentOptions, { name: newOption.trim() }]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionName) => {
    onSaveOptions(currentOptions.filter(opt => opt.name !== optionName));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>More Options for Item {itemIndex + 1}</h3>
      
      <div>
        <h4>Current Options:</h4>
        {currentOptions.map((option, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span>{option.name}</span>
            <button 
              onClick={() => handleRemoveOption(option.name)}
              style={{ marginLeft: '10px', color: 'red' }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Enter option name"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddOption();
            }
          }}
        />
        <button onClick={handleAddOption}>Add Option</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <button onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
};
```

## Validation Rules

### More Options Validation
- `moreOptions` is optional for each item
- Each option must have a `name` field (string, non-empty)
- Duplicate option names are prevented (case-insensitive)
- No price impact on order totals

### Example Validation
```javascript
// Valid
{
  "name": "Extra Cheese"
}

// Invalid
{
  "name": ""  // Empty name
}

// Invalid
{
  // Missing name field
}
```

## Notes
- More options are stored at the item level
- Only the option name is stored (no prices or categories)
- Duplicate options (same name) are prevented
- All existing order functionality remains unchanged
- More options are case-insensitive for duplicate checking
- The field is completely optional - existing orders without more options will work normally
