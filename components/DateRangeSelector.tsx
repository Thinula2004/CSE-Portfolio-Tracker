import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  startDate: string | null;
  endDate: string | null;
  setStartDate: React.Dispatch<React.SetStateAction<string | null>>;
  setEndDate: React.Dispatch<React.SetStateAction<string | null>>;
};

type MarkedDates = {
  [key: string]: {
    startingDay?: boolean;
    endingDay?: boolean;
    color: string;
    textColor: string;
  };
};

export default function DateRangeSelector({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: Props) {
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (date: string) => {
    const d = new Date(date);

    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate(),
    ).padStart(2, "0")}.${d.getFullYear()}`;
  };

  const resetDates = () => {
    setStartDate(null);
    setEndDate(null);
    setShowCalendar(false);
  };

  const handleDayPress = (day: DateData) => {
    const selected = day.dateString;

    if (!startDate || endDate) {
      setStartDate(selected);
      setEndDate(null);
      return;
    }

    if (selected < startDate) {
      setStartDate(selected);
      return;
    }

    setEndDate(selected);
    setShowCalendar(false);
  };

  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};

    if (startDate) {
      marked[startDate] = {
        startingDay: true,
        color: "#0984e3",
        textColor: "white",
      };
    }

    if (startDate && endDate) {
      marked[endDate] = {
        endingDay: true,
        color: "#0984e3",
        textColor: "white",
      };

      const current = new Date(startDate);

      while (current.toISOString().split("T")[0] < endDate) {
        const d = current.toISOString().split("T")[0];

        if (d !== startDate) {
          marked[d] = {
            color: "#d6eaff",
            textColor: "black",
          };
        }

        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  const getDisplayText = () => {
    if (!startDate) {
      return "Select Date Range";
    }

    if (!endDate) {
      return formatDate(startDate);
    }

    return `${formatDate(startDate)}  -  ${formatDate(endDate)}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowCalendar(!showCalendar)}
      >
        <Text style={[styles.text, !startDate && styles.placeholder]}>
          {getDisplayText()}
        </Text>

        {startDate && (
          <TouchableOpacity onPress={resetDates}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {showCalendar && (
        <View style={styles.calendarOverlay}>
          <Calendar
            style={styles.calendar}
            headerStyle={styles.calendarHeader}
            markingType="period"
            markedDates={getMarkedDates()}
            onDayPress={handleDayPress}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },

  input: {
    height: 48,
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  placeholder: {
    color: "rgb(156, 163, 175)",
  },

  calendarOverlay: {
    borderWidth: 1.5,
    borderColor: "#b0b0b0",
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: "white",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 8,
  },

  calendar: {},

  calendarHeader: {},
});
