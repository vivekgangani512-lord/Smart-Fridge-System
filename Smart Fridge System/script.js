let items = [
    { name: "Milk", date: "2026-03-25", category: "Dairy" },
    { name: "Salmon", date: "2026-03-17", category: "Protein" },
    { name: "Strawberries", date: "2026-03-19", category: "Fruits" }
];

/* Expiry check */
function getStatus(date) {
    let today = new Date();
    let exp = new Date(date);
    let diff = (exp - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "expired";
    if (diff < 3) return "soon";
    return "fresh";
}

/* Render UI */
function render() {
    let inv = document.getElementById("inventory");
    let alerts = document.getElementById("alerts");

    inv.innerHTML = "";
    alerts.innerHTML = "";

    items.forEach(item => {
        let status = getStatus(item.date);

        let card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <strong>${item.name}</strong><br>
      ${item.category}<br>
      <span class="${status}">${status}</span>
    `;
        inv.appendChild(card);

        if (status !== "fresh") {
            let alert = document.createElement("div");
            alert.className = "card";
            alert.innerHTML = `${item.name} is <span class="${status}">${status}</span>`;
            alerts.appendChild(alert);
        }
    });
}

/* Add item */
function addItem() {
    let name = document.getElementById("name").value;
    let date = document.getElementById("date").value;
    let category = document.getElementById("category").value;

    if (!name || !date) {
        alert("Fill all fields");
        return;
    }

    items.push({ name, date, category });
    render();
}

/* Scanner */
function startScanner() {
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 15,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.7
        },
        (decodedText) => {
            document.getElementById("scan-result").innerText =
                "Scanned: " + decodedText;

            fetchProduct(decodedText);
            html5QrCode.stop();
        },
        (err) => { }
    );
}

/* Manual barcode */
function manualBarcode() {
    let code = document.getElementById("barcodeInput").value;
    if (code) fetchProduct(code);
}

/* Fetch product */
async function fetchProduct(barcode) {
    try {
        let res = await fetch(
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
        );
        let data = await res.json();

        if (data.product) {
            document.getElementById("name").value =
                data.product.product_name || "Unknown Item";

            document.getElementById("category").value =
                data.product.categories_tags?.[0] || "Food";
        } else {
            document.getElementById("name").value = "Custom Item";
        }
    } catch (err) {
        console.log(err);
    }
}

render();