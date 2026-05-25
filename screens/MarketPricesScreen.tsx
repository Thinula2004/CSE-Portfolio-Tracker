import React, { useMemo, useState } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { LineChart } from "react-native-chart-kit";

type MarketPrice = {
  code: string;
  price: number;
  date: string;
  time: string;
};

const sampleData: MarketPrice[] = [
  { code: "JKH", price: 220, date: "2026-05-21", time: "09:00:00" },
  { code: "JKH", price: 223, date: "2026-05-22", time: "09:00:00" },
  { code: "JKH", price: 228, date: "2026-05-24", time: "10:00:00" },
  { code: "JKH", price: 210, date: "2026-05-25", time: "09:00:00" },

  { code: "DIAL", price: 15.2, date: "2026-05-19", time: "09:00:00" },
  { code: "DIAL", price: 15.4, date: "2026-05-20", time: "09:00:00" },
  { code: "DIAL", price: 15.1, date: "2026-05-21", time: "09:00:00" },
  { code: "DIAL", price: 15.8, date: "2026-05-22", time: "09:00:00" },
  { code: "DIAL", price: 16.0, date: "2026-05-23", time: "09:00:00" },
];

export default function MarketPricesScreen() {
  const [selectedCompany, setSelectedCompany] = useState("JKH");
  const [selectedRange, setSelectedRange] = useState("month");

  const companyOptions = [
    { label: "JKH", value: "JKH" },
    { label: "DIAL", value: "DIAL" },
  ];

  const rangeOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "This Month", value: "month" },
  ];

  const filtered = useMemo(() => {
    const today = new Date();

    const startDate = new Date();
    startDate.setDate(today.getDate() - 29);

    const data = sampleData.filter(
      (x) =>
        x.code === selectedCompany &&
        new Date(x.date) >= startDate &&
        new Date(x.date) <= today,
    );

    const latestPerDay = new Map<string, MarketPrice>();

    data.forEach((record) => {
      const existing = latestPerDay.get(record.date);

      if (!existing || record.time > existing.time) {
        latestPerDay.set(record.date, record);
      }
    });

    return Array.from(latestPerDay.values()).sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
    );
  }, [selectedCompany]);

  const chartData = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const valueMap = new Map(filtered.map((x) => [x.date, x.price]));

    const values: number[] = [];
    const hiddenDots: number[] = [];

    for (let i = 0; i < dates.length; i++) {
      const currentDate = dates[i];

      if (valueMap.has(currentDate)) {
        values.push(valueMap.get(currentDate)!);
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
      values,
      hiddenDots,
    };
  }, [filtered]);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Dropdown
          style={styles.dropdown}
          data={companyOptions}
          labelField="label"
          valueField="value"
          value={selectedCompany}
          onChange={(item) => setSelectedCompany(item.value)}
        />

        <Dropdown
          style={styles.dropdown}
          data={rangeOptions}
          labelField="label"
          valueField="value"
          value={selectedRange}
          onChange={(item) => setSelectedRange(item.value)}
        />
      </View>

      <View style={styles.chartContainer}>
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
          horizontalLabelRotation={0}
          verticalLabelRotation={0}
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
      </View>
    </View>
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
    marginBottom: 20,
  },

  dropdown: {
    flex: 1,
    height: 48,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
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
});
