import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, Dimensions, ScrollView, Linking, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location'; // Import Location module
import { firebase } from '../../config.js';
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

const w = Dimensions.get('window').width;
const { height, width } = Dimensions.get('window');

const Report = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [transferred, setTransferred] = useState<number>(0);
  const [location, setLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number, longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [description, setDescription] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { user } = useUser();

  const email = user?.emailAddresses?.[0]?.emailAddress || "";


  const getLocation = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Error', 'Permission to access location was denied');
        return;
      }
  
      const loc = await Location.getCurrentPositionAsync({});
      setCoordinates({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  
      const newGoogleMapsUrl = `https://www.google.com/maps?q=${loc.coords.latitude},${loc.coords.longitude}`;
      setGoogleMapsUrl(newGoogleMapsUrl);
      console.log("Google Maps URL set:", newGoogleMapsUrl); // Add this log
  
      // Fetch address if needed
      const address = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      if (address && address.length > 0) {
        setLocation(`${address[0]?.city}, ${address[0]?.region}`);
      } else {
        setLocation(`Lat: ${loc.coords.latitude}, Lng: ${loc.coords.longitude}`);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Location Error', 'Unable to fetch location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const openInGoogleMaps = () => {
    if (coordinates) {
      const googleMapsUrl = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
      setGoogleMapsUrl(googleMapsUrl); // Store the Google Maps URL
      Linking.openURL(googleMapsUrl).catch((err) =>
        Alert.alert('Error', 'Unable to open Google Maps')
      );
    } else {
      Alert.alert('No Location', 'Please fetch your location first.');
    }
  };

  const checkVerification = async () => {
    try {
      const response = await axios.get(`http://camera-kaaval-backend.vercel.app/api/reports/is-verified`, {
        params: { email }
      });
      setVerified(response.data.isVerified);
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  useEffect(() => {
    if (email) {
      checkVerification();
    }
  }, [email]);

  useEffect(() => {
    if (imageUri) {
      getLocation();
    }
  }, [imageUri]);

  const onRefresh = useCallback(() => {
    setRefreshing(true); // Start refreshing
    checkVerification().finally(() => setRefreshing(false)); // End refreshing
  }, []);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permissions required', 'Please allow access to camera and gallery.');
        return false;
      }
      return true;
    } catch (error) {
      Alert.alert('Permission Error', 'Failed to request permissions.');
      return false;
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Camera Error', 'Failed to open camera.');
    }
  };

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
      Alert.alert('Gallery Error', 'Failed to open gallery.');
    }
  };

  const removeImage = () => {
    setImageUri(null);
    setLocation(null);
    setCoordinates(null); // Clear coordinates when image is removed
    setDescription(null);  // Clear description when image is removed
    setGoogleMapsUrl(null); // Clear Google Maps URL when image is removed
  };

  const submitReport = async () => {
    if (!imageUri) {
      Alert.alert("No image selected", "Please select an image to submit.");
      return;
    }
    if (!googleMapsUrl) {
      Alert.alert("Location not set", "Please fetch your location before submitting.");
      return;
    }
    if (!description || description.trim() === '') {
      Alert.alert("Description missing", "Please provide a description for the report.");
      return;
    }
  
    setUploading(true);
    setTransferred(0);
  
    try {
      const { uri } = await FileSystem.getInfoAsync(imageUri);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          console.error('Error in XMLHttpRequest:', e);
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
  
      const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
      const storageRef = firebase.storage().ref().child(`Report/${filename}`);
  
      const reportData = {
        location,
        coordinates: {
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        },
        googleMapsUrl,
        description,
        email
      };
  
      try {
        const res = await axios.post(`http://camera-kaaval-backend.vercel.app/api/reports/submit-report`, reportData);
        console.log("Response Data:", res.data);
  
        if (res.data && res.data.status === "ok") {
          // If status is "ok", proceed with image upload
          const uploadTask = storageRef.put(blob);
  
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setTransferred(progress);
            },
            (error) => {
              console.error('Upload failed:', error);
              Alert.alert('Upload failed', 'There was an error uploading the image.');
            },
            async () => {
              const downloadURL = await storageRef.getDownloadURL();
              console.log('Image available at:', downloadURL);
              
              // Update the report with the image URL
              try {
                await axios.post(`http://camera-kaaval-backend.vercel.app/api/reports/update-report-image`, {
                  email,
                  imageUrl: downloadURL
                });
                Alert.alert("Report submitted successfully with image.");
              } catch (e) {
                console.error("Error updating report with image:", e);
                Alert.alert("Report submitted, but failed to attach image.");
              }
            }
          );
        } else if (res.data && res.data.status === "info") {
          // If status is "info", don't upload the image
          Alert.alert(res.data.message);
        } else {
          Alert.alert("Unexpected response from server");
        }
      } catch (e) {
        Alert.alert("Error Occurred. Please check the information is correct!");
        console.error("Error:", e);
      } finally {
        removeImage(); // Clear image and related states after submission
        setUploading(false);
      }
    } catch (error) {
      console.error('Error during submission:', error);
      setUploading(false);
      Alert.alert('Submission error', 'Failed to submit the report.');
    }
  };

  if (!verified) {
    return (
      <ScrollView 
        contentContainerStyle={styles.containerrep}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.textrep}>Your account is not verified.</Text>
        <Text style={styles.licenserepdesc}>
          If you have updated your profile, wait for verification.
        </Text>
      </ScrollView>
    );
  }
  
  return (
    <View style={styles.containerrep}>
      <ScrollView 
        contentContainerStyle={styles.scrollrep}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View>
          <Text style={styles.textrep}>Want to photograph?</Text>
        </View>

        {/* Buttons container */}
        <View style={styles.buttonContainerrep}>
          <TouchableOpacity style={styles.iconButtonrep} onPress={openCamera}>
            <Ionicons name="camera" size={30} color="white" />
            <Text style={styles.iconText}>Open Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButtonrep} onPress={openGallery}>
            <Ionicons name="images" size={30} color="white" />
            <Text style={styles.iconText}>Open Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <>
            <View style={styles.imagecontainerrep}>
              <Image source={{ uri: imageUri }} style={styles.imagerep} />
              {loadingLocation ? (
                <View style={styles.loadinglocateContainer}>
                  <ActivityIndicator size="large" color="#0000ff" />
                  <Text style={styles.loadinglocateText}>Loading location...</Text>
                </View>
              ) : (
                <>
                  {location && (
                    <Text style={styles.locatetext}>
                      Location: <Text style={{ fontWeight: 'bold' }}>{location}</Text>
                    </Text>
                  )}
                  {coordinates && (
                    <Text style={styles.locatetext}>
                      Coordinates: <Text style={{ fontWeight: 'bold' }}>{coordinates.latitude}, {coordinates.longitude}</Text>
                    </Text>
                  )}
                  
                  <View style={styles.descriptionContainerrep}>
                    <TextInput
                      style={styles.descriptionInputrep}
                      placeholder="Provide a brief description of the situation..."
                      multiline={true}
                      numberOfLines={4}
                      onChangeText={(text) => setDescription(text)}
                      value={description}
                    />
                  </View>

                  <View style={styles.buttonContainerrep}>
                    <TouchableOpacity style={styles.locatebutton} onPress={openInGoogleMaps}>
                      <Text style={styles.locatebuttonText}>Open in Google Maps</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              <View style={styles.buttonContainerrep}>
                <TouchableOpacity style={styles.actionButton} onPress={submitReport}>
                  <Text style={styles.actionButtonText}>Submit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={removeImage}>
                  <Text style={styles.actionButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <View style={styles.descreport}>
          <Text style={styles.licensetxt}>Car License Plate</Text>
          <Text style={styles.licenserepdesc}>
            Make sure the car license plate is visible
          </Text>
        </View>

        <View style={styles.descreport}>
          <Text style={styles.licensetxt}>Car Image</Text>
          <Text style={styles.licenserepdesc}>
            Capture the entire car 
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerrep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textrep: {
    marginBottom: 40,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainerrep: {
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonrep: {
    flexDirection: 'row',
    backgroundColor: '#90EE90',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: 200,
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: '#90EE90',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
    width: 100,
    alignItems: 'center',
    marginTop:10,
  },
  actionButtonText: {
    color: 'black',
    fontSize: 16,
  },
  iconText: {
    color: 'black',
    fontSize: 16,
    marginLeft: 10,
  },
  imagerep: {
    width: 320,
    height: 200,
    borderRadius: 3,
    borderColor:'#000',
    borderWidth:5,
    alignItems:"center",
    paddingBottom:140,
  },
  descreport: {
    margin:"auto",
    borderRadius: 15,
    borderColor: '#000',
    borderWidth: 2,
    width: "80%",
    alignContent: "center",
    justifyContent:"space-between",
    marginBottom:25,
  },
  licensetxt: {
    margin: 5,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 17,
  },
  licenserepdesc: {
    margin: 5,
    fontSize: 15,
    display: "flex",
  },
  scrollrep:{
    flexGrow:1,
    paddingBottom: height * 0.08, 
    paddingVertical:20,
    
  },
  locatecontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locatetext: {
    fontSize: 16,
    marginTop: 20,
    paddingBottom:10,
  },
  locatebutton: {
    padding: 15,
    backgroundColor: '#90EE90',
    borderRadius: 10,
    width:"70%",
    alignItems:"center",
    alignContent:"center",
  },
  locatebuttonText: {
    color: 'black',
    fontSize: 18,
    textAlign:"center",
  },
  loadinglocateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadinglocateText: {
    fontSize: 18,
    marginTop: 10,
    color: '#90EE90',
  },
  descriptionContainerrep: {
    marginVertical: 15,  // Adds space above and below
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    width:"90%",
  },
  descriptionInputrep: {
    fontSize: 16,
    height: 100,  // Height increased to hold about 4 lines
    textAlignVertical: 'top',  // Ensures the text starts at the top
    color: '#333',
    backgroundColor: '#fff',
    padding: 10,
  },
});


export default Report;


