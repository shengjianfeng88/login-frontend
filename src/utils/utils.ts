export const sendDataToExtension = (userData: {
  email: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
}) => {
  console.log('Sending data to extension');

  if (window.chrome?.runtime) {
    window.chrome.runtime.sendMessage(
      "lhlifmnncceikipmjamgeacngkkghhmm",
      { action: "saveAuthData", userData },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log('Extension communication error:', chrome.runtime.lastError.message);
          return;
        }
        console.log("Response from extension:", response);
      }
    );
  } else {
    console.log("Chrome extension API not available");
  }
};

export const sendMessageToExtension = (userData: {
  email: string;
  picture?: string;
  accessToken: string;
}) => {
  // Send a message to the content script
  window.postMessage({ type: "FROM_PAGE", payload: userData }, "*");

  // Listen for messages from the extension
  window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "FROM_EXTENSION") {
      console.log("Web page received from extension:", event.data.payload);
    }
  });

};

