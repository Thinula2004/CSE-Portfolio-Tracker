import AppNavigator from "./navigation/AppNavigator";
import { useEffect } from "react";
import { AppState } from "react-native";

import { initDatabase } from "./data/init";
import { updateCurrentMarketPrices } from "./data/marketPriceRoutes";

export default function App() {
  useEffect(() => {
    let dbReady = false;

    const initialize = async () => {
      try {
        await initDatabase();
        dbReady = true;

        await updateCurrentMarketPrices();
      } catch (e) {
        console.log("Initialization failed", e);
      }
    };

    initialize();

    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState === "active" && dbReady) {
          try {
            await updateCurrentMarketPrices();
          } catch (e) {
            console.log("Market update failed", e);
          }
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return <AppNavigator />;
}
