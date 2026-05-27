import { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import AddTransactionModal from "../components/AddTransactionModel";
import Summary from "../models/Summary";
import { getSummery } from "../data/commonRoutes";
import { EventRegister } from "react-native-event-listeners";

export default function DashboardScreen() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;
  const navigation = useNavigation<NavigationProp>();

  const loadSummary = () => {
    const data = getSummery();
    setSummary(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, []),
  );

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "marketPricesUpdated",
      loadSummary,
    );

    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  const gl = summary?.getGL() ?? 0;
  const glPercent = summary?.getGLPercentage() ?? 0;
  const isProfit = gl >= 0;

  const fmt = (val: number, decimals: number = 2) =>
    `Rs. ${Math.abs(val).toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Overview</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Investment</Text>
              <Text style={styles.summaryValue}>
                {summary ? fmt(summary.totalInv) : "—"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Market Value</Text>
              <Text style={styles.summaryValue}>
                {summary ? fmt(summary.marketVal) : "—"}
              </Text>
            </View>

            <View style={styles.divider} />

            <Text
              style={[
                styles.glText,
                { color: isProfit ? "#16a34a" : "#e53e3e" },
              ]}
            >
              {isProfit ? "+ " : "- "}
              {summary ? fmt(gl) : "—"}
            </Text>
            <Text
              style={[
                styles.glPercent,
                { color: isProfit ? "#16a34a" : "#e53e3e" },
              ]}
            >
              {isProfit ? "+" : "-"}
              {summary ? Math.abs(glPercent).toFixed(2) : "0.00"}%
            </Text>
          </View>

          <View style={styles.smallCardsRow}>
            <View style={styles.smallCard}>
              <Text style={styles.smallCardTitle}>Realized Gains</Text>
              <Text
                style={[
                  styles.smallCardValue,
                  {
                    color:
                      (summary?.realizedGains ?? 0) >= 0
                        ? "#16a34a"
                        : "#e53e3e",
                  },
                ]}
              >
                {summary ? fmt(Math.round(summary.realizedGains), 0) : "—"}
              </Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallCardTitle}>Dividends</Text>
              <Text style={styles.smallCardValue}>
                {summary ? fmt(Math.round(summary.dividends), 0) : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.holdingsCard}>
            <Text style={styles.smallCardTitle}>Active Holdings</Text>
            <Text style={styles.holdingsValue}>
              {summary ? `${summary.companyCount} Companies` : "—"}
            </Text>
          </View>

          <View style={styles.cardsRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Transactions")}
              style={styles.cardButton}
            >
              <View
                style={[styles.cardIconWrapper, { backgroundColor: "#e8fdf1" }]}
              >
                <Ionicons name="cash" size={22} color="#07bb31" />
              </View>
              <View>
                <Text style={styles.cardText}>Transactions</Text>
                <Text style={styles.cardSubText}>View history</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Stocks")}
              style={styles.cardButton}
            >
              <View
                style={[styles.cardIconWrapper, { backgroundColor: "#fff0f0" }]}
              >
                <Ionicons name="bar-chart" size={22} color="#ff5050" />
              </View>
              <View>
                <Text style={styles.cardText}>Stocks</Text>
                <Text style={styles.cardSubText}>View holdings</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowTransactionModal(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <AddTransactionModal
        visible={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          loadSummary();
        }}
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
    gap: 10,
  },

  fab: {
    position: "absolute",
    bottom: 10,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#0984e3",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 5 },
    }),
  },

  summaryCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 25,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  summaryTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 25,
    color: "#111827",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  summaryLabel: {
    fontSize: 16,
    color: "#6b7280",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 5,
    marginBottom: 15,
  },

  glText: {
    fontSize: 28,
    fontWeight: "800",
  },

  glPercent: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "600",
  },

  smallCardsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  smallCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  smallCardTitle: {
    fontSize: 15,
    color: "#6b7280",
    marginBottom: 15,
  },

  smallCardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  holdingsCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  holdingsValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  cardsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },

  cardButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
    padding: 16,
    alignItems: "flex-start",
    justifyContent: "space-between",
    minHeight: 130,
  },

  cardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  cardText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  cardSubText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
});
