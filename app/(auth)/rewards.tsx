import { useUser } from "@clerk/clerk-expo";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";

const Rewards = () => {
  const { user } = useUser(); // Get the current user's information
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const email = user?.emailAddresses?.[0]?.emailAddress || "";


  // Function to fetch rewards from the backend
  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`http://camera-kaaval-backend.vercel.app/api/reward/rewards`, {
        email,
      });

      if (response.data.message === "No rewards yet") {
        setRewards([]); // Handle no rewards case
      } else {
        setRewards(response.data); // Set the rewards data
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching rewards.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // UseEffect to fetch rewards when the component mounts
  useEffect(() => {
    fetchRewards();
  }, []);

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRewards().finally(() => setRefreshing(false));
  }, []);

  // Loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00716F" />
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
      {rewards.length > 0 ? (
        rewards.map((reward) => (
          <View key={reward._id} style={styles.rewardCard}>
            <Text style={styles.rewardText}>Fine ID: {reward._id}</Text>
            <Text style={styles.rewardText}>
              Date: {new Date(reward.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.rewardText}>
              Description: {reward.description}
            </Text>
            {reward.status === "Paid" ? (
              <>
                <Text style={styles.rewardText}>
                  Updated at: {new Date(reward.updatedAt).toLocaleDateString()}.
                </Text>
                <Text style={styles.rewardTextCredit}>
                  ₹20 will be credited
                </Text>
              </>
            ) : (
              <Text style={styles.rewardTextPending}>Rewards pending</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.noRewardsText}>No rewards yet</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardCard: {
    backgroundColor: "#f8f8f8", // Light grey for box background
    borderColor: "#ddd", // Light grey border
    borderWidth: 1,
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    width: Dimensions.get("window").width * 0.9,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  rewardText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  rewardTextCredit: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green", // Green color for "₹20 will be credited"
    marginBottom: 8,
  },
  rewardTextPending: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red", // Red color for "Rewards pending"
    marginBottom: 8,
  },
  noRewardsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Rewards;
