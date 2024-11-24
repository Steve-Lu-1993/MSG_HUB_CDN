// Function to initialize the button event listener
function initializeButtonListener() {
    const button = document.getElementById("__test__switchChatModeButton");
    if (button) {
        button.addEventListener("click", async function () {
            // Get the button's text content
            var buttonText = this.textContent || this.innerText;

            // Check for the token in LocalStorage
            let token = localStorage.getItem("line_chat_tk");
            if (!token) {
                // Prompt user for the token if not available
                token = prompt("Enter your authorization token:");
                if (token) {
                    localStorage.setItem("line_chat_tk", token);
                } else {
                    console.warn("Authorization token is required.");
                    return;
                }
            }

            // Get the channel name from div with class "account-name"
            var accountNameElement = document.querySelector("div.account-name");
            var channelName = accountNameElement
                ? accountNameElement.textContent || accountNameElement.innerText
                : "Unknown Channel";

            // Get the customer name from #content-secondary h4
            var customerNameElement = document.querySelector("#content-secondary h4");
            var customerName = customerNameElement
                ? customerNameElement.textContent || customerNameElement.innerText
                : "Unknown Customer";

            // Determine action based on button text content
            var payload = {
                action: "",
                channel_name: channelName,
                customer_name: customerName,
            };

            if (buttonText === "使用手動聊天") {
                payload.action = "enable_manual_chat";
            } else if (buttonText === "結束手動聊天") {
                payload.action = "disable_manual_chat";
            } else {
                console.warn("Button text does not match expected values");
                return;
            }

            // Send payload to API via POST with Authorization Token
            try {
                const MSG_HUB_BASE_URL =
                    "https://9a15-36-225-228-5.ngrok-free.app/hub/api"; // Replace with the actual base URL
                const endpoint = `${MSG_HUB_BASE_URL}/channelEndUser/updateStatusFromLine`;

                const response = await fetch(endpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                const res = await response.json();

                // Show toast based on response
                if (response.ok && res.status === 1) {
                    const successMessage =
                        payload.action === "enable_manual_chat"
                            ? "Intellicon AI Chat App 已調整為：手動"
                            : "Intellicon AI Chat App 已調整為：自動";
                    showToast(successMessage, true);
                } else {
                    const errorMessage = `Intellicon AI Chat App狀態調整失敗：${res.message}`;
                    showToast(errorMessage, false);
                }
            } catch (error) {
                console.error("Error while sending data to the API:", error);
                showToast("Intellicon AI Chat App狀態調整失敗：網絡錯誤", false);
            }
        });
    }
}

// Use MutationObserver to monitor changes in the DOM
const observer = new MutationObserver(() => {
    const button = document.getElementById("__test__switchChatModeButton");
    if (button) {
        initializeButtonListener();
        observer.disconnect(); // Stop observing once the button is found and initialized
    }
});

// Start observing the DOM
observer.observe(document.body, { childList: true, subtree: true });

// Function to show a toast message
function showToast(message, isSuccess) {
    // Create toast container if it doesn't exist
    if (!document.getElementById("toast-container")) {
        const container = document.createElement("div");
        container.id = "toast-container";
        container.style.position = "fixed";
        container.style.top = "20px";
        container.style.right = "20px";
        container.style.zIndex = "1000";
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.background = isSuccess ? "#d4edda" : "#f8d7da"; // Light green for success, light red for failure
    toast.style.color = isSuccess ? "#155724" : "#721c24"; // Dark green for success, dark red for failure
    toast.style.padding = "10px 15px";
    toast.style.marginBottom = "10px";
    toast.style.border = "1px solid";
    toast.style.borderColor = isSuccess ? "#c3e6cb" : "#f5c6cb";
    toast.style.borderRadius = "5px";
    toast.style.fontSize = "14px";
    toast.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    toast.style.opacity = "0.9";
    toast.style.transition = "opacity 0.3s ease";

    // Append to the container
    const container = document.getElementById("toast-container");
    container.appendChild(toast);

    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => container.removeChild(toast), 300); // Allow transition to complete before removing
    }, 5000);
}
