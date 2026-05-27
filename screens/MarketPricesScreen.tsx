import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { LineChart } from "react-native-chart-kit";
import { useFocusEffect } from "@react-navigation/native";
import Company from "../models/Company";
import { getCompanies } from "../data/companyRoutes";
import {
  demoInsert,
  getMarketPrices,
  insertMarketPrice,
  resetMarketPrices,
} from "../data/marketPriceRoutes";
import { Ionicons } from "@expo/vector-icons";
import MarketPrice from "../models/MarketPrice";
import { EventRegister } from "react-native-event-listeners";

export default function MarketPricesScreen() {
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [companies, setCompanies] = useState<
    { label: string; value: number | null }[]
  >([]);
  const [marketPrice, setMarketPrice] = useState("");
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [selectedUpdateCompany, setSelectedUpdateCompany] = useState<
    number | null
  >(null);

  useFocusEffect(
    useCallback(() => {
      loadCompanies();
      loadMarketPrices();
    }, []),
  );

  useEffect(() => {
    loadMarketPrices();
  }, [selectedCompany]);

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "marketPricesUpdated",
      () => {
        loadMarketPrices();
      },
    );

    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, [selectedCompany]);

  const loadMarketPrices = (): void => {
    if (selectedCompany == null) {
      return;
    }

    const data = getMarketPrices(selectedCompany);

    setMarketPrices(data);
  };

  const loadCompanies = (): void => {
    const data = getCompanies();

    const formatted = data.map((company) => ({
      label: `${company.code} (${company.name})`,
      value: company.id,
    }));

    setCompanies(formatted);

    if (formatted.length > 0) {
      const firstValue = formatted[0].value;

      setSelectedCompany(firstValue);
      setSelectedUpdateCompany(firstValue);
    } else {
      setSelectedCompany(null);
      setSelectedUpdateCompany(null);
    }
  };

  const reset = () => {
    resetMarketPrices();
    loadMarketPrices();
  };

  const handleSave = () => {
    try {
      if (!selectedUpdateCompany) {
        Alert.alert("Invalid Fields", "Please select a company");
        return;
      }

      if (!marketPrice || marketPrice.trim() === "") {
        Alert.alert("Invalid Fields", "Please enter market price");
        return;
      }

      const price = Number(marketPrice);

      if (isNaN(price) || price <= 0) {
        Alert.alert("Invalid Fields", "Enter a valid price greater than 0");
        return;
      }

      insertMarketPrice(selectedUpdateCompany, price);

      setMarketPrice("");

      alert("Market price updated successfully");

      loadMarketPrices();
    } catch (error: any) {
      console.error(error);
      alert(error.message ?? "Failed to update market price");
    }
  };

  const demoSave = () => {
    demoInsert();
    loadMarketPrices();
  };

  const filtered = useMemo(() => {
    if (selectedCompany == null) return [];

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 29);

    const data = marketPrices
      .filter((x) => x.company.id === selectedCompany)
      .filter((x) => {
        const d = x.getDate();
        return d >= startDate && d <= today;
      })
      .sort((a, b) => a.getDate().getTime() - b.getDate().getTime());

    return data;
  }, [marketPrices, selectedCompany]);

  const chartData = useMemo(() => {
    const today = new Date();

    const dates: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const valueMap = new Map(
      filtered.map((x) => [x.getDate().toISOString().split("T")[0], x.price]),
    );

    const values: number[] = [];
    const hiddenDots: number[] = [];

    for (let i = 0; i < dates.length; i++) {
      const key = dates[i];

      if (valueMap.has(key)) {
        values.push(valueMap.get(key)!);
        continue;
      }

      let prevIndex = i - 1;
      while (prevIndex >= 0 && !valueMap.has(dates[prevIndex])) {
        prevIndex--;
      }

      let nextIndex = i + 1;
      while (nextIndex < dates.length && !valueMap.has(dates[nextIndex])) {
        nextIndex++;
      }

      if (prevIndex >= 0 && nextIndex < dates.length) {
        const prevValue = valueMap.get(dates[prevIndex])!;
        const nextValue = valueMap.get(dates[nextIndex])!;

        const ratio = (i - prevIndex) / (nextIndex - prevIndex);
        const interpolated = prevValue + (nextValue - prevValue) * ratio;

        values.push(interpolated);
        hiddenDots.push(i);
      } else {
        values.push(NaN);
        hiddenDots.push(i);
      }
    }

    return {
      labels: dates.map((d) => d.slice(5)),
      // labels: dates.map((d) => d.split("-")[2]),
      values,
      hiddenDots,
    };
  }, [filtered]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* <View style={styles.updateCard}>
          <Text style={styles.updateTitle}>Update Market Price</Text>

          <Dropdown
            data={companies}
            labelField="label"
            valueField="value"
            value={selectedUpdateCompany}
            onChange={(item) => setSelectedUpdateCompany(item.value)}
            style={styles.filterDropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownText}
            iconStyle={styles.dropdownIcon}
            containerStyle={styles.dropdownContainer}
            itemContainerStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
            activeColor="#eaf4ff"
          />

          <View style={styles.updateRow}>
            <TextInput
              style={styles.marketInput}
              placeholder="Market Value"
              keyboardType="decimal-pad"
              value={marketPrice}
              onChangeText={setMarketPrice}
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => handleSave()}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View> */}

        <View style={styles.filterRow}>
          <Dropdown
            data={companies}
            labelField="label"
            valueField="value"
            value={selectedCompany}
            onChange={(item) => setSelectedCompany(item.value)}
            style={[styles.filterDropdown, { width: "100%" }]}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownText}
            iconStyle={styles.dropdownIcon}
            containerStyle={styles.dropdownContainer}
            itemContainerStyle={styles.dropdownItem}
            itemTextStyle={styles.dropdownItemText}
            activeColor="#eaf4ff"
          />
        </View>

        <View style={styles.chartContainer}>
          {!selectedCompany || marketPrices.length === 0 ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#888", fontWeight: "600" }}>
                No market prices found
              </Text>
            </View>
          ) : (
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [{ data: chartData.values }],
              }}
              hidePointsAtIndex={chartData.hiddenDots}
              width={Dimensions.get("window").width - 40}
              height={260}
              formatXLabel={(value) => value}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(9,132,227,${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              bezier={false}
            />
          )}
        </View>
        {/* <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            style={[
              {
                backgroundColor: "#ff5353",
                margin: 10,
                width: 50,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                height: 50,
                padding: 0,
              },
            ]}
            onPress={() => reset()}
          >
            <Ionicons name="trash-bin" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              {
                backgroundColor: "#0ea229",
                margin: 10,
                width: 50,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                height: 50,
                padding: 0,
              },
            ]}
            onPress={() => demoSave()}
          >
            <Ionicons name="add-circle-outline" size={30} color="white" />
          </TouchableOpacity>
        </View> */}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    paddingHorizontal: 10,
    paddingVertical: 20,
  },

  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  chartContainer: {
    paddingTop: 15,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "white",
  },

  chart: {
    borderRadius: 16,
  },

  updateCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  updateTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  updateDropdown: {
    height: 52,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  updateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  marketInput: {
    height: 52,
    width: "50%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginRight: 15,
    backgroundColor: "white",
    textAlign: "center",
  },

  updateButton: {
    backgroundColor: "#1e90ff",
    paddingHorizontal: 30,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    flex: 1,
    alignItems: "center",
  },

  updateButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  filterDropdown: {
    height: 54,
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },

  dropdownPlaceholder: {
    color: "rgb(156, 163, 175)",
    fontSize: 15,
    fontWeight: "600",
  },

  dropdownText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },

  dropdownIcon: {
    width: 20,
    height: 20,
  },

  dropdownContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 5,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  dropdownItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    textAlign: "center",
  },

  dropdownItemText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
});
