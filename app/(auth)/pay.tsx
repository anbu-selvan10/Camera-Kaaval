import { useUser } from "@clerk/clerk-expo";
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
import {IP} from "@env";

const Pay = () => {
  const { user } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const email = user?.emailAddresses?.[0]?.emailAddress || "";



  const fetchReports = async (email) => {
    try {
      const response = await axios.post(
        `http://${IP}/api/payments/findFinesByEmail`,
        { email }
      );
      if (response.data.message === "No fines found for this email") {
        return [];
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      Alert.alert("Error", "Failed to load reports");
      return [];
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports().finally(() => setRefreshing(false));
  }, []);

  const handlePayPress = async (fineId, amount) => {
    Alert.alert("Payment", `You pressed Pay for ₹${amount}`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const response = await axios.post(`http://${IP}/api/payments/payFine`, {
        id: fineId, // Send the _id to the backend
      });

      if (response.data.message === "Fine status updated to Paid") {
        Alert.alert("Success", `Amount ₹${amount} paid successfully.`);
        loadReports(); // Refresh the reports to reflect the change
      } else {
        Alert.alert("Error", "Failed to update fine status");
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Failed to process payment");
    }
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {reports.length === 0 ? (
        <View style={styles.noFinesContainer}>
          <Text style={styles.noFinesText}>No fines found</Text>
        </View>
      ) : (
        reports.map((report) => (
          <View key={report._id} style={styles.reportCard}>
            <Text style={styles.description}>Fine Id: {report._id}</Text>
            <Text style={styles.description}>{report.description}</Text>
            <Text style={styles.status}>Status: {report.status}</Text>
            <Text style={styles.date}>Date: {formatDate(report.createdAt)}</Text>
            {report.status === "Unpaid" && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePayPress(report._id, report.amount)}
              >
                <Text style={styles.payButtonText}>Pay ₹{report.amount}</Text>
              </TouchableOpacity>
            )}
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