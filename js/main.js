// ---------- Состояние корзины ----------
// Загружаем из localStorage, если есть. Иначе — пустой массив.
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ---------- Ссылки на DOM ----------
const productsList = document.querySelector(".products__wrap");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

// ---------- Email продавца ----------
const SELLER_EMAIL = "tomilovaylija260596@mail.ru";

// ---------- SVG иконки корзины ----------
const CART_ICON = `
  <svg class="icon-cart" viewBox="0 0 1024 1024" aria-hidden="true">
    <path
      fill="currentColor"
      d="M1015.66 284a31.82 31.82 0 0 0-25.998-13.502H310.526l-51.408-177.28c-20.16-69.808-68.065-77.344-87.713-77.344H34.333c-17.569 0-31.777 14.224-31.777 31.776S16.78 79.425 34.332 79.425h137.056c4.336 0 17.568 0 26.593 31.184l176.848 649.936c3.84 13.712 16.336 23.183 30.591 23.183h431.968c13.409 0 25.376-8.4 29.905-21.024l152.256-449.68c3.504-9.744 2.048-20.592-3.888-29.024zM815.026 720.194H429.539L328.387 334.066h616.096zM752.003 848.13c-44.192 0-80 35.808-80 80s35.808 80 80 80 80-35.808 80-80-35.808-80-80-80zm-288 0c-44.192 0-80 35.808-80 80s35.808 80 80 80 80-35.808 80-80-35.808-80-80-80z"
    />
  </svg>
`;

// ---------- Сохранение корзины ----------
function saveCart() {
  if (cart.length === 0) {
    localStorage.removeItem("cart");
  } else {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
}

// ---------- Отрисовка товаров ----------
function renderProducts() {
  productsList.innerHTML = "";

  PRODUCTS.forEach((product) => {
    const li = document.createElement("li");
    li.className = "products__item";
    li.innerHTML = `
      <img
        class="products__item-img"
        src="${product.image}"
        alt="${product.alt}"
        loading="lazy"
      />
      <div class="products__item-description">
        <h3 class="products__name">${product.name}</h3>
        <div class="products__price"><span>${product.price}</span> ₽</div>
        <button
          class="products__cart"
          data-id="${product.id}"
          aria-label="Добавить «${product.name}» в корзину"
        >
          ${CART_ICON}
        </button>
      </div>
    `;
    productsList.appendChild(li);
  });
}

// ---------- Добавление товара в корзину ----------
productsList.addEventListener("click", (e) => {
  const btn = e.target.closest(".products__cart");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;

  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
    });
  }

  renderCart();
});

// ---------- Отрисовка корзины ----------
function renderCart() {
  cartList.innerHTML = "";

  // Пустая корзина
  if (cart.length === 0) {
    cartList.innerHTML = '<li class="cart__empty">Корзина пуста</li>';
    cartTotal.textContent = "0";
    saveCart();
    updateCheckoutButton();
    return;
  }

  // Позиции
  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart__positions-item";

    const sum = item.price * item.qty;

    li.innerHTML = `
      <div class="cart__position-name">${item.name}</div>
      <div class="cart__position-wrap">
        <div class="counter">
          <button
            type="button"
            class="counter__btn counter__btn--minus"
            data-action="minus"
            data-index="${index}"
            aria-label="Уменьшить"
          >−</button>
          <input
            type="text"
            class="counter__input"
            value="${item.qty}"
            inputmode="numeric"
            pattern="[0-9]*"
            data-index="${index}"
            aria-label="Количество"
          />
          <button
            type="button"
            class="counter__btn counter__btn--plus"
            data-action="plus"
            data-index="${index}"
            aria-label="Увеличить"
          >+</button>
        </div>
        <div class="cart__position-sum"><span>${sum}</span> ₽</div>
      </div>
    `;

    cartList.appendChild(li);
  });

  // Общая сумма
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  cartTotal.textContent = total;

  // Сохранить и обновить кнопку
  saveCart();
  updateCheckoutButton();
}

// ---------- Обработка +/− ----------
cartList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const index = Number(btn.dataset.index);
  const action = btn.dataset.action;

  if (action === "plus") {
    cart[index].qty += 1;
  } else if (action === "minus") {
    cart[index].qty -= 1;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
  }

  renderCart();
});

// ---------- Ручной ввод количества ----------
cartList.addEventListener("change", (e) => {
  const input = e.target.closest(".counter__input");
  if (!input) return;

  const index = Number(input.dataset.index);
  let value = parseInt(input.value, 10);

  if (isNaN(value) || value < 1) value = 1;

  cart[index].qty = value;
  renderCart();
});

// ---------- Кнопка «Оформить заказ» ----------
function updateCheckoutButton() {
  if (!checkoutBtn) return;
  checkoutBtn.disabled = cart.length === 0;
}

function checkout() {
  if (cart.length === 0) {
    alert("Корзина пуста. Добавьте товары перед оформлением.");
    return;
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Текст письма
  const lines = ["Здравствуйте!", "", "Хочу оформить заказ:", ""];
  cart.forEach((item) => {
    const sum = item.price * item.qty;
    lines.push(`• ${item.name} — ${item.qty} шт. × ${item.price} ₽ = ${sum} ₽`);
  });
  lines.push("", `Итого: ${total} ₽`, "");
  lines.push("Свяжитесь со мной, пожалуйста, для уточнения доставки. Мой номер телефона: ");

  const subject = "Заказ с сайта «Только раз в году»";
  const body = lines.join("\n");

  window.location.href =
    `mailto:${SELLER_EMAIL}` + `?subject=${encodeURIComponent(subject)}` + `&body=${encodeURIComponent(body)}`;
}

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", checkout);
}

// ---------- Старт ----------
renderProducts();
renderCart();
