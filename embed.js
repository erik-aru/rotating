const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: "https://YOUR_USERNAME.github.io/YOUR_REPO/"
  },
  cache: { cacheLocation: "localStorage" }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);
const loginRequest = {
  scopes: ["https://analysis.windows.net/powerbi/api/.default"]
};

async function getAccessToken() {
  try {
    const account = msalInstance.getActiveAccount() || (await msalInstance.loginPopup(loginRequest)).account;
    msalInstance.setActiveAccount(account);
    const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
    return tokenResponse.accessToken;
  } catch (error) {
    console.warn("Silent token acquisition failed, falling back to popup:", error);
    const tokenResponse = await msalInstance.acquireTokenPopup(loginRequest);
    return tokenResponse.accessToken;
  }
}

async function signInAndEmbed() {
  try {
    const embedReport = async () => {
      const accessToken = await getAccessToken();
      const embedConfig = {
        type: 'report',
        id: "0c4d53af-d7b5-40b5-89bd-5ec88136a974",
        embedUrl: "https://app.powerbi.com/reportEmbed?reportId=0c4d53af-d7b5-40b5-89bd-5ec88136a974&autoAuth=true&ctid=8f31395c-0b8b-42b4-a967-7f095fd45176",
        accessToken: accessToken,
        tokenType: powerbi.models.TokenType.Aad,
        settings: {
          filterPaneEnabled: false,
          navContentPaneEnabled: true
        }
      };

      const reportContainer = document.getElementById("reportContainer");
      const report = powerbi.embed(reportContainer, embedConfig);

      report.on("error", async (event) => {
        console.error("Power BI error:", event.detail);
        if (event.detail.message.includes("TokenExpired")) {
          const newToken = await getAccessToken();
          report.setAccessToken(newToken);
        }
      });

      setInterval(async () => {
        const newToken = await getAccessToken();
        report.setAccessToken(newToken);
      }, 55 * 60 * 1000);
    };

    await embedReport();
    startSwitching();
  } catch (err) {
    console.error("Authentication or embedding failed:", err);
  }
}

function startSwitching() {
  const reportContainer = document.getElementById("reportContainer");
  const videoContainer = document.getElementById("videoContainer");
  const video = document.getElementById("video");
  let showVideo = false;

  reportContainer.style.display = "block";

  setInterval(async () => {
    showVideo = !showVideo;
    reportContainer.style.display = showVideo ? "none" : "block";
    videoContainer.style.display = showVideo ? "block" : "none";

    if (showVideo) {
      try {
        await video.play();
      } catch (err) {
        console.warn("Video playback failed:", err);
      }
      const report = powerbi.get(reportContainer | null);
      if (report) report.iframe.contentWindow.postMessage({ action: "pause" }, "*");
    } else {
      const report = powerbi.get(reportContainer | null);
      if (report) report.iframe.contentWindow.postMessage({ action: "resume" }, "*");
    }
  }, 60000);
}

signInAndEmbed();
