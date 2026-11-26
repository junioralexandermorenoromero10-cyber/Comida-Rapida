const CONFIG = {
  businessName: "La Esquina Burger",
  tagline: "Hamburguesas brutales, ingredientes frescos y ese sabor que siempre provoca.",
  whatsapp: "573134510500",
  deliveryPromise: "Domicilios en 30 min",
  hours: "Hoy · 12:00 m – 10:00 p. m.",
  address: "Cra. 7 # 45-18, Bogotá",
  products: [
    {
      id: "clasica",
      name: "La Clásica",
      category: "Hamburguesas",
      description: "Carne a la parrilla, queso cheddar, lechuga y salsa de la casa.",
      price: 18000,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=82"
    },
    {
      id: "doble-queso",
      name: "Doble Queso",
      category: "Hamburguesas",
      description: "Doble carne, doble cheddar, cebolla caramelizada y pan brioche.",
      price: 24000,
      image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=900&q=82"
    },
    {
      id: "perro-especial",
      name: "Perro Especial",
      category: "Perros Calientes",
      description: "Salchicha premium, tocineta crocante, ripio y salsas de la casa.",
      price: 17000,
      image: "https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&w=900&q=82"
    },
    {
      id: "salchipapa",
      name: "Salchipapa de la Casa",
      category: "Salchipapas",
      description: "Papas doradas, salchicha, queso fundido y salsa rosada.",
      price: 22000,
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=82"
    },
    {
      id: "papas-tocineta",
      name: "Papas con Tocineta",
      category: "Salchipapas",
      description: "Papas crocantes, tocineta, queso cheddar y cebollín fresco.",
      price: 16000,
      image: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=900&q=82"
    },
    {
      id: "limonada",
      name: "Limonada de Coco",
      category: "Bebidas",
      description: "Cremosa, refrescante y preparada con limón natural.",
      price: 9000,
      image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=82"
    }
  ]
};

const CATEGORIES = ["Todos", "Hamburguesas", "Perros Calientes", "Salchipapas", "Bebidas"];
const cart = new Map();
const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0
});

const productGrid = document.querySelector("#product-grid");
const categoryList = document.querySelector("#category-list");
const cartBar = document.querySelector("#cart-bar");
const backdrop = document.querySelector("#cart-backdrop");
const cartModal = document.querySelector("#cart-modal");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const checkoutForm = document.querySelector("#checkout-form");
const customerName = document.querySelector("#customer-name");
const customerAddress = document.querySelector("#customer-address");
const deliveryType = document.querySelector("#delivery-type");
const addressField = document.querySelector("#address-field");
const formError = document.querySelector("#form-error");
let activeCategory = "Todos";
let previouslyFocusedElement = null;

function formatPrice(value) {
  return currency.format(value).replace(/\u00a0/g, "");
}

function renderBusinessInfo() {
  document.querySelectorAll("[data-business-name]").forEach((element) => {
    const words = CONFIG.businessName.trim().split(/\s+/);
    const emphasizedWord = words.pop();
    element.replaceChildren(document.createTextNode(`${words.join(" ")} `));
    const accent = document.createElement("span");
    accent.textContent = emphasizedWord;
    element.append(accent);
  });
  document.querySelector("[data-tagline]").textContent = CONFIG.tagline;
  document.querySelector("[data-delivery-promise]").textContent = CONFIG.deliveryPromise;
  document.querySelector("[data-hours]").textContent = CONFIG.hours;
  document.querySelector("[data-address]").textContent = CONFIG.address;
  document.title = `Menú digital | ${CONFIG.businessName}`;
}

function renderCategories() {
  categoryList.replaceChildren();
  CATEGORIES.forEach((category) => {
    const button = document.createElement("button");
    button.className = "category-button";
    button.type = "button";
    button.textContent = category;
    button.setAttribute("aria-pressed", String(category === activeCategory));
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderProducts();
    });
    categoryList.append(button);
  });
}

function createProductCard(product, index) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.style.animationDelay = `${Math.min(index, 6) * 35}ms`;

  const imageWrap = document.createElement("div");
  imageWrap.className = "product-image-wrap";
  const image = document.createElement("img");
  image.className = "product-image";
  image.src = product.image;
  image.alt = product.name;
  image.loading = "lazy";
  image.decoding = "async";
  imageWrap.append(image);

  const category = document.createElement("span");
  category.className = "product-category";
  category.textContent = product.category;
  imageWrap.append(category);

  const info = document.createElement("div");
  info.className = "product-info";
  const title = document.createElement("h3");
  title.textContent = product.name;
  const description = document.createElement("p");
  description.className = "product-description";
  description.textContent = product.description;
  const buyRow = document.createElement("div");
  buyRow.className = "product-buy-row";
  const price = document.createElement("span");
  price.className = "product-price";
  price.textContent = formatPrice(product.price);
  const addButton = document.createElement("button");
  addButton.className = "add-button";
  addButton.type = "button";
  addButton.setAttribute("aria-label", `Agregar ${product.name} al pedido`);
  addButton.innerHTML = "<span aria-hidden=\"true\">+</span> Agregar";
  addButton.addEventListener("click", () => changeQuantity(product.id, 1));

  buyRow.append(price, addButton);
  info.append(title, description, buyRow);
  card.append(imageWrap, info);
  return card;
}

function renderProducts() {
  productGrid.replaceChildren();
  const visibleProducts = CONFIG.products.filter((product) => (
    activeCategory === "Todos" || product.category === activeCategory
  ));
  visibleProducts.forEach((product, index) => {
    productGrid.append(createProductCard(product, index));
  });
}

function getCartCount() {
  return Array.from(cart.values()).reduce((total, quantity) => total + quantity, 0);
}

function getCartTotal() {
  return CONFIG.products.reduce((total, product) => (
    total + product.price * (cart.get(product.id) || 0)
  ), 0);
}

function changeQuantity(productId, change) {
  const nextQuantity = (cart.get(productId) || 0) + change;
  if (nextQuantity <= 0) {
    cart.delete(productId);
  } else {
    cart.set(productId, nextQuantity);
  }
  renderCart();
}

function renderCart() {
  const count = getCartCount();
  const total = getCartTotal();
  cartBar.hidden = count === 0;
  document.querySelector("#cart-count").textContent = `${count} ${count === 1 ? "producto" : "productos"}`;
  document.querySelector("#cart-total").textContent = formatPrice(total);
  document.querySelector("#modal-total").textContent = formatPrice(total);
  cartItems.replaceChildren();

  CONFIG.products.forEach((product) => {
    const quantity = cart.get(product.id);
    if (!quantity) return;

    const row = document.createElement("div");
    row.className = "cart-item";
    const image = document.createElement("img");
    image.className = "cart-item-image";
    image.src = product.image;
    image.alt = "";
    image.loading = "lazy";
    const details = document.createElement("div");
    details.className = "cart-item-details";
    const name = document.createElement("strong");
    name.textContent = product.name;
    const subtotal = document.createElement("span");
    subtotal.textContent = formatPrice(product.price * quantity);
    details.append(name, subtotal);

    const control = document.createElement("div");
    control.className = "quantity-control";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Quitar una unidad de ${product.name}`);
    decrease.addEventListener("click", () => changeQuantity(product.id, -1));
    const countLabel = document.createElement("span");
    countLabel.textContent = quantity;
    const increase = document.createElement("button");
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Agregar una unidad de ${product.name}`);
    increase.addEventListener("click", () => changeQuantity(product.id, 1));
    control.append(decrease, countLabel, increase);
    row.append(image, details, control);
    cartItems.append(row);
  });

  const isEmpty = count === 0;
  cartItems.hidden = isEmpty;
  cartEmpty.hidden = !isEmpty;
  checkoutForm.hidden = isEmpty;
}

function openCart() {
  if (getCartCount() === 0) return;
  previouslyFocusedElement = document.activeElement;
  backdrop.hidden = false;
  document.body.classList.add("modal-open");
  formError.hidden = true;
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  backdrop.hidden = true;
  document.body.classList.remove("modal-open");
  if (previouslyFocusedElement instanceof HTMLElement) previouslyFocusedElement.focus();
}

function updateDeliveryFields() {
  const isDelivery = deliveryType.value === "delivery";
  addressField.hidden = !isDelivery;
  customerAddress.required = isDelivery;
  customerAddress.setAttribute("aria-invalid", "false");
}

function sendOrder(event) {
  event.preventDefault();
  formError.hidden = true;
  customerName.removeAttribute("aria-invalid");
  customerAddress.removeAttribute("aria-invalid");

  const name = customerName.value.trim();
  const isDelivery = deliveryType.value === "delivery";
  const address = customerAddress.value.trim();
  if (getCartCount() === 0) return;
  if (!name) {
    formError.textContent = "Escribe tu nombre para continuar.";
    formError.hidden = false;
    customerName.setAttribute("aria-invalid", "true");
    customerName.focus();
    return;
  }
  if (isDelivery && !address) {
    formError.textContent = "Escribe la dirección donde recibes el pedido.";
    formError.hidden = false;
    customerAddress.setAttribute("aria-invalid", "true");
    customerAddress.focus();
    return;
  }

  const lines = CONFIG.products
    .filter((product) => cart.has(product.id))
    .map((product) => `• ${product.name} x${cart.get(product.id)} — ${formatPrice(product.price * cart.get(product.id))}`);
  const deliveryDetails = isDelivery ? address : "Recoger en el local";
  const message = [
    `¡Hola! Quiero hacer un pedido en ${CONFIG.businessName}:`,
    "",
    ...lines,
    "",
    `Total: ${formatPrice(getCartTotal())}`,
    `Nombre: ${name}`,
    `Entrega: ${deliveryDetails}`
  ].join("\n");
  const whatsappUrl = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

renderBusinessInfo();
renderCategories();
renderProducts();
renderCart();
updateDeliveryFields();

cartBar.addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#back-to-menu").addEventListener("click", closeCart);
deliveryType.addEventListener("change", updateDeliveryFields);
checkoutForm.addEventListener("submit", sendOrder);
backdrop.addEventListener("click", (event) => {
  if (event.target === backdrop) closeCart();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !backdrop.hidden) closeCart();
});
