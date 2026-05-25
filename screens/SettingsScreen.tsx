import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
  DevSettings,
} from "react-native";
import { resetDatabase } from "../data/commonRoutes";
import * as Updates from "expo-updates";

export default function SettingsScreen() {
  const resetDB = () => {
    Alert.alert(
      "Reset Application",
      "Are you sure you want to delete all data?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            resetDatabase();
            setTimeout(async () => {
              DevSettings.reload();
              await Updates.reloadAsync();
            }, 500);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.resetBtn} onPress={() => resetDB()}>
        <Text style={styles.resetBtnTxt}>Reset Application</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    padding: 20,
  },

  resetBtn: {
    borderRadius: 10,
    backgroundColor: "#ff5050",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  resetBtnTxt: {
    color: "white",
    fontWeight: "600",
    fontSize: 20,
  },
});
