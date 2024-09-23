import { useUser } from "@clerk/clerk-expo"; // Assuming you're using Clerk for user authentication
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

const Pay = () => {
  const { user } = useUser(); // Fetch the user from Clerk
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const email = user?.emailAddresses?.[0]?.emailAddress || "";

  // Function to fetch reports from backend using Axios
  const fetchReports = async (email) => {
    try {
      const response = await axios.post(
        "http://x.x.x.x:5000/findFinesByEmail",
        {
          email, // Email from the Clerk user
        }
      );
      if (response.data.message === "No fines found for this email") {
        return [];
      }
      return response.data; // This should contain the array of reports
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Failed to load reports");
      return [];
    }
  };

  // Helper function to format date as DD-MM-YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Function to load reports using the Clerk user's email
  const loadReports = async () => {
    if (!email) {
      Alert.alert("Error", "User email not available");
      return;
    }
    setLoading(true);
    try {
      const reportsData = await fetchReports(email);
      setReports(reportsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Refresh control handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports().finally(() => setRefreshing(false));
  }, []);

  // Function to handle Pay button press
  const handlePayPress = (amount) => {
    Alert.alert("Payment", `You pressed Pay for $${amount}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Check if reports is an empty array */}
      {reports.length === 0 ? (
        <View style={styles.noFinesContainer}>
          <Text style={styles.noFinesText}>No fines found</Text>
        </View>
      ) : (
        reports.map((report) => (
          <View key={report._id} style={styles.reportCard}>
            <Text style={styles.description}>{report.description}</Text>
            <Text style={styles.status}>Status: {report.status}</Text>
            <Text style={styles.date}>Date: {formatDate(report.createdAt)}</Text>
            {report.status == "Unpaid" ? (
                <>
                <TouchableOpacity
              style={styles.payButton}
              onPress={() => handlePayPress(report.amount)}
            >
              <Text style={styles.payButtonText}>Pay ₹{report.amount}</Text>
            </TouchableOpacity>
            </>) : (
                <></>
            )
            }
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default Pay;

const styles = StyleSheet.create({
    container: {
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    noFinesContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    noFinesText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "gray",
    },
    reportCard: {
      backgroundColor: "#fff",
      padding: 16,
      marginVertical: 8,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    description: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
    },
    status: {
      fontSize: 14,
      marginBottom: 8,
    },
    date: {
      fontSize: 12,
      color: "gray",
      marginBottom: 16,
    },
    payButton: {
      backgroundColor: "#007bff",
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    payButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
  });