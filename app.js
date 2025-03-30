// form validation
const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("input", function () {
  let isValid = true;
  for (let i = 0; i < form.elements.length; i++) {
    const element = form.elements[i];
    if (
      (element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT") &&
      element.type !== "hidden" &&
      element.value.trim() === ""
    ) {
      isValid = false;
      break;
    }
  }
  if (isValid) {
    checkoutButton.disabled = false;
    checkoutButton.classList.remove("disabled");
  } else {
    checkoutButton.disabled = true;
    checkoutButton.classList.add("disabled");
  }
});

// Function to handle queue
const handleQueue = () => {
  let queueNumber = localStorage.getItem("queueNumber") || 0;
  queueNumber++;
  localStorage.setItem("queueNumber", queueNumber);
  document.getElementById("queue").textContent = queueNumber;
  document.getElementById("checkoutForm").style.display = "none";
  document.getElementById("queueNumber").style.display = "block";
};

// kirim data ketika checkout di klik
checkoutButton.addEventListener("click", function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);

  // Mengambil data dari Alpine store
  const cart = Alpine.store("cart");
  const items = cart.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    total: item.price * item.quantity,
  }));
  objData.items = JSON.stringify(items);
  objData.total = cart.total;

  const message = formatMessage(objData);
  const whatsappUrl = `https://wa.me/6288299213858?text=${encodeURIComponent(
    message
  )}`;
  window.open(whatsappUrl);

  // Handle queue number display
  handleQueue();
});

// Function to format the WhatsApp message
const formatMessage = (obj) => {
  let items;
  try {
    items = JSON.parse(obj.items);
    if (!Array.isArray(items)) {
      throw new Error("Items is not an array");
    }
  } catch (e) {
    console.error("Failed to parse items:", e);
    return "Invalid items data";
  }

  const formattedItems = items
    .map((item) => {
      const itemName = item.name;
      const itemQuantity = item.quantity;
      const itemTotal = rupiah(item.total);
      return `${itemName} (${itemQuantity} x ${itemTotal})`;
    })
    .join("\n");

  const customerName = obj.name;
  const customerEmail = obj.email;
  const customerPhone = obj.phone;

  const total = rupiah(Number(obj.total));

  return `Data Customer
Nama: ${customerName}
Email: ${customerEmail}
No Hp: ${customerPhone}

Data Pesanan
${formattedItems}

TOTAL: ${total}
Terima Kasih.`;
};

// Function to format number to Rupiah
const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
};

document.addEventListener("alpine:init", () => {
  Alpine.data("menu", () => ({
    items: [
      { id: 1, name: "Rank Master", img: "https://i.pinimg.com/736x/94/2c/69/942c6949992bb7e741b602f92cdc55a8.jpg", price: 5000 },
      { id: 2, name: "Rank GrandMaster/Bintang", img: "https://i.pinimg.com/736x/73/96/d8/7396d85a6a7c602be4bad2b87c786894.jpg", price: 7000 },
      { id: 3, name: "Rank Epic/Bintang", img: "https://i.pinimg.com/736x/49/19/b7/4919b7d42912816966d1d23f93bb3b89.jpg", price: 10000 },
      {
        id: 4,
        name: "Rank Legend/Bintang",
        img: "https://i.pinimg.com/736x/fb/cc/76/fbcc76e94057120e96c6cf1d6bf8b08d.jpg",
        price: 12000,
      },
      {
        id: 5,
        name: "Rank Mythic/Bintang",
        img: "https://i.pinimg.com/736x/00/ef/5e/00ef5e7e864cfa4584fc01661d617528.jpg",
        price: 15000,
      },
      { id: 6, name: "Rank Mythic Honor/Bintang", img: "https://i.pinimg.com/736x/6a/1c/a9/6a1ca96185dd0d501aa81d5751516862.jpg", price: 17000 },
      { id: 7, name: "Rank Mtyhic Glory/Bintang", img: "https://i.pinimg.com/736x/a6/9d/2d/a69d2d368fa13f853cbf1466d64449cf.jpg", price: 20000 },
      {
        id: 8,
        name: "Rank Mythic Immortal/Bintang",
        img: "https://i.pinimg.com/736x/92/a0/9f/92a09f77251f3f8c12fadd66d7462731.jpg",
        price: 25000,
      },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(newItem) {
      let existingItem = this.items.find((item) => item.id === newItem.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        this.items.push({ ...newItem, quantity: 1 });
      }
      this.updateCart();
    },
    increaseQuantity(index) {
      this.items[index].quantity++;
      this.updateCart();
    },
    decreaseQuantity(index) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity--;
      } else {
        this.items.splice(index, 1);
      }
      this.updateCart();
    },
    updateCart() {
      this.total = this.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      this.quantity = this.items.reduce(
        (quantity, item) => quantity + item.quantity,
        0
      );
      console.log(`Total Price: Rp ${this.total.toLocaleString("id-ID")}`);
      console.log(`Total Quantity: ${this.quantity}`);
    },
  });
});
