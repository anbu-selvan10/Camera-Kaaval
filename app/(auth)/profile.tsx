import { useUser } from "@clerk/clerk-expo";
import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { firebase } from "../../config.js";
import * as FileSystem from "expo-file-system";
import { IP } from "@env";


const { width: w } = Dimensions.get("window");

const styles = StyleSheet.create({
  pageregistercontainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titlescaleregister: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    marginBottom: 20,
  },
  titleregister: {
    flex: 1,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  backregister: {
    position: "absolute",
    left: 10,
    zIndex: 10,
  },
  registerusername: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#00716F",
    borderRadius: 23,
    paddingHorizontal: 10,
    paddingVertical: 2,
    width: "100%",
    marginVertical: 10,
  },
  titleuserreg: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  firstnametitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  lastnametitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  registernamescontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  registerfirstname: {
    flex: 1,
    marginRight: 10,
    marginTop: 20,
  },
  registerlastname: {
    flex: 1,
    marginLeft: 10,
    marginTop: 20,
  },
  registertextuser: {
    flex: 1,
    paddingHorizontal: 10,
  },
  reguploaddoc: {
    backgroundColor: "#90EE90",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    width: "80%", // Set width to a percentage of the screen width
    marginTop: 20, // Add margin for space between buttons
    width: w * 0.5, // 60% of screen width
    marginLeft: w * 0.2, // Center align by adding margin
  },
  buttoncontinuereg: {
    backgroundColor: "#90EE90",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    width: "80%", // Set width to a percentage of the screen width
    marginTop: 20, // Add margin for space between buttons
    width: w * 0.5, // 60% of screen width
    marginLeft: w * 0.2, // Center align by adding margin
  },
  buttonRegisterText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttoncontregContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  scrollreg: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#00716F",
  },
  titleuserreg: {
    fontSize: 24, // Increased font size for the title
    fontWeight: 'bold',
    marginBottom: 20, // Adds space below the title
    textAlign: 'center', // Centers the title
    color: '#00716F', // Text color
  },
  userDetailsText: {
    fontSize: 15, // Adjusted font size for user details
    marginBottom: 10, // Adds space between lines of user details
    color: '#333', // Dark color for text
  },
  userDetailContainer: {
    backgroundColor: '#fff', // White background for details container
    borderRadius: 10, // Rounded corners
    padding: 15, // Padding inside the container
    shadowColor: '#000', // Shadow color for the container
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 5, // Shadow blur radius
    elevation: 3, // Elevation for Android shadow effect
    marginBottom: 20, // Space between this container and next one
    width: w * 0.9, // Make the width 90% of the screen
  },
  activityIndicator: {
    marginTop: 20, // Adds space above the activity indicator
  },
  pageregistercontainer: {
    flex: 1,
    padding: 20, // Adds padding around the whole container
    backgroundColor: '#f5f5f5', // Background color for the container
  },
  scrollreg: {
    flexGrow: 1,
    justifyContent: 'center', // Centers content vertically when scrollview is short
  },
});

const Profile = () => {
  const [username, setUsername] = useState<string>("");
  const [firstname, setFirstName] = useState<string>("");
  const [lastname, setLastName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [vehicleno, setVehicleNumber] = useState<string>("");
  const [userFound, setUserFound] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUser();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Automatically populate email from Clerk
  const email = user?.emailAddresses?.[0]?.emailAddress || "";

  useEffect(() => {
    if (email) {
      checkEmail(); // Check if user exists when email is loaded
    }
  }, [email]);

  // Fetch user details if email exists in DB
  const checkEmail = async () => {
    setIsLoading(true); // Start loading

    try {
      const response = await axios.get(
        `http://${IP}/checkemail/${email}`
      );
      if (response.data.status === "exists") {
        const userData = response.data.data;
        setUsername(userData.username);
        setFirstName(userData.firstname);
        setLastName(userData.lastname);
        setMobile(userData.mobile);
        setVehicleNumber(userData.vehicleno);
        setIsVerified(userData.isVerified);
        setUserFound(true); // User found
      } else {
        setUserFound(false); // User not found
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setUserFound(false);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true); // Start refreshing
    checkEmail().finally(() => setRefreshing(false)); // End refreshing
  }, []);

  // Request permissions for gallery and camera
  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        Alert.alert(
          "Permissions required",
          "Please allow access to camera and gallery."
        );
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert("Permission Error", "Failed to request permissions.");
      return false;
    }
  };

  // Open image picker to choose an image from gallery
  const openGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Gallery Error", "Failed to open gallery.");
    }
  };

  // Handle profile update
  const updateProfile = async () => {
    const userData = {
      username,
      email,
      lastname,
      firstname,
      mobile,
      vehicleno,
    };

    try {
      const res = await axios.post(
        `http://${IP}/profile`,
        userData
      );
      console.log("Response Data:", res.data);
      if (res.data && res.data.status === "ok") {
        Alert.alert("Profile will be updated once verified!");
      }
    } catch (e) {
      // Check if the response indicates a duplicate username
      if (
        e.response &&
        e.response.data &&
        e.response.data.status === "erroruser"
      ) {
        Alert.alert("Username already exists");
      } else {
        Alert.alert("Error Occurred. Check every information is correct!");
        console.error("Error:", e);
      }
    }
  };

  const uploadImage = async () => {
    setUploading(true);

    try {
      const { uri } = await FileSystem.getInfoAsync(imageUri);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = () => {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const sanitizedEmail = String(email);
      const filename = `${sanitizedEmail}-proof`;

      const ref = firebase.storage().ref().child(`ProofImages/${filename}`);

      await ref.put(blob);
      setUploading(false);
      Alert.alert("Photo Uploaded");
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  return (
    <View style={styles.pageregistercontainer}>
      <ScrollView
        contentContainerStyle={styles.scrollreg}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#00716F" />
        ) : userFound ? (
          isVerified ? ( // Check if the user is verified
            <>
               <View style={styles.userDetailContainer}>
                  <Text style={styles.titleuserreg}>User details</Text>
                  <Text style={styles.userDetailsText}>User Name: {username}</Text>
                  <Text style={styles.userDetailsText}>First Name: {firstname}</Text>
                  <Text style={styles.userDetailsText}>Last Name: {lastname}</Text>
                  <Text style={styles.userDetailsText}>Email: {email}</Text>
                  <Text style={styles.userDetailsText}>Mobile: {mobile}</Text>
                  <Text style={styles.userDetailsText}>Vehicle Number: {vehicleno}</Text>
               </View>
            </>
          ) : (
            <Text style={styles.titleuserreg}>
              Profile is under verification.
            </Text>
          )
        ) : (
          <>
            {/* Add Username Field */}
            <Text style={styles.titleuserreg}>User Name</Text>
            <View style={styles.registerusername}>
              <AntDesign name="user" color="#00716F" size={24} />
              <TextInput
                style={styles.registertextuser}
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Form will only be displayed when user not found */}
            <Text style={styles.titleuserreg}>First Name</Text>
            <View style={styles.registerusername}>
              <AntDesign name="user" color="#00716F" size={24} />
              <TextInput
                style={styles.registertextuser}
                placeholder="First Name"
                value={firstname}
                onChangeText={setFirstName}
              />
            </View>

            <Text style={styles.titleuserreg}>Last Name</Text>
            <View style={styles.registerusername}>
              <AntDesign name="user" color="#00716F" size={24} />
              <TextInput
                style={styles.registertextuser}
                placeholder="Last Name"
                value={lastname}
                onChangeText={setLastName}
              />
            </View>

            <Text style={styles.titleuserreg}>Email Address</Text>
            <View style={styles.registerusername}>
              <AntDesign name="mail" color="#00716F" size={24} />
              <TextInput
                style={styles.registertextuser}
                placeholder="Enter your email"
                value={email}
                editable={false} // Make email read-only, since it's fetched from Clerk
              />
            </View>

            <Text style={styles.titleuserreg}>Phone Number</Text>
            <View style={styles.registerusername}>
              <AntDesign name="phone" color="#00716F" size={24} />
              <TextInput
                style={styles.registertextuser}
                placeholder="Enter your phone no"
                value={mobile}
                onChangeText={setMobile}
              />
            </View>

            <Text style={styles.titleuserreg}>Vehicle Number</Text>
            <View style={styles.registerusername}>
              <AntDesign name="car" color="#00716F" size={24} />
              <TextInput
                style={styles.registertextuser}
                placeholder="Enter your vehicle's license plate no"
                value={vehicleno}
                onChangeText={setVehicleNumber}
              />
            </View>

            <TouchableOpacity style={styles.reguploaddoc} onPress={openGallery}>
              <Text style={styles.buttonRegisterText}>Proof Image</Text>
            </TouchableOpacity>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            )}

            <TouchableOpacity style={styles.reguploaddoc} onPress={uploadImage}>
              <Text style={styles.buttonRegisterText}>Upload Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttoncontinuereg}
              onPress={updateProfile}
            >
              <Text style={styles.buttonRegisterText}>Update</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Profile;
