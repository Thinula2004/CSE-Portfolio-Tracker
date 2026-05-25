import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import AddTransactionModal from "../components/AddTransactionModel";

export default function DashboardScreen() {
  const [showMenu, setShowMenu] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Transactions")}
        style={styles.navigateBtn}
      >
        <Text> Transactions </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Stocks")}
        style={styles.navigateBtn}
      >
        <Text> Stocks </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowTransactionModal(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
      <AddTransactionModal
        visible={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f6fa",
    padding: 20,
    justifyContent: "center",
    gap: 20,
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0984e3",
    justifyContent: "center",
    alignItems: "center",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  menu: {
    position: "absolute",
    bottom: 90,
    right: 30,
    gap: 5,
  },

  menuButton: {
    backgroundColor: "#0984e3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    elevation: 4,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  menuText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },

  navigateBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
