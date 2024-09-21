import { useUser } from "@clerk/clerk-expo"; // Clerk's user hook
import React, { useState, useEffect } from "react";
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
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { firebase } from '../../config.js';
import * as FileSystem from 'expo-file-system';

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
  buttoncontregContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  buttoncontinuereg: {
    backgroundColor: "#90EE90",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    width: "60%",
    marginTop: 20,
  },
  reguploaddoc: {
    backgroundColor: "#90EE90",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 25,
    alignItems: "center",
    width: "60%",
  },
  buttonRegisterText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
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
});

const Profile = () => {
  const [username, setUsername] = useState<string>("");
  const [firstname, setFirstName] = useState<string>("");
  const [lastname, setLastName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [vehicleno, setVehicleNumber] = useState<string>("");
  const [userFound, setUserFound] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useUser(); // Get user data from Clerk
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);

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
        `http://x.x.x.x:5000/checkemail/${email}`
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
      vehicleno
    };

    try {
      const res = await axios.post(
        `http://x.x.x.x:5000/profile`,
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
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
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
      <ScrollView contentContainerStyle={styles.scrollreg}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#00716F" />
        ) : userFound ? (
          isVerified ? ( // Check if the user is verified
            <>
              <Text style={styles.titleuserreg}>User details:</Text>
              <Text>User Name: {username}</Text>
              <Text>First Name: {firstname}</Text>
              <Text>Last Name: {lastname}</Text>
              <Text>Email: {email}</Text>
              <Text>Mobile: {mobile}</Text>
              <Text>Vehicle Number: {vehicleno}</Text>
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
