import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl, // Import RefreshControl
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";

const ReportComponent = () => {
  const { user } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing

  // Function to fetch reports
  const fetchReports = async () => {
    setLoading(true); // Start loading
    try {
      const email = user?.emailAddresses?.[0]?.emailAddress || "";
      const response = await axios.post(
        `http://camera-kaaval-backend.vercel.app/api/status/getReports`,
        {
          email: email,
        }
      );
      setReports(response.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const email = user?.emailAddresses?.[0]?.emailAddress || "";
      const response = await axios.post(
        `http://camera-kaaval-backend.vercel.app/api/status/getReports`,
        {
          email: email,
        }
      );
      setReports(response.data.reports);
    } catch (error) {
      console.error("Error refreshing reports:", error);
    } finally {
      setRefreshing(false); // End refreshing
    }
  };



  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  return (
        <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={  // Add RefreshControl to ScrollView
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : reports.length === 0 ? (
        <Text style={styles.noReportText}>No reports available.</Text>
      ) : (
        reports.map((report) => (
          <View key={report._id} style={styles.reportBox}>
            <Image source={{ uri: report.imageUrl }} style={styles.image} />
            <Text style={styles.text}>Location: {report.location}</Text>
            <Text style={styles.text}>Description: {report.description}</Text>
            <Text style={styles.text}>
              Date: {new Date(report.updatedAt).toLocaleDateString()}
            </Text>
            {report.isVerified ? (
              <>
              <Text style={styles.text}>Verified: 
              <Text style={styles.textYes}> Yes</Text>
              </Text>
              </>
            ) : (
              <>
              <Text style={styles.text}>Verified: 
              <Text style={styles.textNo}> No</Text>
              </Text>
              </>
            )}
            {report.status === "Pending" ? (<>
              <Text style={styles.text}>Status:
              <Text style={styles.textPend}> Pending </Text></Text>
            </>) : report.status === "Accepted" ? (
              <>
              <Text style={styles.text}>Status:
              <Text style={styles.textYes}> Accepted</Text></Text>
            </>
            ) : (
              <>
              <Text style={styles.text}>Status:
              <Text style={styles.textNo}> Rejected</Text></Text>
            </>
            )}
          </View>
        ))
      )}
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },
  noReportText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },
  reportBox: {
    width: "90%",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  textYes: {
    fontSize: 16,
    marginBottom: 5,
    color: 'green'
  },
  textNo: {
    fontSize: 16,
    marginBottom: 5,
    color: 'red'
  },
  textPend: {
    fontSize: 16,
    marginBottom: 5,
    color: '#FFBF00'
  },
});

export default ReportComponent;
